/**
 * 奇門遁甲 步驟3–5 驗算腳本
 * 測試案例：2003-01-07 03:25（寅時）
 * 四柱：壬午 癸丑 庚辰 戊寅（時柱=戊寅）
 * 眀燧科技 Siriis Labs · 風生水起
 */
'use strict';

// ══════════════════════════════════════════════════════════════
// 引入已有邏輯
// ══════════════════════════════════════════════════════════════
const { calcDingju, buildDiPan } = require('./qimen-dingju.js');

// ══════════════════════════════════════════════════════════════
// 步驟3：完整60甲子分旬對照表
// ══════════════════════════════════════════════════════════════
console.log('\n');
console.log('═'.repeat(60));
console.log('【步驟3】建立完整60甲子分旬對照表');
console.log('═'.repeat(60));

const TIANGAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
const DIZHI   = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];

// 生成完整60甲子（按傳統順序）
const JIAZI_60 = [];
{
  let tgIdx = 0, dzIdx = 0;
  for (let i = 0; i < 60; i++) {
    JIAZI_60.push(TIANGAN[tgIdx] + DIZHI[dzIdx]);
    tgIdx = (tgIdx + 1) % 10;
    dzIdx = (dzIdx + 1) % 12;
  }
}

console.log('\n完整60甲子（按順序）：');
for (let i = 0; i < 60; i += 10) {
  console.log(`  ${String(i+1).padStart(2)}–${i+10}: ${JIAZI_60.slice(i, i+10).join(' ')}`);
}

// 6旬切分，每旬10個，以甲開頭
const XUN_NAMES  = ['甲子旬','甲戌旬','甲申旬','甲午旬','甲辰旬','甲寅旬'];
const XUN_LIUYI  = { '甲子旬':'戊', '甲戌旬':'己', '甲申旬':'庚',
                     '甲午旬':'辛', '甲辰旬':'壬', '甲寅旬':'癸' };

const XUN_MAP = {}; // 干支 → 旬名

console.log('\n六旬完整列表：');
for (let x = 0; x < 6; x++) {
  const xunName = XUN_NAMES[x];
  const members = JIAZI_60.slice(x * 10, x * 10 + 10);
  console.log(`  ${xunName}（旬空：${members[8]}${members[9]}，六儀：${XUN_LIUYI[xunName]}）`);
  console.log(`    ${members.join(' ')}`);
  members.forEach(gz => { XUN_MAP[gz] = xunName; });
}

// 驗算：確保60個干支全部分類、無重複、無遺漏
const allGz = Object.keys(XUN_MAP);
console.log(`\n  ✅ 共分類干支：${allGz.length} 個（應為60）`);

// 測試：戊寅屬於哪一旬？
const TEST_SHIZHU = '戊寅';
const xunOfShizhu = XUN_MAP[TEST_SHIZHU];
const liuyiOfShizhu = XUN_LIUYI[xunOfShizhu];
console.log(`\n  🔍 時柱「${TEST_SHIZHU}」→ 屬於：${xunOfShizhu}，對應六儀：${liuyiOfShizhu}`);

// ══════════════════════════════════════════════════════════════
// 步驟1+2（援引已有函數）：定局 + 地盤
// ══════════════════════════════════════════════════════════════
console.log('\n');
console.log('═'.repeat(60));
console.log('【前置】定局 + 地盤（援引已有函數驗算）');
console.log('═'.repeat(60));

const dingju = calcDingju(2003, 1, 7);
console.log(`\n  日期：2003-01-07（寅時）`);
console.log(`  節氣：${dingju.jieqi}，距交節 ${dingju.daysDiff} 天，${dingju.yuan}`);
console.log(`  結果：${dingju.desc}（yang=${dingju.yang}, ju=${dingju.ju}）`);

const diPan = buildDiPan(dingju.yang, dingju.ju);
const PALACE_NAMES = {
  1:'坎(北)', 2:'坤(西南)', 3:'震(東)', 4:'巽(東南)',
  5:'中',     6:'乾(西北)', 7:'兌(西)', 8:'艮(東北)', 9:'離(南)'
};
console.log('\n  地盤（三奇六儀入九宮）：');
for (let p = 1; p <= 9; p++) {
  console.log(`    ${p}宮 ${PALACE_NAMES[p].padEnd(7)}：${diPan[p]}`);
}

