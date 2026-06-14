// 康熙筆劃資料庫交叉驗證 — 眀燧科技 Siriis Labs
// 比對：Unihan kTotalStrokes（含手動override）vs breezyreeds/kangxi-strokecount
// 用法：node scripts/cross-validate-strokes.mjs

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── 1. 載入我們的資料庫（kangxi-strokes-full.js）──────────────
function loadOurDB() {
  const content = fs.readFileSync(path.join(ROOT, 'kangxi-strokes-full.js'), 'utf8');
  // Extract the object literal
  const match = content.match(/const KANGXI_STROKES_FULL = \{([\s\S]*?)\};/);
  if (!match) throw new Error('Cannot parse kangxi-strokes-full.js');
  // Parse key-value pairs: 'char':N
  const db = {};
  const re = /'([^']+)':(\d+)/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    db[m[1]] = parseInt(m[2]);
  }
  return db;
}

// ── 2. 載入手動 override 清單（從 generate script）──────────────
function loadManualOverrides() {
  const content = fs.readFileSync(path.join(ROOT, 'scripts', 'generate-kangxi-db.mjs'), 'utf8');
  const match = content.match(/const MANUAL_OVERRIDES = \{([\s\S]*?)\};/);
  if (!match) return new Set();
  const overrides = new Set();
  const re = /'([^']+)':\d+/g;
  let m;
  while ((m = re.exec(match[1])) !== null) {
    overrides.add(m[1]);
  }
  return overrides;
}

// ── 3. 載入 breezyreeds CSV ────────────────────────────────────
function loadBreedyReedsCSV(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8');
  const lines = content.split(/\r?\n/);
  const db = {};
  let skipped = 0;
  for (let i = 1; i < lines.length; i++) {  // skip header
    const line = lines[i].trim();
    if (!line) continue;
    const parts = line.split(',');
    if (parts.length < 4) { skipped++; continue; }
    // Format: CodePoint,Value,Character,Strokes
    const char = parts[2];
    const strokes = parseInt(parts[3]);
    if (!char || isNaN(strokes)) { skipped++; continue; }
    db[char] = strokes;
  }
  if (skipped > 0) console.log(`  (跳過 ${skipped} 行格式異常)`);
  return db;
}

// ── 4. 常見命名字清單 ──────────────────────────────────────────
// 從 generate-kangxi-db.mjs 的 MANUAL_OVERRIDES 中提取，加上其他常見命名字
const COMMON_NAME_CHARS = new Set([
  // 姓氏
  '陳','林','黃','李','張','王','吳','劉','楊','周','許','鄭','馮','蔡','蘇','葉','何','朱','邱','高',
  '梁','羅','賴','徐','莫','鄧','蕭','鍾','江','唐','洪','杜','韓','龔','阮','簡','程','曾','任','沈',
  '姚','彭','呂','蔣','田','范','石','董','章','馬','方','鄒','萬','趙','孫','胡','譚','顏','潘','袁',
  '盧','戴','邵','龍','史','賀','顧','侯',
  // 常見男名
  '明','偉','文','志','嘉','俊','浩','健','強','傑','信','仁','義','智','禮','安','樂','康','寧',
  '豪','軒','宇','翔','杰','鋒','慧','博','威','恩','廷','瑋','澄','丹','峻',
  '旭','昇','煦','燁','諾','霖','澤','駿','昌','旺','宏','廣','遠','深','正',
  // 常見女名
  '詩','嵐','怡','雅','婷','欣','妍','思','穎','玥','晴','心','美','麗','芳','莉','婉','琳','瑤','蕊',
  '蕙','萱','語','彤','晨','珊','珮','珍','珠','琴','瑞','璐','晶','昭',
  '熙','瑩','詠','芸','菁','蓮','蘭','薇','茵','瑜','璇',
  // 其他常見命名字
  '家','國','建','業','城','森','輝','勝','富','發','榮','盛','賢','達','捷','進',
  '春','夏','秋','冬','年','時','代','德','誠','忠','孝',
  '清','靜','柔','慈','善','真','純',
  '子','之','元','本','生','長','永','久',
  '睎','稀','晞','岑','芩',
  '中','大','小','天','地','山','水','木','火','金','土','日','月','星','雲',
  '鳳','鵬','鶴','燕','鳥','虎','牛','羊',
  // 額外常見字
  '俊','建','偉','佳','靖','凱','棠','棟','柏','桓','楓','楠','榕','樺','槿',
  '欣','歡','沛','泓','泰','洋','浚','淇','淳','渝','湘','源','漢','潔','澔',
  '炫','烈','然','煌','熊','璜','瑋','瑞','瑾','璟','璿','甜','皓','皙','盈',
  '睿','碧','祥','福','秀','程','穗','竹','筠','紫','緯','絢','維','翠','芷',
  '蔚','藍','蘭','衍','裕','貞','貴','賓','鈺','鈴','鉅','鐸','雪','霞','青',
  '靖','靚','韻','頤','颯','飛','馨','騰','鵑',
]);

