/**
 * UI 素材路径配置
 * 桌面对比区：畅通/占用实拍；手机 mockup 特写用 scene-blocked-close.png
 */
const V = "?v=8";
const STREET_V = "?v=2";

export const HERO_VIDEO = `/videos/hero-demo.mp4?v=9`;
/** 与 hero-demo.mp4 同帧截取，避免视频加载前闪旧对比图 */
export const HERO_POSTER = `/images/hero-demo-poster.jpg?v=1`;

/** 首页第二屏三栏流程图（用户提供的实拍 / mockup） */
export const HOME_FLOW_ASSETS = {
  heroBg: {
    src: "/images/home-flow-hero-bg.png",
    alt: "",
    width: 1200,
    height: 800,
  },
  capture: {
    src: "/images/home-flow-capture.png",
    alt: "现场拍照记录盲道占用",
    width: 1200,
    height: 800,
  },
  report: {
    src: "/images/home-flow-report.png",
    alt: "AI 生成结构化报告示意",
    width: 1200,
    height: 800,
  },
  review: {
    src: "/images/home-flow-review.png",
    alt: "整改前后对比与复查闭环",
    width: 1200,
    height: 800,
  },
} as const;

export const UI_ASSETS = {
  hero: {
    src: `/images/hero-poster.svg${V}`,
    fallback: `/images/hero-poster.svg${V}`,
    alt: "无障碍盲道环境示意图（虚构场景）",
    width: 1920,
    height: 1080,
  },
  overlay: {
    back: {
      src: `/images/scene-clear-street.png${STREET_V}`,
      fallback: `/images/scene-clear-street.png${STREET_V}`,
      alt: "盲道畅通街景实拍示意",
      width: 1024,
      height: 559,
    },
    front: {
      src: `/images/scene-blocked-street.png${STREET_V}`,
      fallback: `/images/scene-blocked-street.png${STREET_V}`,
      alt: "盲道被占用街景实拍示意",
      width: 1024,
      height: 559,
    },
  },
} as const;

export const GEMINI_PROMPTS = {
  hero: `设计一张网站 Hero 全屏背景图，16:9 横版，1920×1080。

产品：「无碍 BarrierLens」——公众无障碍反馈工具。

画面内容（重要）：
- 低机位俯拍人行道，画面主体 70% 是地面与黄色凸点盲道
- 背景只有模糊的城市轮廓，不要清晰可辨的地标建筑
- 可以是模糊的地铁出入口轮廓，但必须是【虚构、通用】造型

严格禁止：
- 禁止任何可阅读文字（中文/英文/数字）
- 禁止真实地铁站名（如陆家嘴、人民广场等）
- 禁止东方明珠、上海中心等可识别地标
- 禁止真实品牌 Logo、站牌、线路号

风格：真实摄影感、专业公益科技调性；画面略偏暗，便于叠加白色标题。`,

  sceneClear: `设计一张网站配图，4:3 横版，1200×900 —— 【盲道畅通】。

构图要求（最重要）：
- 近景俯拍 45°，黄色盲道占画面主体 60% 以上
- 背景建筑、出入口全部虚焦模糊，不可识别
- 与「占用状态」图：同一虚构场景、同一机位、同一透视

画面内容：
- 黄色凸点盲道完整连续，无任何占用物
- 灰色人行道、少量绿化即可

严格禁止：
- 禁止站名、路牌、地铁线路号、任何可读文字
- 禁止真实地标（东方明珠、陆家嘴天际线等）
- 禁止出现具体城市名称

风格：真实街景摄影感；这是示意图，不对应任何真实物理位置。`,

  sceneBlocked: `设计一张网站配图，4:3 横版，1200×900 —— 【盲道占用】。

⚠️ 必须与「畅通状态」图：同一虚构场景、同一机位、同一透视（用于网页对比）。

构图要求：
- 近景俯拍 45°，盲道占画面主体 60% 以上
- 背景全部虚焦，不可识别具体地点

画面内容：
- 同一条黄色盲道被 2–3 辆共享单车 + 1 辆电动车占用
- 盲道连续性明显阻断

严格禁止：
- 禁止站名、路牌、地铁线路号、任何可读文字
- 禁止真实地标与可识别天际线
- 禁止暗示这是某个真实车站

风格：真实摄影感；示意图，不对应任何真实物理位置。`,

  optionalMobile: `设计一张移动端 App 展示用 UI mockup 配图，9:16 竖版，1080×1920（可选）。

产品界面概念：「无碍 BarrierLens」
- 顶部：上传现场照片区域
- 中部：反馈对象选择（物业 / 社区 / 商场 / 城管）
- 底部：「生成反馈报告」蓝色按钮
- 下方：结构化报告卡片（问题类型、风险等级、影响群体）

风格：
- 简洁白底，蓝色 #2563EB + 绿色 #059669 主色
- 像真实上线产品，不要 Material Design demo 感
- 中文界面
- 干净圆角卡片，移动端优先

不要真实品牌 Logo，产品名用「无碍 BarrierLens」。`,
} as const;

/** 复制给 Gemini 的一键清单（若将来替换 PNG，须无地标） */
export const GEMINI_FILE_CHECKLIST = [
  "public/images/hero-poster.svg    ← Hero 背景（当前使用 SVG 示意图）",
  "public/images/scene-clear-street.png   ← 对比图·畅通（用户实拍）",
  "public/images/scene-blocked-street.png  ← 对比图·占用（用户实拍）",
  "public/images/scene-blocked-close.png ← 手机 mockup 特写（用户实拍）",
  "public/videos/hero-demo.mp4         ← 桌面 Hero 背景循环（用户剪辑）",
] as const;