// ══════════════════════════════════════════════════════════════
// 步驟4：定值符、值使
// ══════════════════════════════════════════════════════════════
console.log('\n');
console.log('═'.repeat(60));
console.log('【步驟4】定值符值使');
console.log('═'.repeat(60));

// 九星固定基礎位
const JIUXING_BASE = {
  1:'天蓬', 2:'天芮', 3:'天衝', 4:'天輔', 5:'天禽',
  6:'天心', 7:'天柱', 8:'天任', 9:'天英'
};

// 八門固定基礎位
const BAMEN_BASE = {
  1:'休門', 2:'死門', 3:'傷門', 4:'杜門', 5:'（無）',
  6:'開門', 7:'驚門', 8:'生門', 9:'景門'
};

// 4-1. 時柱旬首六儀
console.log(`\n  4-1. 時柱「${TEST_SHIZHU}」旬首六儀：${liuyiOfShizhu}`);

// 4-2. 在地盤中找六儀所在宮位
let liuyiPalace = null;
for (let p = 1; p <= 9; p++) {
  if (diPan[p] === liuyiOfShizhu) { liuyiPalace = p; break; }
}
console.log(`  4-2. 六儀「${liuyiOfShizhu}」在地盤 → ${liuyiPalace}宮 ${PALACE_NAMES[liuyiPalace]}`);

// 4-3. 該宮固定九星 = 值符
const zhiFu = JIUXING_BASE[liuyiPalace];
console.log(`  4-3. ${liuyiPalace}宮固定九星（基礎位）→ 值符：${zhiFu}`);

// 4-4. 該宮固定八門 = 值使
const zhiShi = BAMEN_BASE[liuyiPalace];
console.log(`  4-4. ${liuyiPalace}宮固定八門（基礎位）→ 值使：${zhiShi}`);

// ══════════════════════════════════════════════════════════════
// 步驟5：排九星、排八門完整盤
// ══════════════════════════════════════════════════════════════
console.log('\n');
console.log('═'.repeat(60));
console.log('【步驟5】排九星、排八門完整天盤');
console.log('═'.repeat(60));

/**
 * 從起始宮位 startPalace 開始，按陽順/陰逆走，回傳 9 個宮位順序
 * （陽遁：1→2→3→4→5→6→7→8→9→1；陰遁：1→9→8→7→6→5→4→3→2→1）
 */
function palaceSequence(startPalace, yang) {
  const seq = [];
  let p = startPalace;
  for (let i = 0; i < 9; i++) {
    seq.push(p);
    p = yang ? (p % 9) + 1 : ((p - 2 + 9) % 9) + 1;
  }
  return seq;
}

// ── 時干、時支 ──────────────────────────────────────────────────
const shiGan = TEST_SHIZHU[0]; // 戊
const shiZhi = TEST_SHIZHU[1]; // 寅

// 時干在地盤的宮位（九星值符要搬去這個宮）
let shiGanPalace = null;
for (let p = 1; p <= 9; p++) {
  if (diPan[p] === shiGan) { shiGanPalace = p; break; }
}
console.log(`\n  5-0. 時干「${shiGan}」在地盤 → ${shiGanPalace}宮 ${PALACE_NAMES[shiGanPalace]}`);
console.log(`       ∴ 值符「${zhiFu}」從 ${liuyiPalace}宮 搬去 ${shiGanPalace}宮，九星隨之轉動`);

// 九星天盤排列
// 值符 天衝 搬去 shiGanPalace（時干宮），其餘星按陽順/陰逆相對順序排列
const JIUXING_CYCLE = [
  '天蓬','天芮','天衝','天輔','天禽','天心','天柱','天任','天英'
  //  1     2      3     4      5     6      7     8      9
];
const zhiFuBaseIdx = JIUXING_CYCLE.indexOf(zhiFu); // 天衝=2（0-based）

// 從時干宮起，按陽順/陰逆走9步
const palaceSeqXing = palaceSequence(shiGanPalace, dingju.yang);

