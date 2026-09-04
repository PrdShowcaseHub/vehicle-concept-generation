// ============== 配置管理 / 配置组合方案 / LACU定义 Mock Data ==============
// 数据来源：量价功能原型（配置表版本管理、装备率分析、二段码映射）+
// 《产品配置组合作业指导书V4.0》《产品市场方案制定流程V2.0》《整车指标定义目标书V2.0》

// ---------- 1. 量价管理：标准配置原子库骨架 ----------
export const CONFIG_SKELETON = [
  { cat1: '基本信息', cat2: '能源类型', name: '能源类型', explain: '车辆动力类型', l1: '—', l2: '—', l3: '—' },
  { cat1: '基本信息', cat2: '性能参数', name: '百公里加速时间 (s)', explain: '手动填写类', l1: '7.6', l2: '7.9', l3: '8.5' },
  { cat1: '基本信息', cat2: '性能参数', name: '最高车速 (km/h)', explain: '手动填写类', l1: '180', l2: '175', l3: '170' },
  { cat1: '基本信息', cat2: '整车参数', name: '整备质量 (kg)', explain: '手动填写类', l1: '1895', l2: '1950', l3: '2010' },
  { cat1: '车身', cat2: '车身形态', name: '车身形态', explain: 'SUV/轿车/MPV', l1: 'SUV', l2: 'SUV', l3: 'SUV' },
  { cat1: '车身', cat2: '车身参数', name: '长 (mm)', explain: '手动填写类', l1: '4750', l2: '4780', l3: '4810' },
  { cat1: '车身', cat2: '车身参数', name: '轴距 (mm)', explain: '手动填写类', l1: '2900', l2: '2900', l3: '2900' },
  { cat1: '发动机/增程器', cat2: '发动机参数', name: '发动机型号', explain: '手动填写类', l1: '—', l2: '—', l3: '—' },
  { cat1: '发动机/增程器', cat2: '发动机参数', name: '发动机最大功率 (kW)', explain: '手动填写类', l1: '70', l2: '70', l3: '70' },
  { cat1: '电动机', cat2: '驱动电机参数', name: '驱动电机数', explain: '单/双/三/四电机', l1: '单电机', l2: '单电机', l3: '双电机' },
  { cat1: '电动机', cat2: '驱动电机参数', name: '电动机总功率 (kW)', explain: '手动填写类', l1: '175', l2: '175', l3: '320' },
  { cat1: '底盘/悬架', cat2: '悬架系统', name: '前悬架类型', explain: '—', l1: '麦弗逊', l2: '麦弗逊', l3: '双叉臂' },
  { cat1: '底盘/悬架', cat2: '悬架系统', name: '后悬架类型', explain: '—', l1: '多连杆', l2: '多连杆', l3: '多连杆' },
  { cat1: '智能/安全', cat2: '智能驾驶', name: 'L2 辅助驾驶', explain: '—', l1: '标配', l2: '选装', l3: '—' },
  { cat1: '智能/安全', cat2: '智能网联', name: '5G 车机', explain: '—', l1: '标配', l2: '标配', l3: '选装' },
  { cat1: '智能/安全', cat2: '座舱', name: '座椅通风/加热', explain: '—', l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热' },
]

// ---------- 2. 量价管理：车型清单（配置表版本 + 量价方案） ----------
export const CONFIG_CARS = {
  C798: {
    meta: { code: 'C798', name: '长安启源 C798', power: '增程 REEF', powerKey: '增程', level: '中大型SUV', engine: 'JL473QJ + 单电机', version: 'V2026.08', status: '生效中', date: '2026-08-20' },
    override: {
      '能源类型': { l1: '增程式混动（REEV）', l2: '增程式混动（REEV）', l3: '增程式混动（REEV）' },
      '百公里加速时间 (s)': { l1: '7.6', l2: '7.9', l3: '7.2' }, '最高车速 (km/h)': { l1: '180', l2: '175', l3: '180' },
      '整备质量 (kg)': { l1: '1895', l2: '1950', l3: '2050' }, '长 (mm)': { l1: '4750', l2: '4780', l3: '4810' },
      '发动机型号': { l1: 'JL473QJ', l2: 'JL473QJ', l3: 'JL473QJ' }, '发动机最大功率 (kW)': { l1: '70', l2: '70', l3: '70' },
      '驱动电机数': { l1: '单电机', l2: '单电机', l3: '双电机' }, '电动机总功率 (kW)': { l1: '175', l2: '175', l3: '320' },
      '前悬架类型': { l1: '麦弗逊', l2: '麦弗逊', l3: '双叉臂' }, 'L2 辅助驾驶': { l1: '标配', l2: '选装', l3: '—' },
      '5G 车机': { l1: '标配', l2: '标配', l3: '选装' }, '座椅通风/加热': { l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热' },
    },
    versions: [
      {
        ver: 'V2026.08', ms: 'KO', owner: '陈思远', status: '生效中', date: '2026-08-20',
        summary: '增加深蓝SL03Ultra配置项；调整主力车型MIX',
        change: {
          adds: ['全景天幕（Lev3 新增）', '前排座椅按摩（Lev2 增配）'],
          reduces: ['机械仪表（Lev1 减配，改全液晶）'],
          checks: [
            { dim: '① 用户需求洞察', level: 'LEV2', kind: '增配', reason: '用户调研显示座椅舒适性诉求上升', note: '需提供支撑材料' },
            { dim: '② 市场竞争变化', level: 'LEV1', kind: '减配', reason: '竞品已全系标配液晶仪表', note: '—' },
            { dim: '③ 公司战略牵引', level: 'LEV3', kind: '增配', reason: '高端化战略，提升溢价能力', note: '—' },
            { dim: '④ 降本增效', level: 'LEV1', kind: '减配', reason: '统一供应链降本', note: '—' },
          ],
        },
      },
      { ver: 'V2026.06', ms: 'FKO', owner: '陈思远', status: '已发布', date: '2026-06-15', summary: '初版配置表，基于EATP在研全量原子库', change: null },
      { ver: 'V2027.01', ms: 'CC', owner: '陈思远', status: '草稿', date: '—', summary: '—', change: null },
    ],
    price: {
      sales: [{ rows: [
        { level: 'Lev1', y25: 12000, y26: 15000, y27: 16000, y28: 15000, y29: 12000 },
        { level: 'Lev2', y25: 8000, y26: 10000, y27: 11000, y28: 10000, y29: 8000 },
        { level: 'Lev3', y25: 3000, y26: 5000, y27: 6000, y28: 5000, y29: 3000 }] }],
      mix: [{ rows: [
        { level: 'Lev1', y25: 50, y26: 52, y27: 53, y28: 52, y29: 50 },
        { level: 'Lev2', y25: 33, y26: 35, y27: 36, y28: 35, y29: 33 },
        { level: 'Lev3', y25: 17, y26: 13, y27: 11, y28: 13, y29: 17 }] }],
      std: [{ rows: [
        { level: 'Lev1', y25: 139800, y26: 138800, y27: 137800, y28: 138800, y29: 139800 },
        { level: 'Lev2', y25: 159800, y26: 158800, y27: 157800, y28: 158800, y29: 159800 },
        { level: 'Lev3', y25: 189800, y26: 188800, y27: 187800, y28: 188800, y29: 189800 }] }],
      options: [{ name: '智享选装包', content: '高阶智驾+空气悬架', range: 'Lev1/Lev2/Lev3', rows: [
        { level: 'Lev1', price: 8000, sales: 2000, rate: '15%' },
        { level: 'Lev2', price: 12000, sales: 3000, rate: '30%' },
        { level: 'Lev3', price: 20000, sales: 1500, rate: '25%' }] }],
    },
  },
  C857: {
    meta: { code: 'C857', name: '深蓝 SL03', power: '纯电 EV', powerKey: '纯电', level: '中型轿车', engine: '单/双电机（纯电）', version: 'V2026.08', status: '生效中', date: '2026-08-18' },
    override: {
      '能源类型': { l1: '纯电动（EV）', l2: '纯电动（EV）', l3: '纯电动（EV）' },
      '百公里加速时间 (s)': { l1: '5.9', l2: '6.2', l3: '6.5' }, '最高车速 (km/h)': { l1: '200', l2: '190', l3: '185' },
      '整备质量 (kg)': { l1: '1760', l2: '1820', l3: '1880' }, '车身形态': { l1: '轿车', l2: '轿车', l3: '轿车' },
      '长 (mm)': { l1: '4820', l2: '4820', l3: '4820' }, '轴距 (mm)': { l1: '2900', l2: '2900', l3: '2900' },
      '发动机型号': { l1: '—', l2: '—', l3: '—' }, '发动机最大功率 (kW)': { l1: '—', l2: '—', l3: '—' },
      '驱动电机数': { l1: '单电机', l2: '单电机', l3: '双电机' }, '电动机总功率 (kW)': { l1: '160', l2: '160', l3: '300' },
      '前悬架类型': { l1: '麦弗逊', l2: '麦弗逊', l3: '双叉臂' }, '后悬架类型': { l1: '多连杆', l2: 'H臂', l3: '多连杆' },
      'L2 辅助驾驶': { l1: '标配', l2: '标配', l3: '选装' }, '5G 车机': { l1: '标配', l2: '标配', l3: '标配' },
      '座椅通风/加热': { l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热' },
    },
    versions: [
      {
        ver: 'V2026.08', ms: 'KO', owner: '陈思远', status: '生效中', date: '2026-08-18',
        summary: '纯电平台配置统一；新增双电机性能版',
        change: {
          adds: ['双电机性能版（Lev3 新增）', '全系标配5G车机'],
          reduces: ['低配机械手刹（改电子驻车）'],
          checks: [
            { dim: '① 用户需求洞察', level: 'LEV3', kind: '增配', reason: '年轻用户对加速性能诉求', note: '需提供支撑材料' },
            { dim: '② 市场竞争变化', level: 'LEV1', kind: '减配', reason: '电子驻车已成行业标配', note: '—' },
            { dim: '③ 公司战略牵引', level: 'LEV2', kind: '增配', reason: '智能化战略落地', note: '—' },
            { dim: '④ 降本增效', level: '—', kind: '—', reason: '平台化共用降本', note: '—' },
          ],
        },
      },
      { ver: 'V2026.05', ms: 'FKO', owner: '陈思远', status: '已发布', date: '2026-05-20', summary: '纯电版初版配置表', change: null },
    ],
    price: {
      sales: [{ rows: [
        { level: 'Lev1', y25: 9000, y26: 11000, y27: 12000, y28: 11000, y29: 9000 },
        { level: 'Lev2', y25: 6000, y26: 7500, y27: 8000, y28: 7500, y29: 6000 },
        { level: 'Lev3', y25: 2000, y26: 3000, y27: 3500, y28: 3000, y29: 2000 }] }],
      mix: [{ rows: [
        { level: 'Lev1', y25: 53, y26: 54, y27: 55, y28: 54, y29: 53 },
        { level: 'Lev2', y25: 35, y26: 36, y27: 37, y28: 36, y29: 35 },
        { level: 'Lev3', y25: 12, y26: 10, y27: 8, y28: 10, y29: 12 }] }],
      std: [{ rows: [
        { level: 'Lev1', y25: 119800, y26: 118800, y27: 117800, y28: 118800, y29: 119800 },
        { level: 'Lev2', y25: 139800, y26: 138800, y27: 137800, y28: 138800, y29: 139800 },
        { level: 'Lev3', y25: 169800, y26: 168800, y27: 167800, y28: 168800, y29: 169800 }] }],
      options: [{ name: '性能选装包', content: '双电机+运动底盘', range: 'Lev3', rows: [
        { level: 'Lev3', price: 25000, sales: 1200, rate: '20%' }] }],
    },
  },
  C928: {
    meta: { code: 'C928', name: '长安 UNI-V', power: '插混 PHEV', powerKey: '插混', level: '紧凑型轿车', engine: 'JL473ZQ7 + 电机', version: 'V2026.06', status: '已发布', date: '2026-06-15' },
    override: {
      '能源类型': { l1: '插电式混动（PHEV）', l2: '插电式混动（PHEV）', l3: '插电式混动（PHEV）' },
      '百公里加速时间 (s)': { l1: '6.5', l2: '6.8', l3: '7.0' }, '最高车速 (km/h)': { l1: '185', l2: '180', l3: '180' },
      '整备质量 (kg)': { l1: '1530', l2: '1580', l3: '1620' }, '车身形态': { l1: '轿车', l2: '轿车', l3: '轿车' },
      '长 (mm)': { l1: '4680', l2: '4680', l3: '4680' }, '轴距 (mm)': { l1: '2750', l2: '2750', l3: '2750' },
      '发动机型号': { l1: 'JL473ZQ7', l2: 'JL473ZQ7', l3: 'JL473ZQ7' }, '发动机最大功率 (kW)': { l1: '125', l2: '125', l3: '125' },
      '驱动电机数': { l1: '单电机', l2: '单电机', l3: '双电机' }, '电动机总功率 (kW)': { l1: '158', l2: '158', l3: '290' },
      '前悬架类型': { l1: '麦弗逊', l2: '麦弗逊', l3: '麦弗逊' }, '后悬架类型': { l1: '扭力梁', l2: '多连杆', l3: '多连杆' },
      'L2 辅助驾驶': { l1: '选装', l2: '标配', l3: '—' }, '5G 车机': { l1: '标配', l2: '标配', l3: '选装' },
      '座椅通风/加热': { l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热' },
    },
    versions: [
      {
        ver: 'V2026.06', ms: 'FKO', owner: '陈思远', status: '已发布', date: '2026-06-15',
        summary: '插混版初版配置表',
        change: {
          adds: ['后多连杆独立悬架（Lev2 增配）'], reduces: ['低配扭力梁保留'],
          checks: [
            { dim: '① 用户需求洞察', level: 'LEV2', kind: '增配', reason: '操控诉求提升', note: '需提供支撑材料' },
            { dim: '② 市场竞争变化', level: 'LEV1', kind: '—', reason: '竞品插混价格下探', note: '—' },
            { dim: '③ 公司战略牵引', level: '—', kind: '—', reason: '轿车序列年轻化', note: '—' },
            { dim: '④ 降本增效', level: 'LEV1', kind: '—', reason: '—', note: '—' },
          ],
        },
      },
      { ver: 'V2026.03', ms: 'FKO', owner: '陈思远', status: '已退回', date: '2026-03-10', summary: '配置宽度不足被退回', change: null },
    ],
    price: {
      sales: [{ rows: [
        { level: 'Lev1', y25: 7000, y26: 8000, y27: 8500, y28: 8000, y29: 7000 },
        { level: 'Lev2', y25: 5000, y26: 6000, y27: 6500, y28: 6000, y29: 5000 },
        { level: 'Lev3', y25: 1500, y26: 2000, y27: 2200, y28: 2000, y29: 1500 }] }],
      mix: [{ rows: [
        { level: 'Lev1', y25: 52, y26: 53, y27: 54, y28: 53, y29: 52 },
        { level: 'Lev2', y25: 37, y26: 38, y27: 39, y28: 38, y29: 37 },
        { level: 'Lev3', y25: 11, y26: 9, y27: 7, y28: 9, y29: 11 }] }],
      std: [{ rows: [
        { level: 'Lev1', y25: 109800, y26: 108800, y27: 107800, y28: 108800, y29: 109800 },
        { level: 'Lev2', y25: 129800, y26: 128800, y27: 127800, y28: 128800, y29: 129800 },
        { level: 'Lev3', y25: 149800, y26: 148800, y27: 147800, y28: 148800, y29: 149800 }] }],
      options: [{ name: '运动选装包', content: '尾翼+排气声浪', range: 'Lev2/Lev3', rows: [
        { level: 'Lev2', price: 5000, sales: 1800, rate: '18%' },
        { level: 'Lev3', price: 8000, sales: 900, rate: '22%' }] }],
    },
  },
  C673: {
    meta: { code: 'C673', name: '长安 CS75PLUS', power: '燃油 GAS', powerKey: '燃油', level: '紧凑型SUV', engine: 'JL476ZQ5', version: 'V2026.08', status: '生效中', date: '2026-08-12' },
    override: {
      '能源类型': { l1: '燃油（GAS）', l2: '燃油（GAS）', l3: '燃油（GAS）' },
      '百公里加速时间 (s)': { l1: '8.5', l2: '9.0', l3: '9.5' }, '最高车速 (km/h)': { l1: '190', l2: '185', l3: '180' },
      '整备质量 (kg)': { l1: '1580', l2: '1620', l3: '1660' }, '车身形态': { l1: 'SUV', l2: 'SUV', l3: 'SUV' },
      '长 (mm)': { l1: '4690', l2: '4690', l3: '4690' }, '轴距 (mm)': { l1: '2710', l2: '2710', l3: '2710' },
      '发动机型号': { l1: 'JL476ZQ5', l2: 'JL476ZQ5', l3: 'JL476ZQ5' }, '发动机最大功率 (kW)': { l1: '138', l2: '138', l3: '138' },
      '驱动电机数': { l1: '—', l2: '—', l3: '—' }, '电动机总功率 (kW)': { l1: '—', l2: '—', l3: '—' },
      '前悬架类型': { l1: '麦弗逊', l2: '麦弗逊', l3: '麦弗逊' }, '后悬架类型': { l1: '多连杆', l2: '多连杆', l3: '多连杆' },
      'L2 辅助驾驶': { l1: '选装', l2: '选装', l3: '标配' }, '5G 车机': { l1: '选装', l2: '标配', l3: '标配' },
      '座椅通风/加热': { l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热' },
    },
    versions: [
      {
        ver: 'V2026.08', ms: 'KO', owner: '陈思远', status: '生效中', date: '2026-08-12',
        summary: '燃油版年度改款，L2下探至中配',
        change: {
          adds: ['L2辅助驾驶（Lev3 标配）', '5G车机（Lev2 标配）'], reduces: ['低配小屏（改中控大屏）'],
          checks: [
            { dim: '① 用户需求洞察', level: 'LEV3', kind: '增配', reason: '安全配置诉求', note: '需提供支撑材料' },
            { dim: '② 市场竞争变化', level: 'LEV2', kind: '增配', reason: '竞品智能化内卷', note: '—' },
            { dim: '③ 公司战略牵引', level: '—', kind: '—', reason: '燃油车维稳', note: '—' },
            { dim: '④ 降本增效', level: 'LEV1', kind: '减配', reason: '屏幕供应商整合', note: '—' },
          ],
        },
      },
      { ver: 'V2026.02', ms: 'FKO', owner: '陈思远', status: '已发布', date: '2026-02-15', summary: '燃油版年度配置表', change: null },
    ],
    price: {
      sales: [{ rows: [
        { level: 'Lev1', y25: 15000, y26: 14000, y27: 13000, y28: 12000, y29: 10000 },
        { level: 'Lev2', y25: 11000, y26: 10000, y27: 9500, y28: 9000, y29: 8000 },
        { level: 'Lev3', y25: 4000, y26: 3800, y27: 3500, y28: 3200, y29: 3000 }] }],
      mix: [{ rows: [
        { level: 'Lev1', y25: 51, y26: 50, y27: 49, y28: 48, y29: 45 },
        { level: 'Lev2', y25: 37, y26: 37, y27: 37, y28: 37, y29: 38 },
        { level: 'Lev3', y25: 12, y26: 13, y27: 14, y28: 15, y29: 17 }] }],
      std: [{ rows: [
        { level: 'Lev1', y25: 109900, y26: 108900, y27: 107900, y28: 106900, y29: 105900 },
        { level: 'Lev2', y25: 129900, y26: 128900, y27: 127900, y28: 126900, y29: 125900 },
        { level: 'Lev3', y25: 149900, y26: 148900, y27: 147900, y28: 146900, y29: 145900 }] }],
      options: [{ name: '舒适选装包', content: '座椅通风+氛围灯', range: 'Lev1/Lev2', rows: [
        { level: 'Lev1', price: 4000, sales: 3000, rate: '20%' },
        { level: 'Lev2', price: 6000, sales: 2500, rate: '25%' }] }],
    },
  },
  C363: {
    meta: { code: 'C363', name: '欧尚 Z6', power: '油混 HEV', powerKey: '油混', level: '紧凑型SUV', engine: 'JL473QJ + 电机', version: 'V2026.04', status: '已退回', date: '2026-04-10' },
    override: {
      '能源类型': { l1: '非插电式混动（HEV）', l2: '非插电式混动（HEV）', l3: '非插电式混动（HEV）' },
      '百公里加速时间 (s)': { l1: '7.9', l2: '8.2', l3: '8.5' }, '最高车速 (km/h)': { l1: '175', l2: '170', l3: '170' },
      '整备质量 (kg)': { l1: '1620', l2: '1660', l3: '1700' }, '车身形态': { l1: 'SUV', l2: 'SUV', l3: 'SUV' },
      '长 (mm)': { l1: '4690', l2: '4690', l3: '4690' }, '轴距 (mm)': { l1: '2795', l2: '2795', l3: '2795' },
      '发动机型号': { l1: 'JL473QJ', l2: 'JL473QJ', l3: 'JL473QJ' }, '发动机最大功率 (kW)': { l1: '130', l2: '130', l3: '130' },
      '驱动电机数': { l1: '单电机', l2: '单电机', l3: '单电机' }, '电动机总功率 (kW)': { l1: '130', l2: '130', l3: '130' },
      '前悬架类型': { l1: '麦弗逊', l2: '麦弗逊', l3: '麦弗逊' }, '后悬架类型': { l1: '多连杆', l2: '多连杆', l3: '多连杆' },
      'L2 辅助驾驶': { l1: '选装', l2: '标配', l3: '—' }, '5G 车机': { l1: '选装', l2: '标配', l3: '标配' },
      '座椅通风/加热': { l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热' },
    },
    versions: [
      { ver: 'V2026.04', ms: 'FKO', owner: '陈思远', status: '已退回', date: '2026-04-10', summary: '配置宽度设定不全，缺少趋势配置项', change: null },
    ],
    price: {
      sales: [{ rows: [
        { level: 'Lev1', y25: 6000, y26: 5000, y27: 4000, y28: 3000, y29: 2000 },
        { level: 'Lev2', y25: 4000, y26: 3500, y27: 3000, y28: 2500, y29: 2000 },
        { level: 'Lev3', y25: 1000, y26: 800, y27: 700, y28: 600, y29: 500 }] }],
      mix: [{ rows: [
        { level: 'Lev1', y25: 55, y26: 54, y27: 53, y28: 52, y29: 50 },
        { level: 'Lev2', y25: 33, y26: 34, y27: 35, y28: 36, y29: 38 },
        { level: 'Lev3', y25: 12, y26: 12, y27: 12, y28: 12, y29: 12 }] }],
      std: [{ rows: [
        { level: 'Lev1', y25: 99900, y26: 98900, y27: 97900, y28: 96900, y29: 95900 },
        { level: 'Lev2', y25: 119900, y26: 118900, y27: 117900, y28: 116900, y29: 115900 },
        { level: 'Lev3', y25: 139900, y26: 138900, y27: 137900, y28: 136900, y29: 135900 }] }],
      options: [{ name: '智驾选装包', content: '高速NOA', range: 'Lev2', rows: [
        { level: 'Lev2', price: 10000, sales: 800, rate: '16%' }] }],
    },
  },
  C390: {
    meta: { code: 'C390', name: '深蓝 G318', power: '增程 REEV', powerKey: '增程', level: '硬派SUV', engine: 'JL469ZQ1 + 电机', version: 'V2027.01', status: '草稿', date: '—' },
    override: {
      '能源类型': { l1: '增程式混动（REEV）', l2: '增程式混动（REEV）', l3: '增程式混动（REEV）' },
      '百公里加速时间 (s)': { l1: '6.0', l2: '6.3', l3: '6.8' }, '最高车速 (km/h)': { l1: '185', l2: '180', l3: '180' },
      '整备质量 (kg)': { l1: '2150', l2: '2200', l3: '2250' }, '车身形态': { l1: '硬派SUV', l2: '硬派SUV', l3: '硬派SUV' },
      '长 (mm)': { l1: '5010', l2: '5010', l3: '5010' }, '轴距 (mm)': { l1: '2880', l2: '2880', l3: '2880' },
      '发动机型号': { l1: 'JL469ZQ1', l2: 'JL469ZQ1', l3: 'JL469ZQ1' }, '发动机最大功率 (kW)': { l1: '110', l2: '110', l3: '110' },
      '驱动电机数': { l1: '单电机', l2: '双电机', l3: '三电机' }, '电动机总功率 (kW)': { l1: '200', l2: '316', l3: '430' },
      '前悬架类型': { l1: '双叉臂', l2: '双叉臂', l3: '双叉臂' }, '后悬架类型': { l1: '多连杆', l2: '多连杆', l3: '整体桥' },
      'L2 辅助驾驶': { l1: '标配', l2: '标配', l3: '标配' }, '5G 车机': { l1: '标配', l2: '标配', l3: '标配' },
      '座椅通风/加热': { l1: '前排加热', l2: '前排通风加热', l3: '全车通风加热+按摩' },
    },
    versions: [
      { ver: 'V2027.01', ms: 'CC', owner: '陈思远', status: '草稿', date: '—', summary: '—', change: null },
    ],
    price: {
      sales: [{ rows: [
        { level: 'Lev1', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' },
        { level: 'Lev2', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' },
        { level: 'Lev3', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' }] }],
      mix: [{ rows: [
        { level: 'Lev1', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' },
        { level: 'Lev2', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' },
        { level: 'Lev3', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' }] }],
      std: [{ rows: [
        { level: 'Lev1', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' },
        { level: 'Lev2', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' },
        { level: 'Lev3', y25: '—', y26: '—', y27: '—', y28: '—', y29: '—' }] }],
      options: [{ name: '越野选装包', content: '差速锁+AT胎', range: 'Lev3', rows: [
        { level: 'Lev3', price: '—', sales: '—', rate: '—' }] }],
    },
  },
}

// ---------- 3. 装备率分析 ----------
// sampleCount（样本车型数）= 装备率统计分母：当前细分市场+价格段下纳入统计的全部在售车型型号数，不同配置存在微小样本差异（按配置有效样本统计）
export const EQUIP_DATA = [
  { name: '全景天窗', category: '基础', sampleCount: 23, y24: 78, y25: 82, y26: 85 },
  { name: '电动尾门', category: '基础', sampleCount: 21, y24: 68, y25: 73, y26: 76 },
  { name: 'L2辅助驾驶', category: '基础', sampleCount: 24, y24: 52, y25: 62, y26: 68 },
  { name: 'LED矩阵大灯', category: '差异', sampleCount: 20, y24: 38, y25: 42, y26: 48 },
  { name: '座椅通风', category: '差异', sampleCount: 22, y24: 35, y25: 38, y26: 42 },
  { name: 'HUD抬头显示', category: '趋势', sampleCount: 19, y24: 12, y25: 16, y26: 22 },
  { name: '无线充电', category: '趋势', sampleCount: 25, y24: 14, y25: 18, y26: 25 },
  { name: '5G车机', category: '趋势', sampleCount: 18, y24: 5, y25: 10, y26: 18 },
]

export const EQUIP_CANDIDATES = [
  '空气悬架', '激光雷达', '后轮转向', '车载冰箱', '魔毯悬架', 'AR-HUD', '800V高压平台',
  '全景天幕', '电动侧踏板', '流媒体后视镜', '前排座椅按摩', '三联屏', '21寸轮毂', '对外放电(V2L)',
]

// ---------- 4. 二段码映射 ----------
export const CODE_MAPPING = [
  { code: 'CFG-001', name: '全景天窗(标配)', tcode: '2C-001', tname: '全景天窗总成', status: '一对一', reason: '' },
  { code: 'CFG-002', name: '全景天窗(选装)', tcode: '2C-001', tname: '全景天窗总成', status: '多对一', reason: '选装与标配共用二段码' },
  { code: 'CFG-003', name: '电动尾门', tcode: '2E-005', tname: '电动尾门模块', status: '一对一', reason: '' },
  { code: 'CFG-004', name: 'LED矩阵大灯', tcode: '2L-012', tname: '前大灯总成', status: '多对一', reason: '与普通LED灯共用总成码' },
  { code: 'CFG-005', name: '座椅通风', tcode: '2S-028', tname: '座椅通风模块', status: '一对一', reason: '' },
  { code: 'CFG-006', name: 'HUD抬头显示', tcode: '', tname: '', status: '未映射', reason: '' },
  { code: 'CFG-007', name: '无线充电', tcode: '2P-015', tname: '无线充电模块', status: '一对一', reason: '' },
  { code: 'CFG-008', name: 'L2辅助驾驶', tcode: '2A-003', tname: '辅助驾驶域控', status: '多对一', reason: 'L2/L2+共用域控二段码' },
]

export const CODE_OPTIONS = ['2C-001 全景天窗总成', '2E-005 电动尾门模块', '2L-012 前大灯总成', '2S-028 座椅通风模块',
  '2P-015 无线充电模块', '2A-003 辅助驾驶域控', '2H-009 HUD总成', '2W-011 无线充电面板', '2M-004 流媒体后视镜']

// ---------- 5. 配置组合方案 ----------
// 量价方案承接摘要（《产品市场方案制定流程V2.0》活动2.1 输出，配置组合方案（活动2.2）的输入）
// 量价组合定义 = 车型数量 + 配置数量 + 价格梯度 + 销量分布
export const VP_PLAN_INPUT = {
  carCode: 'C798', planVer: 'VP-2026.03', status: '已发布', owner: '陈思远',
  lifecycle: '2027-2029', totalVolume: '168,000 辆',
  modelCount: '1 款车型 · 3 个车型状态（Lev1/Lev2/Lev3）+ 1 个选装包',
  configCount: '3 档配置等级（Lev1 基础 / Lev2 主力 / Lev3 魅力）',
  priceGradient: '¥139,800 ~ ¥189,800（级差目标：基础→主力 0.6~0.8，主力→魅力 0.8~1.2）',
  salesStructure: '主力车型（Lev2）MIX 55%，承担走量任务；魅力车型（Lev3）MIX 20%',
  mainMix: 55,
  gradient: [
    { trim: '基础车型（Lev1）', price: 139800, mix: 15, vol2027: '14,000 辆', role: '必备配置 · 拉低准入门槛' },
    { trim: '主力车型（Lev2）', price: 159800, mix: 55, vol2027: '51,000 辆', role: '必备+期望+低成本高CPV · 走量主力' },
    { trim: '魅力车型（Lev3）', price: 189800, mix: 20, vol2027: '18,000 辆', role: '魅力配置 · 支撑溢价与品牌形象' },
  ],
}

export const COMBO_PROJECTS = [
  {
    id: 'CB-C798', carCode: 'C798', carName: '长安启源 C798', segment: '中大型SUV · 增程 REEV · 14-18万',
    phase: 'KO节点交付', stage: '搭建中', step: 3, owner: '陈思远',
    versions: 'V2026.08', updated: '2026-08-20',
  },
  {
    id: 'CB-C390', carCode: 'C390', carName: '深蓝 G318', segment: '硬派SUV · 增程 REEV · 20-30万',
    phase: 'FKO-KO 搭建', stage: '宽度设定', step: 2, owner: '陈思远',
    versions: 'V2027.01', updated: '2026-08-22',
  },
  {
    id: 'CB-C673', carCode: 'C673', carName: '长安 CS75PLUS', segment: '紧凑型SUV · 燃油 · 11-14万',
    phase: 'KO-CC 变更管理', stage: '变更审视', step: 1, owner: '陈思远',
    versions: 'V2026.08', updated: '2026-08-12',
  },
  {
    id: 'CB-C857', carCode: 'C857', carName: '深蓝 SL03', segment: '中型轿车 · 纯电 · 12-17万',
    phase: 'CC-VS/LS 锁定管理', stage: '配置锁定', step: 6, owner: '陈思远',
    versions: 'V2026.08', updated: '2026-08-18',
  },
]

// 竞争圈配置装备率清单（步骤1，与装备率分析同源）
export const COMBO_EQUIP_LIST = EQUIP_DATA.map(e => ({ ...e }))

// 配置宽度（步骤2）：基础/差异/趋势三类
export const WIDTH_LIST = [
  { name: '全景天窗', type: '基础', rate: 85, growth: 3.7, cpv: 1800, cost: 1200, decision: '搭载', basis: '装备率≥80%，全部装备' },
  { name: '电动尾门', type: '基础', rate: 76, growth: 4.1, cpv: 1500, cost: 900, decision: '搭载', basis: '装备率≥80%，全部装备' },
  { name: 'L2辅助驾驶', type: '基础', rate: 68, growth: 9.7, cpv: 3500, cost: 2200, decision: '搭载', basis: '60%≤装备率＜80%，增长率高于均值' },
  { name: 'LED矩阵大灯', type: '差异', rate: 48, growth: 14.3, cpv: 2800, cost: 1600, decision: '搭载', basis: '增长率高于均值，构建产品力' },
  { name: '座椅通风', type: '差异', rate: 42, growth: 10.5, cpv: 1600, cost: 800, decision: '搭载', basis: '增长率高于均值，支撑亮点买点' },
  { name: 'HUD抬头显示', type: '趋势', rate: 22, growth: 37.5, cpv: 2200, cost: 1500, decision: '搭载', basis: '15%≤装备率＜30%且连续2年正增长' },
  { name: '无线充电', type: '趋势', rate: 25, growth: 38.9, cpv: 600, cost: 300, decision: '搭载', basis: '15%≤装备率＜30%且连续2年正增长' },
  { name: '5G车机', type: '趋势', rate: 18, growth: 80.0, cpv: 900, cost: 700, decision: 'VAVE', basis: 'CPV/成本倒挂，输出VAVE降本需求' },
  { name: '车载冰箱', type: '趋势', rate: 8, growth: 20.0, cpv: 800, cost: 1100, decision: '不搭载', basis: '装备率＜15%，未进入竞争圈' },
]

// 配置宽度审视（步骤3）
export const WIDTH_REVIEW = [
  { dim: '用户需求', item: '促弃购关键配置缺失审视', result: '通过', detail: '促弃购TOP3（空间/续航/座椅）关键配置均已覆盖' },
  { dim: '用户需求', item: '配置选择率审视', result: '通过', detail: '低选择率配置（车载冰箱）已列入删减' },
  { dim: '亮点买点', item: '配置宽度支撑亮点买点', result: '关注', detail: '「超感智能座舱」买点缺少AR-HUD支撑，建议补充至趋势配置' },
  { dim: '八大域体验', item: '配置满足体验定义', result: '通过', detail: '参照体验定义清单核对，无缺失域' },
  { dim: '成本与CPV', item: 'CPV/成本倒挂项审视', result: '关注', detail: '5G车机倒挂，选择率高，保留并输入VAVE降本需求' },
]

// KANO 配置分级（步骤4）
export const KANO_LIST = [
  { name: 'L2辅助驾驶', kano: '必备配置', grade: 'A', cpv: 3500, cost: 2200 },
  { name: '全景天窗', kano: '必备配置', grade: 'A', cpv: 1800, cost: 1200 },
  { name: '电动尾门', kano: '必备配置', grade: 'A', cpv: 1500, cost: 900 },
  { name: 'LED矩阵大灯', kano: '期望配置', grade: 'B', cpv: 2800, cost: 1600 },
  { name: '座椅通风', kano: '期望配置', grade: 'B', cpv: 1600, cost: 800 },
  { name: '无线充电', kano: '期望配置', grade: 'B', cpv: 600, cost: 300 },
  { name: 'HUD抬头显示', kano: '魅力配置', grade: 'C', cpv: 2200, cost: 1500 },
  { name: '5G车机', kano: '无差异配置', grade: 'D', cpv: 900, cost: 700 },
]

// 车型状态配置梯度（步骤4）
export const GRADIENT_TRIMS = [
  { trim: '基础车型（Lev1）', role: '必备配置', mix: 15, price: 139800, features: 'L2辅助驾驶、全景天窗、电动尾门、前排座椅加热' },
  { trim: '主力车型（Lev2）', role: '必备+期望+低成本高CPV', mix: 55, price: 159800, features: 'Lev1 + LED矩阵大灯、座椅通风、无线充电（MIX目标区间 40~60%）' },
  { trim: '魅力车型（Lev3）', role: '魅力配置', mix: 20, price: 189800, features: 'Lev2 + HUD抬头显示、双电机、全车通风加热按摩' },
  { trim: '选装包', role: '个性化供给', mix: '—', price: 8000, features: '智享选装包（高阶智驾+空气悬架），渗透率目标25%' },
]

// 配置组合验证（步骤5）
export const VALIDATE_TABS = ['用户维度验证', 'EATP目标验证', '级差目标验证', '竞争策略验证', '可行性验证', '盈利策略验证']

export const MIX_CHECK = [
  { trim: '主力车型（Lev2）', target: 55, actual: 48, dev: -12.7, result: '偏差可接受', action: '相对偏差率＜20%，维持目标' },
  { trim: '基础车型（Lev1）', target: 15, actual: 13, dev: -13.3, result: '偏差可接受', action: '单车型MIX≥10%，维持' },
  { trim: '魅力车型（Lev3）', target: 20, actual: 26, dev: 30.0, result: '需调整', action: 'Mix＞目标且偏差≥20%，审视减少配置或下调MIX目标' },
  { trim: '选装包', target: 25, actual: 24, dev: -4.0, result: '达成', action: '—' },
]

export const COMPETITOR_ADVANTAGE = [
  { dim: '智能座舱', ours: '15.6英寸中控+AR-HUD（魅力车型）', theirs: '比亚迪宋PLUS：12.8英寸旋转屏', verdict: '领先', note: '支撑「超感智能座舱」买点' },
  { dim: '动力性', ours: '增程双电机 320kW，7.2s', theirs: '宋PLUS DM-i：单电机 145kW', verdict: '领先', note: '零百加速领先1.8s' },
  { dim: '辅助驾驶', ours: 'L2全系标配', theirs: '宋PLUS中高配搭载', verdict: '领先', note: '基础配置下探形成压制' },
  { dim: '空间', ours: '2900mm轴距', theirs: '宋PLUS：2765mm', verdict: '领先', note: '越级空间' },
  { dim: '价格', ours: '13.98-18.98万', theirs: '宋PLUS：12.98-16.98万', verdict: '持平', note: '级差与EATP校核通过' },
]

export const FEASIBILITY_CHECK = [
  { item: '开发状态审视（动力/电池/底盘大价值配置）', result: '通过', note: '双电机方案沿用深蓝平台，无新增开发' },
  { item: '公司红线指标（动底红线）', result: '通过', note: '满足公司相关要求' },
  { item: '配置组合状态数量', result: '通过', note: '3个配置状态+1个选装包，样车数量合理' },
  { item: '技术可行性（工程可开发）', result: '通过', note: '开发团队专业评估通过' },
]

export const PROFIT_CHECK = [
  { item: '材料成本占比', result: '达标', note: '较上一节点下降0.8pct，优于公司最佳实践' },
  { item: '项目效益（NPV/IRR）', result: '达标', note: '财务测算IRR 14.2%，高于目标1.2pct' },
  { item: 'VAVE降本目标', result: '进行中', note: '5G车机降本需求已输入项目组' },
]

// 配置变更记录（变更管理）
export const CHANGE_LOG = [
  { date: '2026-08-20', ver: 'V2026.08', content: '全景天幕Lev3新增；前排座椅按摩Lev2增配；机械仪表Lev1减配', source: '用户需求洞察/市场竞争变化', review: '已评审', owner: '陈思远' },
  { date: '2026-06-15', ver: 'V2026.06', content: '初版配置表，基于EATP在研全量原子库', source: 'KO节点交付', review: '已评审', owner: '陈思远' },
  { date: '2026-04-10', ver: 'V2026.04', content: '配置宽度设定不全，缺少趋势配置项', source: '配置宽度审视', review: '已退回', owner: '陈思远' },
]

// ---------- 6. LACU 定义（整车指标定义目标书V2.0） ----------
// 一级指标 10 个 / 二级指标 78 个 / 三级指标 186 个（此处收录全部一级/二级，三级为代表性收录）
export const LACU_TREE = [
  {
    code: '1', name: '外观', l2: [
      { code: '1.1', name: '原创度', l3: [] },
      { code: '1.2', name: '前瞻性', l3: [] },
      { code: '1.3', name: '美观性', l3: [] },
      { code: '1.4', name: '外观协调性', l3: [
        { code: '1.4.1', name: '正前方协调性' }, { code: '1.4.2', name: '正侧面协调性' },
        { code: '1.4.3', name: '正后方协调性' }, { code: '1.4.4', name: '外观色彩搭配协调性' }] },
      { code: '1.5', name: '正前方整体设计', l3: [
        { code: '1.5.1', name: '车顶整体造型' }, { code: '1.5.2', name: '引擎盖' },
        { code: '1.5.3', name: '前保险杠和格栅' }, { code: '1.5.4', name: '灯光造型' }] },
      { code: '1.6', name: '侧面整体设计', l3: [
        { code: '1.6.1', name: '侧面车窗和车顶的整体造型' }, { code: '1.6.2', name: '腰线和型面' }] },
      { code: '1.7', name: '正后方整体设计', l3: [] },
      { code: '1.8', name: '整车车格大小（参数）', l3: [
        { code: '1.8.1', name: '长' }, { code: '1.8.2', name: '宽' }, { code: '1.8.3', name: '高' }, { code: '1.8.4', name: '轴距' }] },
      { code: '1.9', name: '整车体量感（视觉感受）', l3: [] },
      { code: '1.10', name: '整体外观形象符合度', l3: [] },
      { code: '1.11', name: '前脸表情符合度', l3: [] },
      { code: '1.12', name: '外观档次感', l3: [{ code: '1.12.2', name: '车漆品质' }] },
      { code: '1.13', name: '外观品质感', l3: [{ code: '1.13.1', name: '外观做工品质（缝隙、段差）' }] },
    ],
  },
  {
    code: '2', name: '内饰', l2: [
      { code: '2.1', name: '原创度', l3: [] }, { code: '2.2', name: '前瞻性', l3: [] }, { code: '2.3', name: '美观性', l3: [] },
      { code: '2.4', name: '内饰协调性', l3: [] }, { code: '2.5', name: '整体形象符合度', l3: [] },
      { code: '2.6', name: '仪表台区域造型设计', l3: [] },
      { code: '2.7', name: '方向盘设计', l3: [{ code: '2.7.1', name: '方向盘造型设计' }] },
      { code: '2.8', name: '中央扶手区域造型设计', l3: [] },
      { code: '2.9', name: '门板区域整体设计', l3: [] },
      { code: '2.10', name: '座椅造型设计', l3: [
        { code: '2.10.1', name: '头枕造型' }, { code: '2.10.2', name: '靠背造型' },
        { code: '2.10.3', name: '坐垫造型' }, { code: '2.10.4', name: '座椅调节按钮区域' }] },
      { code: '2.11', name: '内饰档次感', l3: [] }, { code: '2.12', name: '内饰品质感', l3: [] },
    ],
  },
  {
    code: '3', name: '动力性', l2: [
      { code: '3.1', name: '电机参数（效率、转速、扭矩）', l3: [
        { code: '3.1.1', name: '电机最高转速' }, { code: '3.1.2', name: '电机最大功率、扭矩' }, { code: '3.1.3', name: '电机能量转换效率' }] },
      { code: '3.2', name: '最高车速', l3: [] },
      { code: '3.3', name: '发动机参数', l3: [
        { code: '3.3.1', name: '发动机功率、扭矩、排量' }, { code: '3.3.2', name: '发动机类型（涡轮、自吸）' },
        { code: '3.3.3', name: '发动机热效率及百公里油耗' }] },
      { code: '3.4', name: '驱动形式（前驱/后驱/四驱）', l3: [] },
      { code: '3.5', name: '加速性能（0-100加速、动力响应速度）', l3: [
        { code: '3.5.1', name: '起步性能' }, { code: '3.5.2', name: '城市路工况动力性' }, { code: '3.5.3', name: '高速路工况动力性' }] },
      { code: '3.7', name: '坡道动力性能（硬派SUV专用）', l3: [] },
      { code: '3.8', name: '动力形式（ICE、插混、REV、EV）', l3: [] },
      { code: '3.9', name: '动力技术领先性', l3: [] },
    ],
  },
  {
    code: '4', name: '操控性', l2: [
      { code: '4.1', name: '行驶稳定性', l3: [] }, { code: '4.2', name: '转向性能', l3: [] },
      { code: '4.3', name: '刹车/制动性能', l3: [] }, { code: '4.4', name: '悬架/减振性能', l3: [] },
      { code: '4.5', name: '驾驶平顺性', l3: [] }, { code: '4.6', name: '通过性', l3: [] },
    ],
  },
  {
    code: '5', name: '舒适性', l2: [
      { code: '5.1', name: '悬架/减振舒适性', l3: [] },
      { code: '5.2', name: '空调舒适性', l3: [] },
      { code: '5.3', name: '前排座椅舒适性', l3: [] }, { code: '5.4', name: '第二排座椅舒适性', l3: [] },
      { code: '5.5', name: '第三排座椅舒适性', l3: [] }, { code: '5.6', name: '驾驶操作舒适性', l3: [] },
      { code: '5.7', name: '车内静音效果', l3: [] }, { code: '5.8', name: '操作提示音的品质感', l3: [] },
    ],
  },
  {
    code: '6', name: '空间', l2: [
      { code: '6.1', name: '前排空间大小', l3: [] }, { code: '6.2', name: '第二排空间大小', l3: [] },
      { code: '6.3', name: '第三排空间大小', l3: [] }, { code: '6.4', name: '座椅空间灵活性', l3: [] },
      { code: '6.5', name: '前备厢空间', l3: [] }, { code: '6.6', name: '后备厢空间', l3: [] },
      { code: '6.7', name: '车内储物空间', l3: [] },
    ],
  },
  {
    code: '7', name: '安全性', l2: [
      { code: '7.1', name: '安全碰撞星级', l3: [] },
      { code: '7.2', name: '被动安全（车身强度、用料、工艺、气囊等）', l3: [] },
      { code: '7.3', name: '主动安全（360全景影像、车道偏离预警等）体验', l3: [] },
      { code: '7.4', name: '驾驶视野安全', l3: [] }, { code: '7.5', name: '电池安全', l3: [] },
      { code: '7.6', name: '信息隐私安全', l3: [] },
    ],
  },
  {
    code: '8', name: '智能座舱', l2: [
      { code: '8.1', name: '娱乐', l3: [] }, { code: '8.2', name: '交互', l3: [] },
      { code: '8.3', name: '安全', l3: [] }, { code: '8.4', name: '车控：语音、远程等体验', l3: [] },
      { code: '8.5', name: '操作系统及OTA', l3: [] }, { code: '8.6', name: '核心硬件', l3: [] },
      { code: '8.7', name: '生态拓展', l3: [] },
    ],
  },
  {
    code: '9', name: '驾驶辅助', l2: [
      { code: '9.1', name: '主动安全（360全景影像等）体验感', l3: [] },
      { code: '9.2', name: '行车辅助（高速辅助驾驶、城市道路辅助驾驶）体验', l3: [] },
      { code: '9.3', name: '泊车辅助（全自动泊车、一键召唤）体验', l3: [] },
      { code: '9.4', name: '驾驶硬件（芯片、激光雷达、毫米波雷达、摄像头）', l3: [] },
    ],
  },
  {
    code: '10', name: '能源、续航与能耗', l2: [
      { code: '10.1', name: '电池安全性', l3: [] }, { code: '10.2', name: '充电速度及便利性', l3: [] },
      { code: '10.3', name: '百公里能耗', l3: [] }, { code: '10.4', name: '续航抗衰减性能', l3: [] },
      { code: '10.5', name: '电池电压平台先进性（800V、三元锂、CTV等）', l3: [] },
      { code: '10.6', name: '纯电续航里程数', l3: [] }, { code: '10.7', name: '电池度数', l3: [] },
    ],
  },
]

// LACU 目标书列表
export const LACU_BOOKS = [
  { id: 'VB-02.02-D01', car: '长安启源 C798', version: 'V2.0', node: 'KO', status: '已发布', owner: '陈思远', date: '2026-06-18', progress: 100 },
  { id: 'VB-02.02-D02', car: '深蓝 G318', version: 'V1.0', node: 'FKO', status: '共创评审中', owner: '王铭', date: '2026-08-20', progress: 62 },
  { id: 'VB-02.02-D03', car: '长安 CS75PLUS', version: 'V1.5', node: 'CC', status: '编制中', owner: '陈思远', date: '2026-08-25', progress: 35 },
  { id: 'VB-02.02-D04', car: '深蓝 SL03', version: 'V3.0', node: 'VS', status: '验收监控中', owner: '王铭', date: '2026-07-30', progress: 88 },
]

// LACU 指标目标值示例（C798 · 部分三级/二级指标）
// 定级采用 PALS（Product Attribute Leadership Strategy）四档：L 行业领导 / A 行业领先 / C 具备竞争力 / U 不具备竞争力（成本妥协）
export const LACU_TARGETS = {
  '1.8': [
    { code: '1.8.1', name: '长', grade: 'A', target: '4780 mm', ours: '4780 mm', rival: '宋PLUS DM-i 4775 mm', gap: '+5', status: '达成' },
    { code: '1.8.2', name: '宽', grade: 'L', target: '1920 mm', ours: '1920 mm', rival: '1890 mm', gap: '+30', status: '达成' },
    { code: '1.8.3', name: '高', grade: 'C', target: '1665 mm', ours: '1660 mm', rival: '1670 mm', gap: '-10', status: '关注' },
    { code: '1.8.4', name: '轴距', grade: 'L', target: '2900 mm', ours: '2900 mm', rival: '2765 mm', gap: '+135', status: '达成' },
  ],
  '3.5': [
    { code: '3.5.1', name: '起步性能', grade: 'L', target: '0-50km/h 2.3s', ours: '2.4s', rival: '2.8s', gap: '领先0.4s', status: '达成' },
    { code: '3.5.2', name: '城市路工况动力性', grade: 'L', target: '80-120km/h超车 3.5s', ours: '3.6s', rival: '4.4s', gap: '领先0.8s', status: '达成' },
    { code: '3.5.3', name: '高速路工况动力性', grade: 'A', target: '120km/h再加速能力满足', ours: '满足', rival: '满足', gap: '持平', status: '达成' },
  ],
  '10.6': [
    { code: '10.6', name: '纯电续航里程数', grade: 'L', target: 'CLTC 215 km', ours: '215 km', rival: '112 km', gap: '+103', status: '达成' },
  ],
}

// LACU 变更记录
export const LACU_CHANGES = [
  { ver: 'V2.0', date: '2026-06-18', seq: 1, content: '「10.能源、续航与能耗」新增10.5电池电压平台先进性、10.7电池度数两项二级指标' },
  { ver: 'V2.0', date: '2026-06-18', seq: 2, content: '「3.动力性」3.5加速性能下新增起步/城市路/高速路三项三级指标' },
  { ver: 'V1.0', date: '2025-11-10', seq: 1, content: '首次发布，10个一级指标、78个二级指标、186个三级指标' },
]

// ========== 竞品数据管理 ==========
// 竞品车型清单（含本品对标车型；配置数据周期性采集更新，来源：CAM / 汽车之家 / 威尔森）
// msrp：指导价区间；versions：在售版本数
export const RIVAL_CARS = [
  { name: '比亚迪宋PLUS DM-i', price: '8-11万', level: '紧凑型SUV', energy: '插电混动', msrp: '10.28-13.98万', versions: 5, items: 653, status: '已采集', updated: '2026-08-20' },
  { name: '哈弗H6', price: '8-11万', level: '紧凑型SUV', energy: '燃油', msrp: '9.59-12.49万', versions: 4, items: 612, status: '已采集', updated: '2026-08-20' },
  { name: '吉利星越L', price: '11-14万', level: '紧凑型SUV', energy: '燃油', msrp: '12.22-15.52万', versions: 6, items: 598, status: '已采集', updated: '2026-08-20' },
  { name: '长安CS75PLUS（本品对标）', price: '11-14万', level: '紧凑型SUV', energy: '燃油', msrp: '11.79-14.49万', versions: 5, items: 624, status: '已采集', updated: '2026-08-20', ours: true },
  { name: '零跑D19 纯电720智尊版 六座', price: '20-25万', level: '大型SUV', energy: '纯电动', msrp: '21.98-24.68万', versions: 3, items: 724, status: '已采集', updated: '2026-08-23' },
  { name: '零跑D19 纯电680三电机性能版 六座', price: '20-25万', level: '大型SUV', energy: '纯电动', msrp: '22.98-25.18万', versions: 3, items: 724, status: '部分缺失', updated: '2026-08-23' },
  { name: '大唐 纯电 950km 后驱激光雷达旗舰型', price: '20-25万', level: '大型SUV', energy: '纯电动', msrp: '22.58-24.98万', versions: 4, items: 724, status: '已采集', updated: '2026-08-23' },
  { name: '理想L7', price: '25-30万', level: '中大型SUV', energy: '增程', msrp: '26.18-32.18万', versions: 3, items: 689, status: '部分缺失', updated: '2026-08-21' },
  { name: '问界M7', price: '25-30万', level: '中大型SUV', energy: '增程', msrp: '24.98-32.98万', versions: 5, items: 672, status: '待补充', updated: '2026-08-21' },
]

// 竞品配置表查看用的配置项目录（按域分组，演示粒度）
export const RIVAL_CONFIG_GROUPS = [
  { cat: '智能驾驶', items: [
    'L2辅助驾驶', '高速NOA领航辅助', '城市NOA领航辅助', '自动泊车APA', '激光雷达', '360全景影像',
  ]},
  { cat: '智能座舱', items: [
    '大尺寸中控屏', '副驾娱乐屏', '语音连续对话', '5G车机', 'OTA整车升级', 'HUD抬头显示', '无线充电', '面部识别',
  ]},
  { cat: '舒适配置', items: [
    '全景天窗', '电动尾门', '座椅通风', '座椅加热', '座椅按摩', '真皮座椅', '前排双层玻璃', '后排出风口', '多区自动空调', '方向盘加热',
  ]},
  { cat: '灯光与外观', items: [
    'LED矩阵大灯', '贯穿式尾灯', '隐藏式门把手', '电动吸合门',
  ]},
  { cat: '动力与补能', items: [
    '对外放电', '快充能力', '电动四驱',
  ]},
]
