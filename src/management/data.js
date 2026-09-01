// ============== Mock data ==============
export const mockReports = [
  {
    id: 'RPT-20260814-001',
    name: '长安启源A07 · 6-8万紧凑型PHEV轿车',
    brand: '长安启源',
    segment: '紧凑型轿车',
    priceRange: '6-8万',
    energy: 'PHEV',
    launchYear: '2028',
    status: 'published',
    fileType: 'copy',
    creator: '规划部 · 张明',
    createdAt: '2026-08-14 14:32',
    publishedAt: '2026-08-15 09:18',
    downloads: 42,
    views: 286,
    rating: 4.7,
    tags: ['PHEV', '入门紧凑', '6-8万'],
    steps: generateSteps('长安启源A07', '入门紧凑产品圈'),
  },
  {
    id: 'RPT-20260722-002',
    name: '深蓝SL03 · 8-12万中型纯电轿车',
    brand: '深蓝',
    segment: '中型轿车',
    priceRange: '8-12万',
    energy: 'BEV',
    launchYear: '2028',
    status: 'published',
    fileType: 'copy',
    creator: '规划部 · 李华',
    createdAt: '2026-07-22 10:15',
    publishedAt: '2026-07-23 16:42',
    downloads: 38,
    views: 242,
    rating: 4.5,
    tags: ['BEV', '主流品质', '8-12万'],
    steps: generateSteps('深蓝SL03', '主流品质产品圈'),
  },
  {
    id: 'RPT-20260618-006',
    name: '长安欧尚Z6 · 7-10万紧凑SUV',
    brand: '长安欧尚',
    segment: '紧凑SUV',
    priceRange: '7-10万',
    energy: 'PHEV',
    launchYear: '2028',
    status: 'published',
    fileType: 'copy',
    creator: '规划部 · 王磊',
    createdAt: '2026-06-18 09:22',
    publishedAt: '2026-06-19 14:08',
    downloads: 31,
    views: 198,
    rating: 4.4,
    tags: ['PHEV', '主流品质', '7-10万'],
    steps: generateSteps('长安欧尚Z6', '主流品质产品圈'),
  },
  {
    id: 'RPT-20260605-007',
    name: '阿维塔11 · 30-40万中大型纯电SUV',
    brand: '阿维塔',
    segment: '中大型SUV',
    priceRange: '30-40万',
    energy: 'BEV',
    launchYear: '2028',
    status: 'published',
    fileType: 'copy',
    creator: '规划部 · 李华',
    createdAt: '2026-06-05 11:40',
    publishedAt: '2026-06-06 17:25',
    downloads: 17,
    views: 124,
    rating: 4.8,
    tags: ['BEV', '高端品质', '30-40万'],
    steps: generateSteps('阿维塔11', '高端品质产品圈'),
  },
  {
    id: 'RPT-20260820-003',
    name: '长安启源Q05 · 5-7万紧凑SUV',
    brand: '长安启源',
    segment: '紧凑SUV',
    priceRange: '5-7万',
    energy: 'PHEV',
    launchYear: '2028',
    status: 'readonly',
    fileType: 'original',
    creator: '规划部 · 张明',
    createdAt: '2026-08-20 16:08',
    publishedAt: null,
    versions: [{ v: 'v1.0', time: '2026-08-20 16:08', desc: '工作台初始生成版本' }],
    steps: generateSteps('长安启源Q05', '入门紧凑产品圈'),
  },
  {
    id: 'RPT-20260822-004',
    name: '阿维塔12 · 25-35万中大型电动轿跑',
    brand: '阿维塔',
    segment: '中大型轿跑',
    priceRange: '25-35万',
    energy: 'BEV',
    launchYear: '2028',
    status: 'readonly',
    fileType: 'original',
    creator: '规划部 · 王磊',
    createdAt: '2026-08-22 11:25',
    publishedAt: null,
    versions: [{ v: 'v1.0', time: '2026-08-22 11:25', desc: '工作台初始生成版本' }],
    steps: generateSteps('阿维塔12', '高端品质产品圈'),
  },
  {
    id: 'RPT-20260824-005',
    name: '长安UNI-V · 8-11万紧凑运动轿车',
    brand: '长安',
    segment: '紧凑型轿车',
    priceRange: '8-11万',
    energy: 'ICE',
    launchYear: '2028',
    status: 'readonly',
    fileType: 'original',
    creator: '规划部 · 张明',
    createdAt: '2026-08-24 09:48',
    publishedAt: null,
    versions: [{ v: 'v1.0', time: '2026-08-24 09:48', desc: '工作台初始生成版本' }],
    steps: generateSteps('长安UNI-V', '主流品质产品圈'),
  },
];

