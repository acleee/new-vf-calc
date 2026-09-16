import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1]
  .replace(/^import .*$/gm, '')
  .replaceAll('import.meta.env.BASE_URL', '"/"')

function app(fetch = () => {}) {
  const context = vm.createContext({
    ref: value => ({ value }), computed: fn => fn, onMounted: () => {},
    fetch, console,
  })
  vm.runInContext(script, context)
  return context
}

test('Exceed Gear uses integer levels and its UC multiplier', () => {
  const context = app()
  assert.equal(vm.runInContext('calculateVF({ level: 19.7, score: 9900000, grade: "S", lamp: "ULTIMATE CHAIN" }).toFixed(3)', context), '0.414')
})

test('MAXXIVE has the same VF as EXCESSIVE', () => {
  const context = app()
  for (const lamp of ['MAXXIVE CLEAR', 'EXCESSIVE CLEAR']) {
    assert.equal(vm.runInContext(`calculateVF({ level: 19.7, score: 9900000, grade: "S", lamp: "${lamp}" })`, context), 0.402)
  }
  assert.equal(vm.runInContext('getLamp(9900000, 1, 1, 0.5)', context), 'EXCESSIVE CLEAR')
  assert.equal(vm.runInContext('getLamp(10000000, 0, 1, 1)', context), 'PERFECT ULTIMATE CHAIN')
})

test('Tachi imports normalize lamps before B50 ranking and exports', async () => {
  const context = app(async () => ({ json: async () => ({
    description: '',
    body: {
      charts: [{ chartID: 'maxxive', difficulty: 'MXM', data: { inGameID: 1 } },
        { chartID: 'excessive', difficulty: 'MXM', data: { inGameID: 1 } }],
      pbs: [{ chartID: 'maxxive', scoreData: { score: 9900000, grade: 'S', lamp: 'MAXXIVE CLEAR' } },
        { chartID: 'excessive', scoreData: { score: 9950000, grade: 'S', lamp: 'EXCESSIVE CLEAR' } }],
    },
  }) }))
  vm.runInContext('userId.value = "test"; mdb.value = { "1": { title: "Test", difficulty: [1, 2, 3, 4, 19.7] } }', context)
  await vm.runInContext('loadData()', context)
  const rows = JSON.parse(vm.runInContext('JSON.stringify(best50.value)', context))
  assert.equal(rows[0].chartID, 'excessive')
  assert.ok(rows.every(row => row.lamp === 'EXCESSIVE CLEAR' && row.level === 19))
  assert.equal(vm.runInContext('totalVF.value', context), 0.806)
})
