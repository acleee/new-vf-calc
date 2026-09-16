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
    ref: value => ({ value }), computed: fn => ({ get value() { return fn() } }), onMounted: () => {},
    fetch, console,
  })
  vm.runInContext(script, context)
  return context
}

test('Exceed Gear uses integer levels and its UC multiplier', () => {
  const context = app()
  assert.equal(vm.runInContext('calculateVF({ level: 19.7, score: 9900000, grade: "S", lamp: "ULTIMATE CHAIN" }).toFixed(3)', context), '0.414')
})

test('Nabla uses decimal levels and its UC multiplier, with no MAXXIVE bonus', () => {
  const context = app()
  vm.runInContext('nablaVF.value = true', context)
  assert.equal(vm.runInContext('calculateVF({ level: 19.7, score: 9900000, grade: "S", lamp: "ULTIMATE CHAIN" }).toFixed(3)', context), '0.434')
  for (const lamp of ['MAXXIVE CLEAR', 'EXCESSIVE CLEAR']) {
    assert.equal(vm.runInContext(`calculateVF({ level: 19.7, score: 9900000, grade: "S", lamp: "${lamp}" }).toFixed(3)`, context), '0.417')
  }
})

test('switching modes re-ranks every chart, including charts outside the previous B50', () => {
  const context = app()
  vm.runInContext(`allScores.value = [
    ...Array.from({ length: 50 }, (_, i) => ({ chartID: i, level: 19, score: 9950000, grade: 'S', lamp: 'EXCESSIVE CLEAR' })),
    { chartID: 'decimal', level: 19.9, score: 9900000, grade: 'S', lamp: 'MAXXIVE CLEAR' },
  ]`, context)
  assert.equal(vm.runInContext('best50.value.length', context), 50)
  assert.equal(vm.runInContext('best50.value.some(row => row.chartID === "decimal")', context), false)
  vm.runInContext('nablaVF.value = true', context)
  assert.equal(vm.runInContext('best50.value[0].chartID', context), 'decimal')
  assert.equal(vm.runInContext('best50.value[0].level', context), 19.9)
  assert.equal(vm.runInContext('best50.value[0].lamp', context), 'EXCESSIVE CLEAR')
  assert.equal(vm.runInContext('totalVF.value.toFixed(3)', context), '20.217')
  vm.runInContext('nablaVF.value = false', context)
  assert.equal(vm.runInContext('best50.value.some(row => row.chartID === "decimal")', context), false)
  assert.equal(vm.runInContext('totalVF.value.toFixed(3)', context), '20.200')
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

test('maps.db results retain decimal levels for mode changes', async () => {
  const context = app()
  vm.runInContext('mdb.value = { "1": { mid: 1, title: "Test", artist: "Artist", difficulty: [1, 2, 3, 4, 19.7] } }', context)
  let remaining = true
  context.db = {
    exec: () => [{ values: [['hash', 'Test', 'Artist', '/sdvx/test', 4, 'MXM']] }],
    prepare: () => ({
      bind() {}, free() {},
      step() { const result = remaining; remaining = false; return result },
      getAsObject: () => ({ chart_hash: 'hash', score: 9900000, miss: 1, gauge_type: 1, gauge: 0.5 }),
    }),
  }
  await vm.runInContext('calculateFromDb(db, "test", "scores", "charts")', context)
  assert.equal(vm.runInContext('best50.value[0].level', context), 19)
  vm.runInContext('nablaVF.value = true', context)
  assert.equal(vm.runInContext('best50.value[0].level', context), 19.7)
  assert.equal(vm.runInContext('best50.value[0].vf.toFixed(3)', context), '0.417')
})

test('image exports use the selected mode and normalized lamp', async () => {
  let payload
  const context = app(async (_url, options) => {
    payload = JSON.parse(options.body)
    return { ok: true, blob: async () => ({}) }
  })
  context.URL = { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} }
  vm.runInContext('allScores.value = [{ level: 19.7, score: 9900000, grade: "S", lamp: "MAXXIVE CLEAR" }]', context)
  for (const mode of ['exceed', 'nabla']) {
    vm.runInContext(`nablaVF.value = ${mode === 'nabla'}`, context)
    await vm.runInContext('generateImage()', context)
    assert.equal(payload.mode, mode)
    assert.equal(payload.scores[0].lamp, 'EXCESSIVE CLEAR')
    assert.equal(payload.scores[0].level, mode === 'nabla' ? 19.7 : 19)
  }
  vm.runInContext('clearGeneratedImage()', context)
  assert.equal(vm.runInContext('generatedImageUrl.value', context), '')
})
