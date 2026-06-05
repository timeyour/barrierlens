import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import SiteNav from "@/components/SiteNav";
import {
  TechAnalysisSourceTable,
  TechDataFlowDiagram,
  TechGemmaChainDiagram,
  TechStorageDiagram,
  TechVerifyTimeline,
} from "@/components/tech/TechRouteDiagrams";

export const metadata: Metadata = {
  title: "技术路线｜Gemma 4 如何生成无障碍证据",
  description:
    "从现场照片到结构化报告，BarrierLens 通过 Gemma 4 多模态理解、结构化 JSON 输出、本机归档和可选公开案例池，完成无障碍问题的记录、反馈与复查闭环。",
};

const DEMO_URL = "https://barrierlens-1utx.vercel.app/#tool";
const REPO_URL = "https://github.com/timeyour/barrierlens";

const ANALYSIS_SOURCE_ROWS = [
  { value: "gemma", meaning: "真实 Gemma 4 推理" },
  { value: "ollama", meaning: "本地 Gemma / Ollama 推理" },
  { value: "mock", meaning: "演示数据" },
  {
    value: "mock_fallback",
    meaning: "模型失败后的降级演示，不代表真实模型能力",
  },
] as const;

const DOCS = [
  {
    href: `${REPO_URL}/blob/main/docs/MODEL_PROVENANCE.md`,
    title: "MODEL_PROVENANCE.md",
    note: "模型来源与未微调声明",
  },
  {
    href: `${REPO_URL}/blob/main/docs/LOCAL_REPRODUCE.md`,
    title: "LOCAL_REPRODUCE.md",
    note: "本地复现方式",
  },
  {
    href: `${REPO_URL}/blob/main/docs/GEMMA4_DEPLOYMENT.md`,
    title: "GEMMA4_DEPLOYMENT.md",
    note: "Vercel 部署与环境变量",
  },
  {
    href: `${REPO_URL}/blob/main/docs/TECHNICAL_REPORT.md`,
    title: "TECHNICAL_REPORT.md",
    note: "完整技术报告",
  },
] as const;

const VERIFY_STEPS = [
  {
    step: "1",
    text: (
      <>
        打开{" "}
        <a
          href={DEMO_URL}
          className="font-semibold text-blue-700 underline hover:text-blue-900"
          target="_blank"
          rel="noopener noreferrer"
        >
          正式 Demo
        </a>
      </>
    ),
  },
  { step: "2", text: "上传现场照片或选择样例图" },
  { step: "3", text: "点击「生成报告」（读屏标签为「生成分析」）" },
  {
    step: "4",
    text: "在结果页查看 analysisSource 是否为 gemma；可在浏览器 Network 面板查看 /api/analyze 响应进一步核对",
  },
] as const;

function SectionCard({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm md:p-6"
    >
      <p className="section-eyebrow">{eyebrow}</p>
      <h2 className="mt-2 text-lg font-bold text-slate-900 md:text-xl">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">{children}</div>
    </section>
  );
}

export default function TechPage() {
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <SiteNav />
      <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6">
        <header className="mb-8 md:mb-10">
          <p className="section-eyebrow">技术路线</p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
            技术路线｜Gemma 4 如何生成无障碍证据
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
            从现场照片到结构化报告，BarrierLens 通过 Gemma 4 多模态理解、结构化 JSON
            输出、本机归档和可选公开案例池，完成无障碍问题的记录、反馈与复查闭环。
          </p>
          <p className="mt-3 text-xs text-slate-500">
            项目定位：基于 Gemma 4 的公共空间无障碍通行风险识别与证据生成工具 ·{" "}
            <a
              href={REPO_URL}
              className="font-medium text-blue-700 hover:text-blue-900"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub 仓库
            </a>
          </p>
        </header>

        <div className="space-y-5 md:space-y-6">
          <SectionCard id="overview" eyebrow="01" title="技术总览">
            <p>
              用户上传盲道、坡道、出入口等现场照片后，前端将图片和地点信息提交到{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">/api/analyze</code>
              。后端优先调用 Gemma 4 推理链路，生成问题类型、风险等级、影响人群、责任归口、整改建议等结构化
              JSON。结果进入报告页面，可保存到本机，也可在用户主动确认后公开为案例。
            </p>
          </SectionCard>

          <SectionCard id="data-flow" eyebrow="02" title="核心数据流">
            <TechDataFlowDiagram />
          </SectionCard>

          <SectionCard id="gemma-chain" eyebrow="03" title="Gemma 4 调用链路">
            <TechGemmaChainDiagram />
          </SectionCard>

          <SectionCard id="analysis-source" eyebrow="04" title="结果来源标记 analysisSource">
            <TechAnalysisSourceTable rows={ANALYSIS_SOURCE_ROWS} />
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-900">
              我们不会把 mock 或 mock_fallback 包装成真实 Gemma 结果。
            </p>
          </SectionCard>

          <SectionCard id="storage" eyebrow="05" title="存储与隐私设计">
            <TechStorageDiagram />
            <ul className="mt-4 list-disc space-y-2 pl-5">
              <li>登录不是必需；云端同步失败不影响本机主流程。</li>
            </ul>
          </SectionCard>

          <SectionCard id="deploy" eyebrow="06" title="部署与复现">
            <ul className="space-y-3">
              {DOCS.map((doc) => (
                <li key={doc.href}>
                  <a
                    href={doc.href}
                    className="font-semibold text-blue-700 hover:text-blue-900"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {doc.title}
                  </a>
                  <span className="text-slate-600"> — {doc.note}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard id="verify" eyebrow="07" title="评委快速验证">
            <TechVerifyTimeline steps={VERIFY_STEPS} />
          </SectionCard>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/#tool"
            className="btn-primary inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
          >
            去试用记录工具
          </Link>
          <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            ← 首页
          </Link>
        </div>
      </main>
    </div>
  );
}
