/**
 * 奇門遁甲定局引擎 — 拆補法
 * 第一步：陰陽遁判斷 + 局數計算
 * 眀燧科技 Siriis Labs · 風生水起 FengShui Oracle
 */

// ─── 24節氣局數對照表（陽陰互補驗證：X局 + 對應陰遁 = 10）──────
const JIEQI_JU = {
  '冬至': {yang:true,  shang:1, zhong:7, xia:4},
  '小寒': {yang:true,  shang:2, zhong:8, xia:5},
  '大寒': {yang:true,  shang:3, zhong:9, xia:6},
  '立春': {yang:true,  shang:8, zhong:5, xia:2},
  '雨水': {yang:true,  shang:9, zhong:6, xia:3},
  '驚蟄': {yang:true,  shang:1, zhong:7, xia:4},
  '春分': {yang:true,  shang:3, zhong:9, xia:6},
  '清明': {yang:true,  shang:4, zhong:1, xia:7},
  '穀雨': {yang:true,  shang:5, zhong:2, xia:8},
  '立夏': {yang:true,  shang:4, zhong:1, xia:7},
  '小滿': {yang:true,  shang:5, zhong:2, xia:8},
  '芒種': {yang:true,  shang:6, zhong:3, xia:9},
  '夏至': {yang:false, shang:9, zhong:3, xia:6},
  '小暑': {yang:false, shang:8, zhong:2, xia:5},
  '大暑': {yang:false, shang:7, zhong:1, xia:4},
  '立秋': {yang:false, shang:2, zhong:5, xia:8},
  '處暑': {yang:false, shang:1, zhong:4, xia:7},
  '白露': {yang:false, shang:9, zhong:3, xia:6},
  '秋分': {yang:false, shang:7, zhong:1, xia:4},
  '寒露': {yang:false, shang:6, zhong:9, xia:3},
  '霜降': {yang:false, shang:5, zhong:8, xia:2},
  '立冬': {yang:false, shang:6, zhong:9, xia:3},
  '小雪': {yang:false, shang:5, zhong:8, xia:2},
  '大雪': {yang:false, shang:4, zhong:7, xia:1}
};

// ─── 節氣定義（壽星公式係數 C，適用 21 世紀 2000–2099）────────
// day = floor((Y%100) * 0.2422 + C) − floor((Y%100) / 4)
// 年份跨 1900–1999 時自動切換 20 世紀係數
const JIEQI_DEF = [
  {name:'小寒',  month:1,  C21:5.4055,  C20:6.11},
  {name:'大寒',  month:1,  C21:20.12,   C20:20.84},
  {name:'立春',  month:2,  C21:3.87,    C20:4.60},
  {name:'雨水',  month:2,  C21:18.73,   C20:19.46},
  {name:'驚蟄',  month:3,  C21:6.11,    C20:6.78},
  {name:'春分',  month:3,  C21:20.84,   C20:21.51},
  {name:'清明',  month:4,  C21:5.13,    C20:5.59},
  {name:'穀雨',  month:4,  C21:20.4,    C20:20.888},
  {name:'立夏',  month:5,  C21:5.52,    C20:6.318},
  {name:'小滿',  month:5,  C21:21.04,   C20:21.86},
  {name:'芒種',  month:6,  C21:6.44,    C20:7.18},
  {name:'夏至',  month:6,  C21:21.21,   C20:21.92},
  {name:'小暑',  month:7,  C21:7.05,    C20:7.54},
  {name:'大暑',  month:7,  C21:22.61,   C20:23.13},
  {name:'立秋',  month:8,  C21:7.69,    C20:8.35},
  {name:'處暑',  month:8,  C21:23.05,   C20:23.95},
  {name:'白露',  month:9,  C21:8.44,    C20:9.09},
  {name:'秋分',  month:9,  C21:23.35,   C20:24.01},
  {name:'寒露',  month:10, C21:7.69,    C20:8.38},
  {name:'霜降',  month:10, C21:23.13,   C20:23.51},
  {name:'立冬',  month:11, C21:7.37,    C20:8.01},
  {name:'小雪',  month:11, C21:22.74,   C20:23.38},
  {name:'大雪',  month:12, C21:7.18,    C20:7.9},
  {name:'冬至',  month:12, C21:21.94,   C20:22.6}
];