export function generateSteps(productName, circle) {
  return [
    {
      id: 's1', num: 1, name: '价格排名与评分', editable: false, edited: false,
      source: 'IPV.xlsx 数据源',
      title: '价格细分市场排名与评分',
      subtitle: '基于近3年CAGR和2028年预测容量',
      meta: '紧凑型轿车 | 5-10万元 | 基准年份 2026',
      columns: ['排名','价格区间(万元)','近3年CAGR','2028预测(万辆)','容量评分','增长评分','综合评分','推荐等级'],
      rows: [
        ['1','6-7','8.2%','48.6','★★★★★','★★★★','8.9','强力推荐'],
        ['2','7-8','6.5%','42.3','★★★★★','★★★','8.1','推荐'],
        ['3','5-6','3.1%','35.2','★★★★','★★','6.5','关注'],
        ['4','8-9','-1.2%','28.7','★★★','★','4.8','审慎'],
        ['5','9-10','-4.5%','19.4','★★','★','3.6','不推荐'],
      ],
      insight: '6-7万元价格带以8.2%的年复合增长率稳健增长，2028年预测容量达48.6万辆，是紧凑型轿车市场最具吸引力的价格锚点。',
    },
    {
      id: 's2', num: 2, name: '竞争格局分析', editable: true, edited: false,
      source: '竞争分析模块 · SPC-CMP',
      title: '竞争格局图（2026实际 / 2028预测）',
      subtitle: '5-10万紧凑型轿车市场竞品分布',
      columns: ['竞品','2026销量(万)','2028预测(万)','价格区间','能源类型','竞争等级'],
      rows: [
        ['比亚迪秦PLUS','58.3','72.1','7.98-12.58','PHEV','核心'],
        ['吉利银河L6','12.4','28.6','9.98-13.28','PHEV','核心'],
        ['长安启源A07','8.6','22.5','8.99-13.29','PHEV','主要'],
        ['奇瑞艾瑞泽8','6.2','14.8','8.69-13.99','ICE','主要'],
        ['宝骏云朵','3.4','5.2','7.38-10.78','BEV','观察'],
      ],
      insight: 'PHEV在5-10万紧凑轿车中持续渗透，预计2028年占比从48%升至63%，是新能源主要增量来源。',
    },
    {
      id: 's3', num: 3, name: '竞品筛选漏斗', editable: true, edited: false,
      source: '竞争分析模块 · SPC-CMP',
      title: '竞品筛选漏斗',
      subtitle: '从15款候选 → 3款核心竞品',
      columns: ['竞品','筛选阶段','入选理由'],
      rows: [
        ['比亚迪秦PLUS','核心','价格相近+PHEV主流+销量领先'],
        ['吉利银河L6','核心','价格区间重叠+品牌力强'],
        ['长安启源A07','核心','同品牌对标+定位相似'],
        ['奇瑞艾瑞泽8','主要','ICE对标，差异化关注'],
        ['宝骏云朵','观察','BEV小众，参考'],
      ],
      insight: '核心竞品锁定3款，均为PHEV路线，建议价格锚定在6-9万核心带。',
    },
    {
      id: 's4', num: 4, name: '竞争圈确认', editable: true, edited: false,
      source: '竞争分析模块 · SPC-CMP',
      title: '目标竞争圈确认',
      subtitle: '基于竞品聚类与价格带分析',
      selected: circle,
      columns: ['竞争圈','典型价格区间','代表车型','战略定位'],
      rows: [
        ['入门紧凑产品圈','5-8万','宝骏云朵、长安启源Q05','性价比占位'],
        ['主流品质产品圈','7-10万','比亚迪秦PLUS、吉利银河L6','品质均衡'],
        ['高端运动产品圈','10-15万','长安UNI-V、领克03','运动化'],
      ],
      insight: '建议选定【' + circle + '】作为目标竞争圈，与品牌定位、价格策略高度匹配。',
    },
    {
      id: 's5', num: 5, name: '调研文件上传', editable: false, edited: false,
      source: '用户干预点 · 用户上传',
      title: '调研文件人工上传',
      subtitle: '项目专项调研文件 + NCBS全国购车者调研',
      meta: '必传：项目专项调研文件 / 可选：NCBS全国购车者调研',
      insight: '前置分析结果已确认，调研文件已上传，启动用户画像差异智能分析。',
    },
    {
      id: 's6', num: 6, name: '目标用户画像', editable: true, edited: false,
      source: '用户洞察模块 · SPC-USR',
      title: '目标用户画像生成',
      subtitle: '基于NCBS调研 + 项目专项调研',
      persona: {
        nickname: '精打细算的家庭决策者',
        tagline: '30-38岁已婚男性 · 二三线城市 · 家庭月收入1.2-2万',
        dimensions: [
          { label: '年龄', value: '30-38岁' },
          { label: '城市', value: '二三线为主' },
          { label: '收入', value: '家庭月入1.2-2万' },
          { label: '职业', value: '基层管理 / 个体经营' },
          { label: '家庭', value: '已婚有娃 / 二胎意向' },
          { label: '用车', value: '日常通勤 + 周末家庭出行' },
        ],
      },
      insight: '核心用户对"大空间+低油耗"敏感度最高，对智能化配置有需求但价格容忍度有限。',
    },
    {
      id: 's7', num: 7, name: '审美偏好分析', editable: true, edited: false,
      source: '用户洞察模块 · SPC-USR',
      title: '审美偏好与造型风格',
      columns: ['维度','偏好特征','权重'],
      rows: [
        ['整体造型','稳健大气 · 中庸不激进','★★★★★'],
        ['前脸','横向延展 · 镀铬点缀','★★★★'],
        ['车身','流畅轿跑感 · 不夸张','★★★★'],
        ['尾部','简洁 · 横向视觉','★★★'],
        ['配色','黑/白/银 主流安全色','★★★★'],
      ],
      insight: '造型偏好整体偏保守稳健，避免过度运动化或个性化表达。',
    },
    {
      id: 's8', num: 8, name: '需求交叉分析', editable: true, edited: false,
      source: '用户洞察模块 · SPC-USR',
      title: '需求交叉与配置映射',
      columns: ['核心需求','价格敏感度','配置映射','优先级'],
      rows: [
        ['大空间','高','轴距≥2700mm · 后排腿部≥900mm','P0'],
        ['低油耗','高','PHEV纯电续航≥100km · 综合油耗≤1.2L','P0'],
        ['舒适性','中','空调后排出风 · 后排独立座椅','P1'],
        ['智能化','中','12.3寸中控 · L2级辅助驾驶','P1'],
        ['安全性','中','6气囊 · AEB · 车道保持','P1'],
      ],
      insight: '大空间+低油耗为P0刚需，智能化与安全性属P1增量配置。',
    },
    {
      id: 's9', num: 9, name: '竞品特征对标', editable: true, edited: false,
      source: '产品特征模块 · SPC-FEA',
      title: '竞品核心特征对标',
      columns: ['配置项','比亚迪秦PLUS','吉利银河L6','长安启源A07','建议对标'],
      rows: [
        ['轴距(mm)','2718','2752','2700','≥2750'],
        ['纯电续航(km)','120','115','95','≥120'],
        ['中控屏(寸)','12.8','13.2','14.6','≥13'],
        ['L2辅助驾驶','标配','标配','高配才有','标配'],
        ['6气囊','高配才有','标配','标配','标配'],
      ],
      insight: '轴距和纯电续航是关键短板，需重点提升至行业领先水平。',
    },
    {
      id: 's10', num: 10, name: '配置基准设定', editable: true, edited: false,
      source: '产品特征模块 · SPC-FEA',
      title: '配置基准与差异点设定',
      columns: ['配置层级','配置项','对标策略'],
      rows: [
        ['标配','12.3寸中控+L2+6气囊+2700mm轴距','行业基准'],
        ['主销','120km纯电+大空间+舒适性','差异化'],
        ['高配','14.6寸+HUD+座椅通风','向上占位'],
      ],
      insight: '采用"标配对齐行业+主销差异化突破"策略，构建性价比护城河。',
    },
    {
      id: 's11', num: 11, name: '竞争策略确认', editable: true, edited: false,
      source: '用户干预点 · 人工确认',
      title: '竞争策略人工确认',
      subtitle: '系统已确认策略B：差异化竞争',
      strategies: [
        { key: 'A', name: '成本领先', selected: false, desc: '通过规模化降本，价格下探抢占入门市场' },
        { key: 'B', name: '差异化竞争', selected: true, desc: '空间+续航+智能化差异化组合，主销价格带突破' },
      ],
      insight: '策略B已确认：差异化竞争，主销差异化突破。',
    },
    {
      id: 's12', num: 12, name: '产品概念整合生成', editable: false, edited: false,
      source: '主智能体 · SPC-MAIN',
      title: '产品概念文件已生成',
      subtitle: productName,
      files: [
        { name: '产品概念文件（Word）.docx', size: '2.4 MB', color: '#155EEF' },
        { name: '产品概念文件（PPT）.pptx', size: '8.6 MB', color: '#EF4444' },
        { name: '产品概念文件（图片）.png', size: '1.8 MB', color: '#10B981' },
        { name: '产品概念文件（EXCEL附件打包）.zip', size: '5.2 MB', color: '#7C3AED' },
      ],
      insight: '完整产品概念已生成，含4类交付物，可流转至审核中心进行校验与发布。',
    },
  ];
}

