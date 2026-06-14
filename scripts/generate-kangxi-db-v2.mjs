// 生成康熙筆劃資料庫 v2 — 眀燧科技 Siriis Labs
// 底層來源：breezyreeds/kangxi-strokecount（康熙字典原文，非Unihan現代計法）
// 用法：node scripts/generate-kangxi-db-v2.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── 手動 override（僅記錄 breezyreeds 已知有誤的字）─────────
// 大量壓縮：舊有234個override係針對Unihan現代計法嘅修正，
// 改用breezyreeds後已內建正確康熙計法，唔需要再手動修正
// 如發現breezyreeds有誤，再逐個加入
const MANUAL_OVERRIDES = {
  // 例：如日後發現 breezyreeds 某字有誤，在此記錄
  // '字': 正確筆劃,  // 原因：xxx
};

// ── 解析 breezyreeds CSV ──────────────────────────────────────
function parseBreedyReedsCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const db = {};
  let headerFound = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('CodePoint,')) { headerFound = true; continue; }
    if (!headerFound) continue;

    const parts = trimmed.split(',');
    if (parts.length < 4) continue;

    const cpHex = parts[0]; // e.g. U+4E00
    const char = parts[2];
    const strokes = parseInt(parts[3]);

    if (!char || isNaN(strokes)) continue;

    // 只保留 CJK 主範圍 U+4E00-U+9FFF（20,902字）
    // 涵蓋絕大多數常用繁體字及命名用字
    const cp = parseInt(cpHex.replace('U+', ''), 16);
    if (cp >= 0x4E00 && cp <= 0x9FFF) {
      db[char] = strokes;
    }
  }

  return db;
}

// ── 生成 JS 檔案 ─────────────────────────────────────────────
function generateJS(data, totalCount) {
  const entries = Object.entries(data).sort(
    ([a], [b]) => a.codePointAt(0) - b.codePointAt(0)
  );

  const lines = [];
  for (let i = 0; i < entries.length; i += 20) {
    const chunk = entries.slice(i, i + 20);
    lines.push('  ' + chunk.map(([k, v]) => `'${k}':${v}`).join(','));
  }

  return `// 康熙字典筆劃完整資料庫 — 眀燧科技 Siriis Labs
// 自動生成：${new Date().toISOString().split('T')[0]}
// 資料來源：breezyreeds/kangxi-strokecount（康熙字典原文部首計法）
//           https://github.com/breezyreeds/kangxi-strokecount
// 計法說明：採康熙字典傳統部首筆劃（氵=4, 辶=7, 阝=8等）
// 總覆蓋：${totalCount} 字（CJK主範圍 U+4E00-U+9FFF）
// 使用方式：在 kangxi-data.js 之前載入此檔案

const KANGXI_STROKES_FULL = {
${lines.join(',\n')}
};
`;
}

// ── 主流程 ──────────────────────────────────────────────────
function main() {
  const csvPath = path.join(ROOT, 'scripts', 'cache', 'kangxi-breezyreeds.csv');
  if (!fs.existsSync(csvPath)) {
    console.error('找不到 breezyreeds CSV，請先執行：');
    console.error('  Invoke-WebRequest -Uri https://raw.githubusercontent.com/breezyreeds/kangxi-strokecount/master/kangxi-strokecount.csv -OutFile scripts/cache/kangxi-breezyreeds.csv');
    process.exit(1);
  }

  console.log('解析 breezyreeds CSV...');
  const breezyData = parseBreedyReedsCSV(csvPath);
  const breezyCount = Object.keys(breezyData).length;
  console.log(`breezyreeds（U+4E00-U+9FFF 範圍）：${breezyCount} 字`);

  // 合併：breezyreeds 為底，手動 override 優先
  const merged = { ...breezyData, ...MANUAL_OVERRIDES };
  const totalCount = Object.keys(merged).length;
  const overrideCount = Object.keys(MANUAL_OVERRIDES).length;
  console.log(`手動 override：${overrideCount} 字`);
  console.log(`合併後總計：${totalCount} 字`);

  // 驗證 7 個關鍵字
  const keyChars = {
    '王': 4, '珮': 11, '珊': 10, '岑': 7, '睎': 12, '琳': 13, '賢': 15
  };
  console.log('\n驗證 7 個關鍵字：');
  let allPass = true;
  for (const [ch, expected] of Object.entries(keyChars)) {
    const actual = merged[ch];
    const pass = actual === expected;
    if (!pass) allPass = false;
    console.log(`  ${ch}: ${actual} 劃 ${pass ? '✓' : `✗ (預期${expected})`}`);
  }
  if (!allPass) {
    console.warn('\n⚠️  部分關鍵字與預期不符，請檢查');
  }

  // 驗證 3 個測試案例（五格計算）
  const calcWuge = (chars) => {
    const strokes = chars.map(c => merged[c] || 0);
    const [s, n1, n2] = strokes;
    return {
      天格: s + 1,
      人格: s + n1,
      地格: n1 + n2,
      外格: n2 + 1,
      總格: s + n1 + n2,
      筆劃: strokes
    };
  };

  console.log('\n測試案例：');
  const t1 = calcWuge(['岑','睎','琳']);
  console.log(`  岑睎琳（筆劃${t1.筆劃}）：天${t1.天格}/人${t1.人格}/地${t1.地格}/外${t1.外格}/總${t1.總格}`);
  console.log(`    預期：天8/人19/地25/外14/總32 → ${t1.天格===8&&t1.人格===19&&t1.地格===25&&t1.外格===14&&t1.總格===32 ? '✓ 通過' : '✗ 失敗'}`);

  const t2 = calcWuge(['王','珮','珊']);
  console.log(`  王珮珊（筆劃${t2.筆劃}）：天${t2.天格}/人${t2.人格}/地${t2.地格}/外${t2.外格}/總${t2.總格}`);
  console.log(`    預期：天5/人15/地21/外11/總25 → ${t2.天格===5&&t2.人格===15&&t2.地格===21&&t2.外格===11&&t2.總格===25 ? '✓ 通過' : '✗ 失敗'}`);

  const t3 = calcWuge(['岑','雅','賢']);
  console.log(`  岑雅賢（筆劃${t3.筆劃}，賢=${merged['賢']}）：天${t3.天格}/人${t3.人格}/地${t3.地格}/外${t3.外格}/總${t3.總格}`);
  console.log(`    (breezyreeds賢=15，舊override賢=16，差異：地格${t3.地格}vs${t3.地格+1}，外格${t3.外格}vs${t3.外格+1}，總格${t3.總格}vs${t3.總格+1})`);

  // 生成 JS
  const jsContent = generateJS(merged, totalCount);
  const outPath = path.join(ROOT, 'kangxi-strokes-full.js');
  fs.writeFileSync(outPath, jsContent, 'utf8');

  const sizeBytes = fs.statSync(outPath).size;
  const sizeKB = (sizeBytes / 1024).toFixed(1);
  console.log(`\n✅ 生成完成：kangxi-strokes-full.js`);
  console.log(`   檔案大小：${sizeKB} KB（${sizeBytes.toLocaleString()} bytes）`);
  console.log(`   總覆蓋字數：${totalCount} 字`);
  console.log(`   來源：breezyreeds/kangxi-strokecount（康熙傳統計法）`);
}

main();