// ── 5. 主比對邏輯 ─────────────────────────────────────────────
function main() {
  console.log('═'.repeat(60));
  console.log('康熙筆劃資料庫交叉驗證');
  console.log('═'.repeat(60));

  console.log('\n載入資料中...');
  const ourDB = loadOurDB();
  const manualOverrides = loadManualOverrides();
  const csvPath = path.join(ROOT, 'scripts', 'cache', 'kangxi-breezyreeds.csv');
  const breezyDB = loadBreedyReedsCSV(csvPath);

  console.log(`  我們的資料庫：${Object.keys(ourDB).length} 字`);
  console.log(`  手動 override：${manualOverrides.size} 字`);
  console.log(`  breezyreeds：${Object.keys(breezyDB).length} 字`);

  // 找出兩個資料庫都有的字
  const commonChars = Object.keys(ourDB).filter(c => breezyDB[c] !== undefined);
  console.log(`\n  共同覆蓋：${commonChars.length} 字`);

  // 比對
  const matches = [];
  const mismatches = [];
  const mismatchOverrides = [];   // 已在 override 但仍不一致
  const mismatchNameChars = [];   // 常見命名字不一致

  for (const char of commonChars) {
    const ours = ourDB[char];
    const theirs = breezyDB[char];
    if (ours === theirs) {
      matches.push(char);
    } else {
      const isOverride = manualOverrides.has(char);
      const isNameChar = COMMON_NAME_CHARS.has(char);
      const entry = { char, ours, theirs, isOverride, isNameChar, diff: theirs - ours };
      mismatches.push(entry);
      if (isOverride) mismatchOverrides.push(entry);
      if (isNameChar) mismatchNameChars.push(entry);
    }
  }

  // ── 統計 ────────────────────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log('【統計結果】');
  console.log('─'.repeat(60));
  const rate = (matches.length / commonChars.length * 100).toFixed(2);
  console.log(`✅ 一致：${matches.length} 字（${rate}%）`);
  console.log(`❌ 不一致：${mismatches.length} 字（${(100 - parseFloat(rate)).toFixed(2)}%）`);
  console.log(`   其中已有手動 override 但仍不一致：${mismatchOverrides.length} 字`);
  console.log(`   其中屬常見命名字：${mismatchNameChars.length} 字`);

  // ── 不一致分佈 ──────────────────────────────────────────────
  const diffDist = {};
  for (const e of mismatches) {
    const d = e.diff;
    diffDist[d] = (diffDist[d] || 0) + 1;
  }
  console.log('\n差異分佈（breezyreeds - 我們）：');
  Object.keys(diffDist).sort((a,b) => parseInt(a)-parseInt(b)).forEach(d => {
    const bar = '█'.repeat(Math.min(40, Math.round(diffDist[d]/mismatches.length*40)));
    console.log(`  ${d > 0 ? '+' : ''}${d}: ${diffDist[d]} 字  ${bar}`);
  });

  // ── 常見命名字不一致清單 ─────────────────────────────────────
  console.log('\n' + '─'.repeat(60));
  console.log(`【常見命名字不一致清單】（共 ${mismatchNameChars.length} 字）`);
  console.log('─'.repeat(60));
  console.log('字  | 我們 | breezyreeds | 差值 | 已override?');
  console.log('----+------+-------------+------+------------');
  mismatchNameChars.sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff)).forEach(e => {
    const mark = e.isOverride ? '✓ 已override' : '  ← 需確認';
    console.log(`${e.char}   |  ${String(e.ours).padStart(2)}  |  ${String(e.theirs).padStart(2)}           | ${e.diff > 0 ? '+' : ''}${e.diff}    | ${mark}`);
  });

  // ── 不一致的 override 字（可能 override 方向有誤？）─────────
  if (mismatchOverrides.length > 0) {
    console.log('\n' + '─'.repeat(60));
    console.log(`【已手動 override 但仍與 breezyreeds 不同】（${mismatchOverrides.length} 字）`);
    console.log('─'.repeat(60));
    mismatchOverrides.forEach(e => {
      console.log(`  ${e.char}: 我們=${e.ours}, breezyreeds=${e.theirs}`);
    });
  }

  // ── 輸出完整不一致清單到 CSV ──────────────────────────────────
  const csvOut = ['char,ours,breezyreeds,diff,is_manual_override,is_name_char'];
  for (const e of mismatches) {
    csvOut.push(`${e.char},${e.ours},${e.theirs},${e.diff},${e.isOverride},${e.isNameChar}`);
  }
  const outPath = path.join(ROOT, 'scripts', 'cache', 'stroke-mismatches.csv');
  fs.writeFileSync(outPath, '﻿' + csvOut.join('\n'), 'utf8');
  console.log(`\n📄 完整不一致清單已輸出：scripts/cache/stroke-mismatches.csv`);
  console.log('   （共 ' + mismatches.length + ' 筆，可用 Excel 開啟）');
}

main();