// ============== Helpers ==============
export function statusMeta(s) {
  return {
    readonly: { label: '只读', color: 'gray', flow: 0 },
    draft: { label: '草稿', color: 'gray', flow: 1 },
    reviewing: { label: '待校验', color: 'amber', flow: 2 },
    verified: { label: '已校验', color: 'blue', flow: 3 },
    published: { label: '已发布', color: 'green', flow: 4 },
  }[s] || { label: s, color: 'gray', flow: 0 };
}

export function stepEditability(s) {
  return s.editable ? '可编辑' : '只读';
}

export function getReport(id) {
  return mockReports.find(r => r.id === id);
}

// ============== Chart Renderers ==============
// 折线图（双线：发布量 + 下载量）
export function renderLineChart(trend1, trend2, max1, max2) {
  const W = 280, H = 130, P = 24;
  const n = trend1.length;
  const xStep = (W - P * 2) / (n - 1);
  const yScale1 = (H - P * 2) * 0.85;
  const yScale2 = (H - P * 2) * 0.85;

  const pts1 = trend1.map((t, i) => [P + i * xStep, H - P - (t.v / max1) * yScale1]);
  const pts2 = trend2.map((t, i) => [P + i * xStep, H - P - (t.v / max2) * yScale2]);

  const linePath = (pts) => pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const areaPath = (pts) => `${linePath(pts)} L${pts[n-1][0]},${H-P} L${pts[0][0]},${H-P} Z`;

  return `
    <svg viewBox="0 0 ${W} ${H}" style="width:100%; height:130px;">
      <defs>
        <linearGradient id="lg1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#155EEF" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#155EEF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="lg2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#10B981" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#10B981" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <!-- 网格 -->
      ${[0, 0.5, 1].map(r => `<line x1="${P}" y1="${H-P-r*yScale1}" x2="${W-P}" y2="${H-P-r*yScale1}" stroke="#E2E8F0" stroke-width="1" stroke-dasharray="3,3"/>`).join('')}
      <!-- 下载量区域 -->
      <path d="${areaPath(pts2)}" fill="url(#lg2)"/>
      <path d="${linePath(pts2)}" fill="none" stroke="#10B981" stroke-width="2"/>
      <!-- 发布量区域 -->
      <path d="${areaPath(pts1)}" fill="url(#lg1)"/>
      <path d="${linePath(pts1)}" fill="none" stroke="#155EEF" stroke-width="2"/>
      <!-- 数据点 -->
      ${pts1.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="white" stroke="#155EEF" stroke-width="2"/>`).join('')}
      ${pts2.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="3.5" fill="white" stroke="#10B981" stroke-width="2"/>`).join('')}
      <!-- X轴标签 -->
      ${trend1.map((t, i) => `<text x="${P + i * xStep}" y="${H - 6}" text-anchor="middle" font-size="10" fill="#98A2B3">${t.m}</text>`).join('')}
      <!-- 数值标签 -->
      ${pts1.map((p, i) => `<text x="${p[0]}" y="${p[1] - 8}" text-anchor="middle" font-size="10" font-weight="600" fill="#155EEF">${trend1[i].v}</text>`).join('')}
    </svg>
  `;
}

