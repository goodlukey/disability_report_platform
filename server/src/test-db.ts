import pool from './db.js'

async function run() {
  const client = await pool.connect()

  try {
    // 1. 基本連線
    section('1. 基本連線')
    const { rows: [time] } = await client.query('SELECT NOW() AS now, current_database() AS db, current_user AS usr')
    ok(`連線成功`)
    log(`時間: ${time.now}`)
    log(`資料庫: ${time.db}`)
    log(`使用者: ${time.usr}`)

    // 2. 確認 reports 資料表存在
    section('2. 確認 reports 資料表')
    const { rows: tables } = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'reports'
    `)
    if (tables.length === 0) throw new Error('找不到 reports 資料表，請先執行 schema.sql')
    ok('reports 資料表存在')

    // 3. 確認欄位結構
    section('3. 確認欄位結構')
    const { rows: cols } = await client.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'reports'
      ORDER BY ordinal_position
    `)
    const expected = ['id', 'line', 'station', 'lat', 'lng', 'location_description', 'issue_description', 'image_urls', 'created_at']
    const actual = cols.map((c: { column_name: string }) => c.column_name)
    for (const col of expected) {
      if (!actual.includes(col)) throw new Error(`缺少欄位: ${col}`)
    }
    ok(`欄位正確: ${actual.join(', ')}`)

    // 4. INSERT 測試資料
    section('4. INSERT 測試資料')
    const { rows: [inserted] } = await client.query(`
      INSERT INTO reports (line, station, lat, lng, location_description, issue_description, image_urls)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `, ['板南線', '台北車站', 25.0478, 121.5173, 'M6 出口電梯', '電梯故障超過一週', ['https://example.com/test.jpg']])
    ok(`INSERT 成功，id: ${inserted.id}`)

    // 5. SELECT 測試資料
    section('5. SELECT 測試資料')
    const { rows: [fetched] } = await client.query('SELECT * FROM reports WHERE id = $1', [inserted.id])
    if (!fetched) throw new Error('找不到剛才插入的資料')
    ok(`SELECT 成功`)
    log(`路線: ${fetched.line} / 站名: ${fetched.station}`)
    log(`地點: ${fetched.location_description}`)
    log(`問題: ${fetched.issue_description}`)

    // 6. DELETE 測試資料（清除測試紀錄）
    section('6. DELETE 測試資料')
    await client.query('DELETE FROM reports WHERE id = $1', [inserted.id])
    const { rows: check } = await client.query('SELECT id FROM reports WHERE id = $1', [inserted.id])
    if (check.length > 0) throw new Error('DELETE 失敗')
    ok('DELETE 成功，測試資料已清除')

    console.log('\n✅ 全部測試通過\n')
    process.exit(0)
  } catch (err) {
    console.error('\n❌ 測試失敗:', err instanceof Error ? err.message : err, '\n')
    process.exit(1)
  } finally {
    client.release()
  }
}

function section(title: string) { console.log(`\n─── ${title} ───`) }
function ok(msg: string) { console.log(`  ✔ ${msg}`) }
function log(msg: string) { console.log(`    ${msg}`) }

run()
