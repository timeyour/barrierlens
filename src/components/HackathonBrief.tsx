"use client";

import ScrollReveal from "@/components/ScrollReveal";
import SectionHeader from "@/components/SectionHeader";
import { useState } from "react";

/** 对齐 hackathon.googdg.cn 评审维度与提交要求 */
const JUDGING = [
  {
    weight: "30%",
    title: "真实社会影响",
    desc: "聚焦盲道占用高频场景；公众记录 + 物业自查双模式，服务志愿者、残联与基层治理。",
  },
  {
    weight: "25%",
    title: "技术深度",
    desc: "Gemma 4 多模态视觉理解 + JSON 结构化输出；Prompt 工程 + Mock 降级，可切换真实 API。",
  },
  {
    weight: "20%",
    title: "完整度",
    desc: "上传 → 分析 → 时间线归档 → 双模板导出；移动端可用，公网 Demo 可运行。",
  },
  {
    weight: "15%",
    title: "创新",
    desc: "从单次投诉转向公民证据库；参考 Project Sidewalk / FixMyStreet 的「记录即问责」路径。",
  },
  {
    weight: "10%",
    title: "呈现质量",
    desc: "在线 Demo + 代码仓库 + ≤5 分钟视频 + 技术报告（6/8 提交四件套）。",
  },
];

const SUBMISSION = [
  "代码仓库（GitHub）",
  "在线 Demo URL（Vercel）",
  "Demo 视频 ≤ 5 分钟",
  "技术报告（架构 / Gemma 4 用法 / 测试数据）",
];

const RULES = [
  "核心模型：Gemma 4（任意规格）",
  "赛道 D · AI for Social Good · 无障碍",
  "训练数据来源可披露，符合隐私法规",
  "团队：小马过河 · 上海站",
];

export default function HackathonBrief() {
  const [open, setOpen] = useState(false);

  return (
    <ScrollReveal>
      <section id="hackathon" className="mb-10 scroll-mt-28 sm:mb-14">
        <SectionHeader
          eyebrow="Gemma 4 Hackathon 2026"
          title="参赛对齐说明"
          description="赛道 D · AI for Social Good — 用 Gemma 4 将现场照片转化为可归档、可汇总的无障碍问题证据。"
          align="center"
        />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mx-auto mb-4 flex w-full max-w-xl items-center justify-between gap-3 rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-3 text-left text-sm text-blue-900 transition hover:border-blue-300 sm:px-5"
          aria-expanded={open}
        >
          <span>
            <strong>提交截止：</strong>2026 年 6 月 8 日 23:59
            <span className="mt-0.5 block text-xs text-blue-700/80">
              代码 + 视频 + 技术报告 + 在线 Demo · 团队：小马过河 · 无碍
            </span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-blue-700">
            {open ? "收起 ▲" : "展开评委说明 ▼"}
          </span>
        </button>

        {open && (
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="glass-card p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-slate-900">评审维度对应</h3>
              <ul className="mt-4 space-y-3">
                {JUDGING.map((item) => (
                  <li key={item.title} className="flex gap-3 text-sm">
                    <span className="flex aspect-square h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold leading-tight text-blue-800">
                      {item.weight}
                    </span>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800">{item.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {item.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3">
              <div className="glass-card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-900">最终提交四件套</h3>
                <ul className="mt-3 space-y-2">
                  {SUBMISSION.map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span className="text-emerald-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="glass-card p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-slate-900">赛制与合规</h3>
                <ul className="mt-3 space-y-2">
                  {RULES.map((item) => (
                    <li key={item} className="text-xs leading-relaxed text-slate-600">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 text-xs leading-relaxed text-violet-900">
                <strong>Gemma 4 在本项目中的角色：</strong>
                多模态理解现场照片 → 识别盲道占用与风险 → 结构化 JSON（问题类型、影响群体、建议）
                → 按模式生成公众倡导摘要或物业自查整改单。非简单识图，是「视觉理解 + 结构化生成」。
              </div>
            </div>
          </div>
        )}
      </section>
    </ScrollReveal>
  );
}
