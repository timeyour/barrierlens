import AnchorLink from "@/components/AnchorLink";
import Image from "next/image";
import { HOME_FLOW_ASSETS } from "@/config/uiAssets";

const STEPS = [
  {
    image: HOME_FLOW_ASSETS.capture.src,
    alt: HOME_FLOW_ASSETS.capture.alt,
    title: "拍现场",
    body: "盲道、坡道、入口被占用时，先保留可复查照片。",
  },
  {
    image: HOME_FLOW_ASSETS.report.src,
    alt: HOME_FLOW_ASSETS.report.alt,
    title: "AI 生成报告",
    body: "AI 提取问题类型、风险等级、责任方和整改建议。",
  },
  {
    image: HOME_FLOW_ASSETS.review.src,
    alt: HOME_FLOW_ASSETS.review.alt,
    title: "复查闭环",
    body: "整改后复拍，对比前后状态并归档到本机时间线。",
  },
] as const;

interface HomeFlowShowcaseProps {
  /** mixed 首页不占用整屏 snap */
  snapScreen?: boolean;
}

export default function HomeFlowShowcase({ snapScreen = true }: HomeFlowShowcaseProps) {
  const snapClass = snapScreen
    ? "mobile-snap-screen mobile-snap-screen-scroll"
    : "mobile-no-snap";

  return (
    <section
      id="story"
      aria-label="产品流程介绍"
      className={`${snapClass} relative z-10 scroll-mt-20 py-6 md:py-10`}
    >
      <div className="mx-auto max-w-6xl px-4 md:px-6">
        <div className="relative overflow-hidden rounded-[1.75rem] border border-white/10 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.65)]">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <Image
              src={HOME_FLOW_ASSETS.heroBg.src}
              alt=""
              fill
              className="object-cover object-center scale-105"
              sizes="(max-width: 768px) 100vw, 1152px"
              priority={false}
            />
            <div className="absolute inset-0 bg-slate-950/72" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-slate-950/55 to-slate-950/85" />
          </div>

          <div className="relative px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-200/90">
              BarrierLens
            </p>
            <h2 className="mt-3 max-w-2xl text-[clamp(1.5rem,4.5vw,2.35rem)] font-bold leading-tight tracking-tight text-white">
              用现场照片记录无障碍通行风险
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/78 md:text-[15px]">
              从盲道占用、入口坡道受阻到通行链断点，把路人看到的问题整理成可归档、可复查、可递出的现场报告。
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
              {STEPS.map((step) => (
                <article
                  key={step.title}
                  className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-950/35 backdrop-blur-sm"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-900">
                    <Image
                      src={step.image}
                      alt={step.alt}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                    />
                  </div>
                  <div className="flex flex-1 flex-col px-4 py-4">
                    <h3 className="text-base font-semibold text-white">{step.title}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-white/72 md:text-sm">
                      {step.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <AnchorLink
                href="#tool"
                className="inline-flex rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-900/30 transition hover:bg-blue-500"
              >
                开始拍照记录
              </AnchorLink>
              <AnchorLink
                href="#records"
                className="text-sm font-medium text-white/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                查看我的时间线
              </AnchorLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
