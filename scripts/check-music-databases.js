import { access } from 'node:fs/promises'

for (const filename of ['music_db.xml', '20250324_music_db.xml']) {
  try {
    await access(new URL(`../src/assets/${filename}`, import.meta.url))
  } catch {
    console.error(`Missing src/assets/${filename}. Add the music database before deploying.`)
    process.exit(1)
  }
}
