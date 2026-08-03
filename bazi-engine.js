/*
 * bazi-engine.js — 八字 → 前世原型 判定引擎（娱乐向）
 * 仅依赖 lunar-javascript 算出四柱；十神/五行/神煞/原型判定全部自算，逻辑透明可改。
 * 用法（浏览器）： <script src="lunar.js"></script><script src="bazi-engine.js"></script>
 *        const r = analyzeBazi("己巳,丙子,丙寅,甲午", "男");
 * 用法（Node）： const {analyzeBazi}=require('./bazi-engine.js'); analyzeBazi(...)
 */
(function (global) {
  'use strict';

  const GAN = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const ZHI = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const WX  = {甲:'木',乙:'木',丙:'火',丁:'火',戊:'土',己:'土',庚:'金',辛:'金',壬:'水',癸:'水'};
  const YIN = {甲:1,乙:0,丙:1,丁:0,戊:1,己:0,庚:1,辛:0,壬:1,癸:0}; // 1阳 0阴
  const ZHI_WX  = {子:'水',丑:'土',寅:'木',卯:'木',辰:'土',巳:'火',午:'火',未:'土',申:'金',酉:'金',戌:'土',亥:'水'};
  const ZHI_YIN = {子:1,丑:0,寅:1,卯:0,辰:1,巳:0,午:1,未:0,申:1,酉:0,戌:1,亥:0};
  const ZHI_HIDE = { // 藏干：本气 / 中气 / 余气
    子:['癸'],丑:['己','癸','辛'],寅:['甲','丙','戊'],卯:['乙'],
    辰:['戊','乙','癸'],巳:['丙','庚','戊'],午:['丁','己'],未:['己','丁','乙'],
    申:['庚','壬','戊'],酉:['辛'],戌:['戊','辛','丁'],亥:['壬','甲']
  };
  const SHENG = {木:'火',火:'土',土:'金',金:'水',水:'木'};
  const KE    = {木:'土',火:'金',土:'水',金:'木',水:'火'};

  function relation(a, b) {
    if (SHENG[a] === b) return '我生';
    if (SHENG[b] === a) return '生我';
    if (KE[a] === b) return '我克';
    if (KE[b] === a) return '克我';
    return '同';
  }
  // 十神：以 me 为日干，other 为某天干
  function tenGod(me, other) {
    const mw = WX[me], ow = WX[other];
    const my = YIN[me], oy = YIN[other];
    if (mw === ow) return (my === oy) ? '比肩' : '劫财';
    const r = relation(mw, ow);
    if (r === '生我') return (my === oy) ? '偏印' : '正印';
    if (r === '我生') return (my === oy) ? '食神' : '伤官';
    if (r === '克我') return (my === oy) ? '七杀' : '正官';
    if (r === '我克') return (my === oy) ? '偏财' : '正财';
    return '?';
  }

  // ---- 神煞原始映射 ----
  const sanhe = {
    '寅午戌':'寅午戌','申子辰':'申子辰','巳酉丑':'巳酉丑','亥卯未':'亥卯未'
  };
  function sanheGroup(z){ if(['寅','午','戌'].includes(z))return'寅午戌'; if(['申','子','辰'].includes(z))return'申子辰'; if(['巳','酉','丑'].includes(z))return'巳酉丑'; if(['亥','卯','未'].includes(z))return'亥卯未'; return null; }
  const HUAGAI   = {'寅午戌':'戌','申子辰':'辰','巳酉丑':'丑','亥卯未':'未'};
  const TAOHUA   = {'寅午戌':'卯','申子辰':'酉','巳酉丑':'午','亥卯未':'子'};
  const YIMA     = {'寅午戌':'申','申子辰':'寅','巳酉丑':'亥','亥卯未':'巳'};
  const JIANG    = {'寅午戌':'午','申子辰':'子','巳酉丑':'酉','亥卯未':'卯'};
  const WENCHANG = {甲:'巳',乙:'午',丙:'申',丁:'酉',戊:'申',己:'酉',庚:'亥',辛:'子',壬:'寅',癸:'卯'};
  const HONGYAN  = {甲:'午',乙:'申',丙:'酉',丁:'戌',戊:'未',己:'未',庚:'辰',辛:'辰',壬:'寅',癸:'卯'};
  const GUOYIN   = {甲:'戌',乙:'亥',丙:'丑',丁:'寅',戊:'丑',己:'寅',庚:'辰',辛:'巳',壬:'未',癸:'申'};
  const JINYU    = {甲:'辰',乙:'巳',丙:'申',丁:'酉',戊:'午',己:'未',庚:'辰',辛:'巳',壬:'寅',癸:'卯'};
  const LUSHEN   = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'巳',己:'午',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  const YANGREN  = {甲:'卯',乙:'辰',丙:'午',丁:'未',戊:'午',己:'未',庚:'酉',辛:'戌',壬:'子',癸:'丑'};
  const TIANCHU  = {甲:'寅',乙:'卯',丙:'巳',丁:'午',戊:'辰',己:'巳',庚:'申',辛:'酉',壬:'亥',癸:'子'};
  const TAICHI   = {甲:['子','午'],乙:['子','午'],丙:['卯','酉'],丁:['卯','酉'],戊:['辰','戌','丑','未'],己:['辰','戌','丑','未'],庚:['寅','亥'],辛:['寅','亥'],壬:['巳','申'],癸:['巳','申']};
  const TIANYI   = {甲:['丑','未'],乙:['子','申'],丙:['亥','酉'],丁:['亥','酉'],戊:['丑','未'],己:['子','申'],庚:['丑','未'],辛:['午','寅'],壬:['卯','巳'],癸:['卯','巳']};
  const GUCHEN   = {'寅卯辰':'巳','巳午未':'申','申酉戌':'亥','亥子丑':'寅'};
  const TIANYI2  = {寅:'丑',卯:'寅',辰:'卯',巳:'辰',午:'巳',未:'午',申:'未',酉:'申',戌:'酉',亥:'戌',子:'亥',丑:'子'}; // 天医 by 月支

  // 六十甲子 + 空亡
  const JIAZI = [];
  for (let i = 0; i < 60; i++) JIAZI.push(GAN[i % 10] + ZHI[i % 12]);
  const KONG = {0:['戌','亥'],1:['申','酉'],2:['午','未'],3:['辰','巳'],4:['寅','卯'],5:['子','丑']};

  // ---- 原型文本（取自 bazi-pastlife-archetypes 文档，精简） ----
  const PROTOS = {
    武士:{name:'武士',core:'七杀、羊刃、金旺、驿马',light:'忠义护持',shadow:'残暴武夫',
      story:'沙场、校场、江湖。刀锋上走过来的人，把"守护"刻进了骨头里。',lesson:'守护不等于掌控，有时候放手里的人走，才是真的护。'},
    领主:{name:'领主',core:'财官相生、厚土、天乙贵人',light:'担责统筹',shadow:'压榨独裁',
      story:'城堡、账册、疆界。站在人群前面分配资源与秩序的人，习惯了被仰望。',lesson:'权力是托付不是天赋，基业要有人愿意接，才叫基业。'},
    交际花:{name:'交际花',core:'食伤、桃花咸池、金水秀气',light:'共情周旋',shadow:'浮华空虚',
      story:' salon、宴席、后宫。在人群里游刃有余，却最难被人真正走近。',lesson:'你值得一种不靠周旋也能成立的亲密。'},
    神官:{name:'神官',core:'华盖、太极、偏印、丁火',light:'灵性慈悲',shadow:'迂腐清高',
      story:'庙堂、道观、祭坛。替人接通更高的东西，自己却常悬在半空。',lesson:'神性不在远离人间，而在把慈悲落回具体的手。'},
    医者:{name:'医者',core:'食神偏印、木火通明、天医',light:'慈悲救度',shadow:'执念自苦',
      story:'药庐、病理、问诊。见多了苦，把手练成了安抚别人的形状。',lesson:'你救不了所有人，先别把自己赔进去。'},
    谋士:{name:'谋士',core:'偏印七杀、水火相济、文昌',light:'运筹帷幄',shadow:'算计冷血',
      story:'帷幄、棋局、暗线。站在主公身后，用脑子替人决定生死。',lesson:'算得清天下，也算不清自己的心，那就别算太狠。'},
    商贾:{name:'商贾',core:'财星双旺、土金、驿马',light:'流通生财',shadow:'唯利是图',
      story:'市集、商路、钱庄。把东西和人可以流动起来，就是他的本事。',lesson:'财富是流动的河，攥太紧反而漏得快。'},
    文人:{name:'文人',core:'正印食神、木火通明、文昌',light:'才华横溢',shadow:'尖酸酸儒',
      story:'书斋、诗稿、讲堂。用一支笔安放理想，也常拿来刺痛现实。',lesson:'怀才不必急于被看见，先把自己活成值得被读的样子。'},
    刺客:{name:'刺客',core:'七杀偏印、金旺、羊刃孤辰',light:'恩义侠气',shadow:'冷血偏执',
      story:'暗夜、独行、一击。认准一个"该"字，就把命押上去。',lesson:'义气很贵，别为不值得的人一次用完。'},
    隐士:{name:'隐士',core:'偏印极旺、华盖空亡、水木清奇',light:'清修自在',shadow:'逃避孤僻',
      story:'山林、茅屋、琴书。看透了热闹，主动退到安静里。',lesson:'退是为了养，不是为了永远躲。'},
    工匠:{name:'工匠',core:'食神七杀、金旺/木旺、将星',light:'极致专注',shadow:'完美强迫',
      story:'作坊、刻刀、窑火。把器物做到有魂，是他对世界的态度。',lesson:'物可以有魂，人不必被物绑架。'},
    帝王:{name:'帝王',core:'财官印全、五行均衡、将星帝旺',light:'君临天下',shadow:'孤家寡人',
      story:'御座、江山、史册。站在最高处，也最怕脚下空。',lesson:'坐得越高，越要记得自己是个人。'},
    农夫:{name:'农夫',core:'正印食神、土旺木旺、天厨',light:'安稳踏实',shadow:'固守怯变',
      story:'田地、节气、收成。靠双手和土地说话，最懂等待。',lesson:'安稳是福，但变化来了，别只会发抖。'},
    探险家:{name:'探险家',core:'伤官七杀、驿马重重、水旺',light:'自由好奇',shadow:'漂泊无根',
      story:'大漠、深海、雪山。世界那么大，总想再走远一点。',lesson:'找到心里的家，就不必永远在路上找。'},
    优伶:{name:'优伶 / 艺人',core:'食伤桃花、红艳、华盖带桃花、文昌',light:'灵动才子',shadow:'戏精薄命',
      story:'戏班、教坊、锣鼓。台上是别人的悲欢，台下是自己的孤寒。',lesson:'分清角色与自己，不必永远在台上才被爱。'},
    讼师:{name:'讼师 / 辩士',core:'伤官驾杀、金白水清、文昌词馆',light:'雄辩护弱',shadow:'利口讼棍',
      story:'衙门、公堂、说客。一句话翻案，一句话害人，赢是本能。',lesson:'不是每件事都要赢，沉默有时比反驳有力。'},
    方士:{name:'方士 / 术士',core:'偏印极旺、华盖空亡、金水相生',light:'世外高人',shadow:'故弄玄虚',
      story:'道观游走、炼丹占卜、江湖术数。半真半假，亦正亦邪。',lesson:'神秘不是围墙，让人靠近你，不必躲在看不懂后面。'}
  };

  // ---- 17 原型打分 ----
  const SCORERS = {
    武士:c=>(2*c.tg['七杀'])+(c.has('羊刃')?2:0)+(c.wx['金']>=3?2:0)+((c.tg['比肩']+c.tg['劫财'])>=2?1:0),
    领主:c=>(c.tg['正官']>0?2:0)+(c.tg['正财']>0?2:0)+((c.tg['正官']>0&&c.tg['正财']>0)?2:0)+(c.wx['土']>=3?1:0)+((c.has('将星')||c.has('天乙贵人'))?1:0),
    交际花:c=>(c.tg['食神']+c.tg['伤官'])+(c.has('桃花')?2:0)+(c.has('红艳')?2:0)+((c.wx['金']>=2&&c.wx['水']>=2)?1:0),
    神官:c=>(c.has('华盖')?3:0)+(c.has('太极贵人')?3:0)+(c.tg['偏印']>=1?2:0)+(c.dayGan==='丁'?1:0)+(c.has('空亡')?1:0),
    医者:c=>(c.tg['食神']>=1?1:0)+(c.tg['偏印']>=1?1:0)+((c.wx['木']>=2&&c.wx['火']>=2)?2:0)+(c.has('天医')?3:0),
    谋士:c=>(c.tg['偏印']>=1?2:0)+(c.tg['七杀']>=1?2:0)+(c.has('文昌')?2:0)+((c.wx['水']>=2&&c.wx['火']>=2)?1:0),
    商贾:c=>(c.tg['正财']+c.tg['偏财'])+((c.wx['土']>=2&&c.wx['金']>=2)?2:0)+(c.has('驿马')?1:0),
    文人:c=>(c.tg['正印']>=1?2:0)+(c.tg['食神']>=1?1:0)+((c.wx['木']>=2&&c.wx['火']>=2)?2:0)+(c.has('文昌')?2:0),
    刺客:c=>(c.tg['七杀']>=1?2:0)+(c.tg['偏印']>=1?1:0)+(c.wx['金']>=3?2:0)+(c.has('羊刃')?2:0)+(c.has('孤辰')?1:0),
    隐士:c=>(c.tg['偏印']>=2?3:0)+(c.has('华盖')?2:0)+(c.has('空亡')?2:0)+((c.wx['水']>=2&&c.wx['木']>=2)?1:0),
    工匠:c=>(c.tg['食神']>=1?1:0)+(c.tg['七杀']>=1?1:0)+((c.wx['金']>=3||c.wx['木']>=3)?2:0)+(c.has('将星')?2:0),
    帝王:c=>(c.tg['正财']>0?1:0)+(c.tg['正官']>0?1:0)+(c.tg['正印']>0?1:0)+((c.tg['正财']>0&&c.tg['正官']>0&&c.tg['正印']>0)?3:0)+((c.wx['木']>0&&c.wx['火']>0&&c.wx['土']>0&&c.wx['金']>0&&c.wx['水']>0)?1:0)+(c.has('将星')?1:0),
    农夫:c=>(c.tg['正印']>=1?1:0)+(c.tg['食神']>=1?1:0)+(c.wx['土']>=3?2:0)+(c.wx['木']>=2?1:0)+(c.has('天厨')?2:0),
    探险家:c=>(c.tg['伤官']>=1?1:0)+(c.tg['七杀']>=1?1:0)+(c.has('驿马')?3:0)+(c.wx['水']>=3?2:0)+(c.has('孤辰')?1:0),
    优伶:c=>(c.tg['食神']+c.tg['伤官'])+(c.has('桃花')?2:0)+(c.has('红艳')?2:0)+(c.has('文昌')?2:0)+(c.has('华盖')?1:0)+((c.wx['火']>=2&&c.wx['木']>=2)?1:0),
    讼师:c=>(c.tg['伤官']>=1?2:0)+(c.tg['七杀']>=1?2:0)+((c.tg['伤官']>=1&&c.tg['七杀']>=1)?2:0)+(c.has('文昌')?2:0)+((c.wx['金']>=2&&c.wx['水']>=2)?1:0),
    方士:c=>(c.tg['偏印']>=2?3:0)+(c.has('华盖')?2:0)+(c.has('空亡')?2:0)+(c.has('太极贵人')?3:0)+(c.has('孤辰')?1:0)+((c.wx['金']>=2&&c.wx['水']>=2)?1:0)
  };

  // ---- 主函数 ----
  function analyzeBazi(bazi, gender) {
    const pillars = bazi.split(',').map(s => [s[0], s[1]]);
    const [Y, M, D, T] = pillars;
    const dayGan = D[0], dayZhi = D[1];
    const allZhi = [Y[1], M[1], D[1], T[1]];

    // 十神（天干 + 地支本气）
    const tg = {比肩:0,劫财:0,食神:0,伤官:0,正财:0,偏财:0,正官:0,七杀:0,正印:0,偏印:0};
    pillars.forEach(p => {
      tg[tenGod(dayGan, p[0])]++;
      tg[tenGod(dayGan, ZHI_HIDE[p[1]][0])]++;
    });

    // 五行（天干1 + 地支藏干加权）
    const wx = {木:0,火:0,土:0,金:0,水:0};
    const wxc = {木:0,火:0,土:0,金:0,水:0};
    pillars.forEach(p => {
      wx[WX[p[0]]] += 1; wxc[WX[p[0]]]++;
      const hide = ZHI_HIDE[p[1]];
      wx[ZHI_WX[p[1]]] += 1; wxc[ZHI_WX[p[1]]]++;
      if (hide[1]) wx[WX[hide[1]]] += 0.5;
      if (hide[2]) wx[WX[hide[2]]] += 0.25;
    });

    // 神煞
    const gods = new Set();
    const inZhi = z => allZhi.includes(z);
    [dayZhi, Y[1]].forEach(basis => {
      const g = sanheGroup(basis);
      if (!g) return;
      if (inZhi(HUAGAI[g])) gods.add('华盖');
      if (inZhi(TAOHUA[g])) gods.add('桃花');
      if (inZhi(YIMA[g]))   gods.add('驿马');
      if (inZhi(JIANG[g]))  gods.add('将星');
    });
    const byGan = (map, name) => { const z = map[dayGan]; if (z && inZhi(z)) gods.add(name); };
    const byGanArr = (map, name) => { (map[dayGan]||[]).forEach(z => { if (inZhi(z)) gods.add(name); }); };
    byGan(WENCHANG,'文昌'); byGan(HONGYAN,'红艳'); byGan(GUOYIN,'国印');
    byGan(JINYU,'金舆'); byGan(LUSHEN,'禄神'); byGan(YANGREN,'羊刃'); byGan(TIANCHU,'天厨');
    byGanArr(TAICHI,'太极贵人'); byGanArr(TIANYI,'天乙贵人');
    // 孤辰 by 年支
    let gc = null;
    if (['寅','卯','辰'].includes(Y[1])) gc='巳';
    else if (['巳','午','未'].includes(Y[1])) gc='申';
    else if (['申','酉','戌'].includes(Y[1])) gc='亥';
    else if (['亥','子','丑'].includes(Y[1])) gc='寅';
    if (gc && inZhi(gc)) gods.add('孤辰');
    // 天医 by 月支
    const tym = TIANYI2[M[1]]; if (tym && inZhi(tym)) gods.add('天医');
    // 空亡 by 日柱
    const idx = JIAZI.indexOf(D[0]+D[1]);
    const kong = KONG[Math.floor(idx/10)] || [];
    const hasKong = kong.some(z => inZhi(z));
    if (hasKong) gods.add('空亡');

    // 评分上下文
    const ctx = { tg, wx, wxc, gods, dayGan, dayZhi, monthZhi:M[1], yearZhi:Y[1], timeZhi:T[1],
                  has: n => gods.has(n) };
    const scores = {};
    Object.keys(SCORERS).forEach(k => { scores[k] = SCORERS[k](ctx); });
    const total = Object.values(scores).reduce((a,b)=>a+b,0) || 1;
    const ranked = Object.keys(scores)
      .map(k => ({ key:k, score:scores[k], pct:Math.round(scores[k]/total*100) }))
      .sort((a,b)=>b.score-a.score);

    // 每柱十神/五行（展示用）
    const pillarsInfo = pillars.map(p => ({
      gan:p[0], zhi:p[1],
      ganGod:tenGod(dayGan,p[0]),
      zhiBen:ZHI_HIDE[p[1]][0],
      zhiGod:tenGod(dayGan,ZHI_HIDE[p[1]][0]),
      ganWX:WX[p[0]], zhiWX:ZHI_WX[p[1]]
    }));

    const main = ranked[0], vice = ranked[1];
    return {
      bazi, gender,
      pillars, pillarsInfo, dayGan, dayZhi,
      tenGods: tg, wuxing: wx, wuxingCount: wxc,
      gods: Array.from(gods), kongwang: kong,
      scores, ranked,
      main: main ? { key:main.key, pct:main.pct, ...PROTOS[main.key] } : null,
      vice: vice ? { key:vice.key, pct:vice.pct, ...PROTOS[vice.key] } : null,
      protos: PROTOS
    };
  }

  const api = { analyzeBazi, tenGod, PROTOS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else global.BaziEngine = api;
})(typeof window !== 'undefined' ? window : this);