// ─── 壽星公式：計算節氣落在某年的日子 ────────────────────────
function _calcJieqiDay(year, C21, C20) {
  const y = year % 100;
  const C = year >= 2000 ? C21 : C20;
  return Math.floor(y * 0.2422 + C) - Math.floor(y / 4);
}

// ─── 取得某年全部 24 節氣日期，回傳 [{name, date}] 排序陣列 ──
function getJieqiDates(year) {
  return JIEQI_DEF.map(jq => ({
    name: jq.name,
    date: new Date(year, jq.month - 1, _calcJieqiDay(year, jq.C21, jq.C20))
  })).sort((a, b) => a.date - b.date);
}

// ─── 儒略日（重用 index.html toJDN 邏輯）─────────────────────
function _toJDN(y, m, d) {
  const a = Math.floor((14 - m) / 12);
  const Y = y + 4800 - a;
  const M = m + 12 * a - 3;
  return d + Math.floor((153*M+2)/5) + 365*Y
         + Math.floor(Y/4) - Math.floor(Y/100) + Math.floor(Y/400) - 32045;
}

// ─── 核心：定局計算 ──────────────────────────────────────────
/**
 * 輸入公曆日期，輸出定局結果
 * @param {number} year  - 公曆年
 * @param {number} month - 公曆月 (1–12)
 * @param {number} day   - 公曆日
 * @returns {{
 *   jieqi:    string,   // 所屬節氣名
 *   yuan:     string,   // 上元 / 中元 / 下元
 *   ju:       number,   // 局數 1–9
 *   yang:     boolean,  // true=陽遁, false=陰遁
 *   daysDiff: number,   // 距離節氣交節日天數
 *   desc:     string    // 完整描述，如「陽遁二局」
 * } | null}
 */
function calcDingju(year, month, day) {
  // 取當年及前一年節氣（覆蓋跨年情況）
  const allJieqi = [
    ...getJieqiDates(year - 1),
    ...getJieqiDates(year)
  ].sort((a, b) => a.date - b.date);

  const targetDate = new Date(year, month - 1, day);

  // 找出最近一個 ≤ targetDate 的節氣
  let currentJq = null;
  for (let i = allJieqi.length - 1; i >= 0; i--) {
    if (allJieqi[i].date <= targetDate) {
      currentJq = allJieqi[i];
      break;
    }
  }
  if (!currentJq) return null;

  // 計算距節氣交節日天數（0 = 當天）
  const jqDate  = currentJq.date;
  const jqJDN   = _toJDN(jqDate.getFullYear(), jqDate.getMonth() + 1, jqDate.getDate());
  const daysDiff = _toJDN(year, month, day) - jqJDN;

  // 拆補法：每元 5 天
  let yuan, yuanKey;
  if      (daysDiff <= 4)  { yuan = '上元'; yuanKey = 'shang'; }
  else if (daysDiff <= 9)  { yuan = '中元'; yuanKey = 'zhong'; }
  else                     { yuan = '下元'; yuanKey = 'xia';   }

  const juData = JIEQI_JU[currentJq.name];
  if (!juData) return null;

  const JU_ZH = ['','一','二','三','四','五','六','七','八','九'];

  return {
    jieqi:    currentJq.name,
    yuan:     yuan,
    ju:       juData[yuanKey],
    yang:     juData.yang,
    daysDiff: daysDiff,
    desc:     `${juData.yang ? '陽' : '陰'}遁${JU_ZH[juData[yuanKey]]}局`
  };
}

// ─── 測試函數（console 驗算用）────────────────────────────────
function runDingjuTests() {
  const cases = [
    {y:2026, m:1,  d:5,  expect:'陽遁二局', note:'小寒後第0天，上元'},
    {y:2026, m:6,  d:22, expect:'陰遁九局', note:'夏至後第1天，上元'},
    {y:2026, m:1,  d:10, expect:'陽遁八局', note:'小寒後第5天，中元'},
    {y:2026, m:1,  d:15, expect:'陽遁五局', note:'小寒後第10天，下元'},
  ];

  console.group('奇門遁甲定局測試');
  for (const c of cases) {
    const r = calcDingju(c.y, c.m, c.d);
    const pass = r && r.desc === c.expect;
    console.log(
      `${pass ? '✅' : '❌'} ${c.y}-${c.m}-${c.d}`,
      `| 節氣:${r?.jieqi} 第${r?.daysDiff}天`,
      `| ${r?.yuan}`,
      `| 結果:${r?.desc}`,
      `| 預期:${c.expect}`,
      `| ${c.note}`
    );
  }
  console.groupEnd();
}