const tianPanXing = {};
for (let i = 0; i < 9; i++) {
  const starIdx = (zhiFuBaseIdx + i) % 9;
  tianPanXing[palaceSeqXing[i]] = JIUXING_CYCLE[starIdx];
}

console.log('\n  九星天盤：');
console.log(`  （${dingju.yang ? '陽遁順行' : '陰遁逆行'}，值符 ${zhiFu} 落在 ${shiGanPalace}宮）`);
for (let p = 1; p <= 9; p++) {
  const isZhiFu = (p === shiGanPalace) ? ' ◀ 值符' : '';
  console.log(`    ${p}宮 ${PALACE_NAMES[p].padEnd(7)}：${tianPanXing[p]}${isZhiFu}`);
}

// 八門天盤排列（方案B：值使門跟時干，與九星邏輯一致）
// 值使門（傷門）搬去 shiGanPalace（時干宮），其餘7門從該宮按陽順/陰逆排列
// 八門循環順序（跳過5中）：1=休 2=死 3=傷 4=杜 6=開 7=驚 8=生 9=景
const BAMEN_CYCLE_NAMES   = ['休門','死門','傷門','杜門','開門','驚門','生門','景門'];
const BAMEN_CYCLE_PALACES = [1, 2, 3, 4, 6, 7, 8, 9]; // 跳過5中

const zhiShiBaseIdx = BAMEN_CYCLE_NAMES.indexOf(zhiShi); // 傷門=2（0-based）

// 從 shiGanPalace 起的9宮序列，過濾掉5中，得到8個宮的排列順序
const palaceSeqXingNo5 = palaceSeqXing.filter(p => p !== 5);
// palaceSeqXing 從 shiGanPalace(2) 起陽順：[2,3,4,5,6,7,8,9,1]
// 去掉5後：[2,3,4,6,7,8,9,1]

const tianPanMen = { 5: '（無）' };
for (let i = 0; i < 8; i++) {
  const menIdx = (zhiShiBaseIdx + i) % 8;
  tianPanMen[palaceSeqXingNo5[i]] = BAMEN_CYCLE_NAMES[menIdx];
}

const zhiShiPalace = shiGanPalace; // 值使與值符同宮

console.log('\n  八門天盤（方案B：值使跟時干宮）：');
console.log(`  （${dingju.yang ? '陽遁順行' : '陰遁逆行'}，值使 ${zhiShi} 落在 ${zhiShiPalace}宮）`);
for (let p = 1; p <= 9; p++) {
  const isZhiShi = (p === zhiShiPalace) ? ' ◀ 值使' : '';
  console.log(`    ${p}宮 ${PALACE_NAMES[p].padEnd(7)}：${tianPanMen[p]}${isZhiShi}`);
}

// ══════════════════════════════════════════════════════════════
// 綜合輸出：完整9宮一覽
// ══════════════════════════════════════════════════════════════
console.log('\n');
console.log('═'.repeat(60));
console.log('【總覽】完整9宮對照表');
console.log('═'.repeat(60));
console.log(`\n  定局：${dingju.desc} | 時柱：${TEST_SHIZHU} | 旬首六儀：${liuyiOfShizhu}`);
console.log(`  值符：${zhiFu}（${shiGanPalace}宮）| 值使：${zhiShi}（${zhiShiPalace}宮）`);
console.log(`  值符值使同宮：${shiGanPalace === zhiShiPalace ? '✅ 是（' + shiGanPalace + '宮）' : '❌ 否（' + shiGanPalace + '宮 vs ' + zhiShiPalace + '宮）'}\n`);
console.log('  宮位        地盤    九星(天盤)    八門(天盤)');
console.log('  ' + '─'.repeat(52));
for (let p = 1; p <= 9; p++) {
  const flag = (p === shiGanPalace) ? '← 值符+值使' : '';
  console.log(
    `  ${p}宮 ${PALACE_NAMES[p].padEnd(7)}  ${diPan[p]}      ${(tianPanXing[p]||'').padEnd(6)}  ${(tianPanMen[p]||'').padEnd(5)}  ${flag}`
  );
}

console.log('\n');
console.log('═'.repeat(60));
console.log('驗算完成');
console.log('═'.repeat(60));
console.log('\n');