// 饼图
export function renderPieChart(data, colors) {
  const entries = Object.entries(data).filter(([k, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const cx = 75, cy = 75, r = 60;
  let angle = -Math.PI / 2;
  const slices = entries.map(([k, v], i) => {
    const pct = v / total;
    const a2 = angle + pct * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const large = pct > 0.5 ? 1 : 0;
    const midA = (angle + a2) / 2;
    const lx = cx + r * 0.6 * Math.cos(midA), ly = cy + r * 0.6 * Math.sin(midA);
    const path = `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`;
    angle = a2;
    return { path, color: colors[i % colors.length], label: k, value: v, pct: Math.round(pct * 100), lx, ly };
  });

  return `
    <div style="display:flex; align-items:center; gap:10px;">
      <svg viewBox="0 0 150 150" style="width:130px; height:130px; flex-shrink:0;">
        ${slices.map(s => `<path d="${s.path}" fill="${s.color}" stroke="white" stroke-width="2"/>`).join('')}
        ${slices.map(s => `<text x="${s.lx}" y="${s.ly}" text-anchor="middle" dominant-baseline="middle" font-size="10" font-weight="700" fill="white">${s.pct}%</text>`).join('')}
      </svg>
      <div style="flex:1; display:flex; flex-direction:column; gap:5px; font-size:11.5px;">
        ${slices.map(s => `
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:10px; height:10px; border-radius:2px; background:${s.color}; flex-shrink:0;"></span>
            <span style="flex:1; color:var(--c-text-secondary);">${s.label}</span>
            <span class="text-muted">${s.value} · ${s.pct}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 环形图
export function renderDonutChart(data, colors) {
  const entries = Object.entries(data).filter(([k, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const cx = 75, cy = 75, r = 60, rIn = 38;
  let angle = -Math.PI / 2;
  const slices = entries.map(([k, v], i) => {
    const pct = v / total;
    const a2 = angle + pct * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle), y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    const x3 = cx + rIn * Math.cos(a2), y3 = cy + rIn * Math.sin(a2);
    const x4 = cx + rIn * Math.cos(angle), y4 = cy + rIn * Math.sin(angle);
    const large = pct > 0.5 ? 1 : 0;
    const path = `M${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} L${x3},${y3} A${rIn},${rIn} 0 ${large},0 ${x4},${y4} Z`;
    angle = a2;
    return { path, color: colors[i % colors.length], label: k, value: v, pct: Math.round(pct * 100) };
  });

  return `
    <div style="display:flex; align-items:center; gap:10px;">
      <div style="position:relative; width:130px; height:130px; flex-shrink:0;">
        <svg viewBox="0 0 150 150" style="width:100%; height:100%;">
          ${slices.map(s => `<path d="${s.path}" fill="${s.color}" stroke="white" stroke-width="1.5"/>`).join('')}
        </svg>
        <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); text-align:center;">
          <div style="font-size:18px; font-weight:700; color:var(--c-text);">${total}</div>
          <div style="font-size:10px; color:var(--c-text-muted);">总数</div>
        </div>
      </div>
      <div style="flex:1; display:flex; flex-direction:column; gap:5px; font-size:11.5px;">
        ${slices.map(s => `
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:10px; height:10px; border-radius:2px; background:${s.color}; flex-shrink:0;"></span>
            <span style="flex:1; color:var(--c-text-secondary);">${s.label}</span>
            <span class="text-muted">${s.value} · ${s.pct}%</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 柱状图（横向）
export function renderBarChart(data, gradient) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  return `
    <div style="padding-top:6px; height:130px; display:flex; flex-direction:column; justify-content:center; gap:8px;">
      ${entries.map(([k, v]) => {
        const pct = Math.round(v / max * 100);
        return `
          <div>
            <div style="display:flex; justify-content:space-between; font-size:11.5px; margin-bottom:3px;">
              <span>${k}</span>
              <span class="text-muted">${v} 份</span>
            </div>
            <div style="height:10px; background:var(--c-surface-2); border-radius:5px; overflow:hidden;">
              <div style="height:100%; width:${pct}%; background:${gradient}; border-radius:5px; transition:width 0.3s;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// 评分分布柱状图（垂直）
export function renderRatingBars(buckets) {
  const entries = Object.entries(buckets);
  const max = Math.max(1, ...entries.map(([, v]) => v));
  const colors = ['#10B981', '#155EEF', '#F59E0B', '#EF4444'];
  return `
    <div style="display:flex; align-items:flex-end; gap:14px; height:130px; padding:0 8px;">
      ${entries.map(([k, v], i) => {
        const h = Math.round(v / max * 100);
        return `
          <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:5px;">
            <div style="font-size:11px; font-weight:600; color:var(--c-text-secondary);">${v}</div>
            <div style="width:70%; height:${h}%; min-height:6px; background:${colors[i]}; border-radius:4px 4px 0 0; transition:height 0.3s;"></div>
            <div style="font-size:10px; color:var(--c-text-muted); text-align:center; white-space:nowrap;">${k}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============== Concept Report (产品概念书) ==============
export function renderConceptReport(r) {
  const mkTable = (headers, rows) => `
    <table class="report-mini-table">
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>
  `;
  const section = (num, title, subtitle, bodyHtml, insight) => `
    <div class="report-section">
      <div class="report-section-title">
        <span class="badge badge-blue">${num}</span>
        ${title}
      </div>
      ${subtitle ? `<div class="text-sm text-muted mb-4">${subtitle}</div>` : ''}
      ${bodyHtml}
      ${insight ? `<div class="insight-box"><div class="insight-title">✨ 核心结论</div><div class="insight-text">${insight}</div></div>` : ''}
    </div>
  `;

  return `
    <div style="margin:24px 0; padding-top:24px; border-top:2px solid var(--c-border);">
    </div>

    ${section('一', '产品定义概述', '产品名称建议为"启源A06"，延续启源品牌A系列轿车命名体系，与A05形成高低搭配。品类锁定为三厢紧凑型轿车，是6-8万价格带中容量最大、竞争最充分、用户认知最成熟的细分品类。目标上市年份定为2028年，基于当前产品开发周期（约24-30个月）与竞争窗口期的综合判断——2027-2028年正值L2级智驾从"10万+专属"向"6-8万普及"的关键拐点。产品定位语"大空间智能电混家轿"以三个关键词直接回应用户核心诉求：大空间（打竞品短板）、智能（差异化标签）、电混（动力路线选择）。',
      mkTable(['项目','内容'], [
        ['产品名称建议','启源A06（暂定）'],
        ['品牌归属','长安启源'],
        ['品类','紧凑型轿车（三厢）'],
        ['动力类型','PHEV（插电混动）'],
        ['目标上市年份','2028年'],
        ['车型代号','C358（待定）'],
        ['产品定位','6-8万紧凑型轿车市场 "大空间智能电混家轿"'],
      ]),
      '目标上市年份2028年正值L2智驾从"10万+专属"向"6-8万普及"的关键拐点，是差异化竞争窗口期的最优时间节点。'
    )}

    ${section('二', '目标市场与竞争定位', '目标市场采用"核心占位+机会占位"的双层策略。竞争定位方面，秦PLUS DM-i（月销2.8万）为不可回避的绝对领导者，帝豪、荣威D6、逸动构成主要竞争圈。竞争策略已确认为"差异化竞争"——"6万级唯一标配L2智驾的家轿"。',
      `<div style="margin-bottom:16px;">
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">2.1 目标市场</div>
        ${mkTable(['策略层次','目标','核心逻辑'], [
          ['核心占位','6-7万紧凑型轿车','近3年CAGR 8.2%，2028年预测容量48.6万辆，综合评分8.9分（TOP1）'],
          ['机会占位','7-8万紧凑型轿车','近3年CAGR 6.5%，2028年预测容量42.3万辆，综合评分8.1分（TOP2），以舒适性、高安全立价值，价格上拓'],
        ])}
      </div>
      <div>
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">2.2 竞争定位</div>
        ${mkTable(['项目','内容'], [
          ['目标竞争圈','入门紧凑产品圈'],
          ['核心竞品','秦PLUS DM-i（2026款210KM长续航版，月销2.8万）'],
          ['主要竞品','荣威D6（纯电版）、五菱星光PHEV'],
          ['观察竞品','秦L DM-i低配版（价格存在下探可能）'],
          ['竞争策略','差异化竞争（人工确认于2026.7.28）——"6万级唯一标配L2智驾的PHEV家轿"，以标配L2智驾+后排2拳膝部空间+≥80km纯电续航形成差异化区隔'],
        ])}
      </div>`,
      '差异化策略核心逻辑："6万级唯一标配L2智驾的家轿"——不求品牌力超越秦PLUS，而是以标配L2智驾+后排2拳空间形成差异化区隔，在智能化维度建立用户心智"第一联想"。'
    )}

    ${section('三', '目标用户画像', '目标用户为"成熟务实顾家爸爸"——他不是汽车发烧友，不追求零百加速和品牌溢价，核心关注"一家人坐不坐得下"、"加油贵不贵"、"开车累不累"。这一用户原型为后续所有产品定义提供了统一的判断标准——每项配置决策都可以追问一句"这对顾家爸爸重要吗"。',
      `<div style="margin-bottom:14px; padding:14px; background:var(--c-surface-2); border-radius:var(--r-md);">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
          <span style="font-size:14px;">👤</span>
          <strong style="font-size:13px; color:#1F2937;">用户画像卡片</strong>
          <span class="badge badge-blue" style="font-size:10px;">综合画像</span>
        </div>
        <div style="display:flex; align-items:flex-start; gap:14px; padding:14px; background:white; border-radius:var(--r-md); border:1px solid var(--c-border);">
          <div style="width:56px; height:56px; border-radius:50%; background:linear-gradient(135deg,#2563EB,#1E40AF); color:white; display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700;">顾</div>
          <div style="flex:1;">
            <div style="font-weight:700; font-size:15px; color:#1F2937;">成熟务实顾家爸爸</div>
            <div class="text-sm text-muted" style="margin-top:4px;">年龄37.6岁 · 男性71% · 已婚有孩65.3% · 家庭年收入24.2万</div>
          </div>
        </div>
      </div>

      <div style="margin-bottom:14px; padding:14px; background:linear-gradient(135deg,#F5F3FF 0%,#EFF4FF 100%); border:1px solid #C4B5FD; border-radius:var(--r-md);">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
          <span style="font-size:14px;">🏷️</span>
          <strong style="font-size:13px; color:#4C1D95;">典型标签自动生成</strong>
          <span class="badge badge-purple" style="font-size:10px;">从画像特征提炼</span>
        </div>
        <div style="display:flex; align-items:flex-start; gap:12px; padding:12px; background:white; border-radius:var(--r-md); border:1px solid #E9D5FF;">
          <div style="flex:1; font-size:12px; line-height:1.7; color:#1F2937;">
            <strong>典型标签：</strong>"凤凰男" —— 从奋斗中走来，事业稳定，家庭责任首位，务实理性，追求确定性，不轻易冒险。
          </div>
        </div>
      </div>

      ${mkTable(['维度','核心特征'], [
        ['人口学','37.6岁，男性71%，已婚有孩65.3%，家庭年收入24.2万'],
        ['人生阶段','临近中年，小家庭为主，社会中层，上班族/个体工商户'],
        ['价值观','理性务实，围绕家庭需求，追求确定性和稳定性，品质与实用兼顾，高质价比'],
        ['消费观','汽车是家庭出行的"可靠伙伴"，安全第一、空间第二、省油第三，智能化需实用易用'],
        ['购车情形','增换购67.2%，预算13-16万'],
        ['用车场景','日常通勤+周末家庭出游+接送老人小孩'],
      ])}`,
      '"这对顾家爸爸重要吗"——这一句话是整份概念书所有配置决策的统一判断标准。'
    )}

    ${section('四', '产品核心定义', '贯穿所有定义的一条核心逻辑是：一切以"顾家爸爸"用户的真实需求为起点，以"差异化竞争策略"为终点。',
      `<div style="padding:12px 16px; background:linear-gradient(135deg,#EFF4FF 0%,#F4F0FF 100%); border:1px solid #B9D0FF; border-radius:var(--r-md); margin-bottom:16px;">
        <div style="font-weight:600; font-size:13px; margin-bottom:6px; color:#155EEF;">📌 产品竞争力公式</div>
        <div style="font-size:13px; line-height:1.7; color:#1F2937;">L2智驾全系标配（差异化标签）<strong>+</strong> 后排膝部空间2拳（体验锚点）<strong>+</strong> 馈电油耗≤4.5L（使用成本护城河）<strong>=</strong> 竞品难以快速复制的三重优势组合</div>
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">4.1 车格尺寸：以"大空间"为第一性原理</div>
        <div class="text-sm text-muted mb-4">轴距2750mm是整份概念书中不可妥协的硬指标——它直接决定了后排膝部空间能否达到2拳，而"后排空间局促"恰恰是竞品最大的用户抱怨点。</div>
        ${mkTable(['参数','目标值','竞品对比'], [
          ['车长','4770-4790mm','优于秦PLUS（4765mm）和帝豪（4638mm）'],
          ['轴距','2750mm','超越秦PLUS（2718mm）和帝豪（2650mm）'],
          ['车身形式','传统三厢轿车（非溜背）','保证后排头部空间不妥协'],
        ])}
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">4.2 造型风格：经典大气，规避风险</div>
        ${mkTable(['维度','方向'], [
          ['设计语言','经典大气（TOP1审美，43.7%用户偏好）'],
          ['设计原则','要"经典、大气、沉稳"，不要"古板、老气、张扬"'],
          ['内饰','舒适实用+高级感（58.4%用户偏好），软包覆盖率≥60%'],
        ])}
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">4.3 动力形式：PHEV是最优解</div>
        <div class="text-sm text-muted mb-4">PHEV是综合政策、成本、用户使用场景后的最优解。纯电续航≥80km覆盖目标用户日均通勤里程，实现"日常通勤0油耗"。</div>
        ${mkTable(['参数','目标值'], [
          ['动力类型','PHEV（插电混动）'],
          ['纯电续航（CLTC）','≥80km'],
          ['馈电油耗（WLTC）','≤4.5L/100km'],
          ['综合续航','≥1200km'],
        ])}
      </div>

      <div style="margin-bottom:14px;">
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">4.4 主要配置：差异化与非对称竞争</div>
        <div class="text-sm text-muted mb-4">配置策略分层逻辑："人无我有、人有我优、人优我廉"。</div>
        ${mkTable(['配置域','核心策略','关键配置'], [
          ['智驾','人无我有——6-8万唯一L2标配','ACC+LCC+AEB+360°全景影像'],
          ['空间/舒适','人有我优——同级最大空间','后排膝部空间≥2拳+座椅比例放倒'],
          ['能耗','人有我优——能耗表现领先','纯电续航≥80km+馈电油耗≤4.5L'],
          ['座舱','人优我廉——够用且好用','12.3英寸中控屏+语音控制+CarPlay'],
          ['安全','基础保障——不犯错','6安全气囊+ESP+胎压监测'],
        ])}
      </div>

      <div>
        <div style="font-weight:600; font-size:13px; margin-bottom:8px; color:var(--c-text);">4.5 亮点买点TOP3：一句话记住这款车</div>
        ${mkTable(['排名','亮点买点','竞争逻辑'], [
          ['1','6万级唯一标配L2智驾的PHEV家轿','人无我有——竞品短期无法跟进'],
          ['2','后排膝部空间2拳，全家坐得舒服','人有我优——直接打竞品最大短板'],
          ['3','馈电油耗4.5L/100km，一公里不到4毛钱','人有我优——使用成本持续领先'],
        ])}
      </div>`,
      '"6万级唯一标配L2智驾的家轿"——这一句话是整份概念书最核心的传播提炼，智驾配置高出竞品一个代际，是用户"一句话记住这款车"的关键。'
    )}

    ${section('五', '成本与定价策略建议', '定价核心逻辑为"适度溢价换取明显差异化"——主力款8.28万较秦PLUS主力款高出3000元，对应L2智驾全系标配和后排2拳膝部空间两个可感知的差异化价值。',
      `${mkTable(['项目','建议'], [
        ['目标BOM成本','较秦PLUS DM-i同配置级别 +2%~3%'],
        ['目标指导价区间','7.58万 ~ 9.28万'],
        ['核心款型定价','7.58万（入门款）/ 8.28万（主力款，含L2智驾）/ 9.28万（高配款）'],
        ['性价比定位','"智驾高一级、空间大半级、价格略高3000元"'],
      ])}
      <div style="margin-top:12px; padding:12px 14px; background:var(--c-surface-2); border-radius:var(--r-md); font-size:12px; line-height:1.7; color:var(--c-text-secondary);">
        <strong style="color:var(--c-text);">定价策略解读：</strong><br>
        <strong>7.58万入门款：</strong>配置对标秦PLUS低配（不含L2），价格低4000元，以"质价比"吸引价格敏感型用户到店<br>
        <strong>8.28万主力款：</strong>核心走量款型，含L2智驾全系标配+大空间，以"6万级唯一L2智驾家轿"标签支撑溢价<br>
        <strong>9.28万高配款：</strong>上拓至9万区间，以舒适配置升级满足追求更高体验的用户，实现机会占位
      </div>`,
      'BOM成本可控的核心假设是智驾硬件的平台化采购——利用长安集团百万级年销量的规模优势摊薄成本，形成至少12个月的差异化窗口期。'
    )}

    ${section('六', '核心风险矩阵', '从竞争、成本、政策、用户感知、品牌五个维度识别核心风险并制定应对预案。',
      mkTable(['风险等级','风险描述','影响','应对预案'], [
        ['高','秦PLUS 2027改款将L2下放至全系标配','本品核心差异化被稀释，竞争窗口期大幅缩短','①提前布局L2+作为下一代差异化；②终端策略加大"6万级唯一标配"用户认知抢占'],
        ['高','2026-2028年电池成本波动导致BOM成本超出2%-3%目标','定价优势缩小，溢价空间收窄','①与电池供应商锁定长期框架协议；②保留调整纯电续航至60km的备选方案'],
        ['中','PHEV政策红利变化（绿牌/购置税减免2027年底评估）','价格优势减弱，ICE竞品回流','①提前布局HEV备选方案；②向8万以下用户主打"使用成本"而非政策红利'],
        ['中','用户对"6万级L2智驾"价值感知不足，不愿为3000元溢价买单','主力款定价偏高，走量受阻','①上市前通过配置体验式调研验证支付意愿阈值；②预留3000元上市促销空间作为兜底'],
        ['低','品牌认知度不足','用户到店率低于预期','①利用长安启源品牌背书；②突出"启源"品牌技术标签'],
      ]),
      '两大高风险项（竞品L2下放+电池成本波动）需重点监控，建议每季度复盘一次竞争窗口期与成本波动情况。'
    )}
  `;
}

// 工作台步骤定义
export const workbenchSteps = [
  { num: 1, name: '价格排名与评分', editable: false },
  { num: 2, name: '竞争格局分析', editable: true },
  { num: 3, name: '竞品筛选漏斗', editable: true },
  { num: 4, name: '竞争圈确认', editable: true },
  { num: 5, name: '调研文件上传', editable: false },
  { num: 6, name: '目标用户画像', editable: true },
  { num: 7, name: '审美偏好分析', editable: true },
  { num: 8, name: '需求交叉分析', editable: true },
  { num: 9, name: '竞品特征对标', editable: true },
  { num: 10, name: '配置基准设定', editable: true },
  { num: 11, name: '竞争策略确认', editable: true },
  { num: 12, name: '产品概念生成', editable: false },
];

// 工作台 thinkHtml 辅助
export function thinkHtml(agent, workflow, time, token, node) {
  return `<strong>调用智能体</strong>：${agent}<br><strong>工作流</strong>：${workflow}<br><strong>耗时</strong>：${time} · <strong>Token</strong>：${token}${node ? '<br><strong>节点</strong>：' + node : ''}`;
}

export function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