// ─── 第二步：地盤排列（三奇六儀入九宮）────────────────────────
const LIUYI  = ['戊','己','庚','辛','壬','癸'];   // 六儀，固定順序
const SANQI  = ['乙','丙','丁'];                   // 三奇，固定順序

/**
 * 排地盤（三奇六儀入九宮）
 * @param {boolean} yang - true=陽遁, false=陰遁
 * @param {number}  ju   - 局數 1–9
 * @returns {Object} { 1:'戊', 2:'己', … } 九宮各宮天干
 */
function buildDiPan(yang, ju) {
  const pan = {};

  // ── 六儀部分：從 ju 宮起，按陽順/陰逆走 6 個宮位 ──
  let palace = ju;
  for (let i = 0; i < 6; i++) {
    pan[palace] = LIUYI[i];
    palace = yang
      ? (palace % 9) + 1        // 順：9→1
      : ((palace - 2 + 9) % 9) + 1;  // 逆：1→9
  }

  // ── 三奇部分：填入剩餘 3 個宮位 ──
  // 陽遁：丁丙乙逆序填入（即 SANQI 反向）
  // 陰遁：乙丙丁順序填入（即 SANQI 正向）
  const sanqiOrder = yang ? [...SANQI].reverse() : SANQI;
  for (let i = 0; i < 3; i++) {
    pan[palace] = sanqiOrder[i];
    palace = yang
      ? (palace % 9) + 1
      : ((palace - 2 + 9) % 9) + 1;
  }

  return pan;
}

// ─── 地盤驗算 ─────────────────────────────────────────────────
function runDiPanTests() {
  const cases = [
    {
      label: '陽遁1局',
      yang: true, ju: 1,
      expect: {1:'戊',2:'己',3:'庚',4:'辛',5:'壬',6:'癸',7:'丁',8:'丙',9:'乙'}
    },
    {
      label: '陽遁2局',
      yang: true, ju: 2,
      expect: {1:'乙',2:'戊',3:'己',4:'庚',5:'辛',6:'壬',7:'癸',8:'丁',9:'丙'}
    },
    {
      label: '陰遁9局',
      yang: false, ju: 9,
      expect: {1:'丁',2:'丙',3:'乙',4:'癸',5:'壬',6:'辛',7:'庚',8:'己',9:'戊'}
    }
  ];

  const PALACE_NAME = {
    1:'坎(北)',2:'坤(西南)',3:'震(東)',4:'巽(東南)',
    5:'中',6:'乾(西北)',7:'兌(西)',8:'艮(東北)',9:'離(南)'
  };

  console.group('奇門遁甲地盤驗算');
  for (const c of cases) {
    const result = buildDiPan(c.yang, c.ju);
    const pass = [1,2,3,4,5,6,7,8,9].every(p => result[p] === c.expect[p]);
    const detail = [1,2,3,4,5,6,7,8,9]
      .map(p => {
        const ok = result[p] === c.expect[p];
        return `${ok ? '✓' : '✗'}${p}${PALACE_NAME[p].slice(0,1)}=${result[p]}`;
      }).join(' ');
    console.log(`${pass ? '✅' : '❌'} ${c.label}: ${detail}`);
    if (!pass) {
      console.table(
        [1,2,3,4,5,6,7,8,9].map(p => ({
          宮位: `${p} ${PALACE_NAME[p]}`,
          結果: result[p],
          預期: c.expect[p],
          符合: result[p] === c.expect[p] ? '✓' : '✗'
        }))
      );
    }
  }
  console.groupEnd();
  return cases.map(c => ({
    label: c.label,
    result: buildDiPan(c.yang, c.ju),
    pass: [1,2,3,4,5,6,7,8,9].every(p => buildDiPan(c.yang, c.ju)[p] === c.expect[p])
  }));
}

// ─── 模組匯出（瀏覽器全域 + ES module 兼容）─────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { calcDingju, getJieqiDates, JIEQI_JU, runDingjuTests, buildDiPan, runDiPanTests };
} else if (typeof window !== 'undefined') {
  window.QimenDingju = { calcDingju, getJieqiDates, JIEQI_JU, runDingjuTests, buildDiPan, runDiPanTests };
}
