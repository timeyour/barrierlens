#!/usr/bin/env node
/**
 * 无碍 BarrierLens 多轮测试
 * Round 0: 静态检查（build 由 npm script 前置）
 * Round 1: API 冒烟（每类图片 × 双模式）
 * Round 2: 场景归类矩阵（4 部门 × 代表图片）
 * Round 3: 规模测试（≥30 条，覆盖全部测试图 + 参数组合）
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const IMAGES_DIR = path.join(ROOT, "public/images");
const REPORTS_DIR = path.join(ROOT, "tests/reports");
const BASE_URL = process.env.TEST_BASE_URL ?? "http://localhost:3000";

const DEPARTMENTS = ["物业", "社区", "商场", "城管"];
const MODES = [
  { recordMode: "public", label: "公众记录" },
  { recordMode: "inspection", label: "物业自查" },
];

const REQUIRED_FIELDS = [
  "issueType",
  "riskLevel",
  "affectedGroups",
  "sceneDescription",
  "suggestion",
  "reportText",
  "advocacyText",
  "inspectionText",
];

function listTestImages() {
  return fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(png|jpe?g|webp)$/i.test(f))
    .sort();
}

function buildCases(images) {
  const blocked = images.filter((f) => /blocked/i.test(f));
  const primary = blocked.length ? blocked : images;

  const round1 = [];
  for (const mode of MODES) {
    round1.push({
      id: `smoke-${mode.recordMode}`,
      image: primary[0],
      targetDepartment: "物业",
      recordMode: mode.recordMode,
      location: "上海·测试点位 A",
    });
  }

  const round2 = [];
  for (const dept of DEPARTMENTS) {
    round2.push({
      id: `dept-${dept}`,
      image: primary[Math.min(1, primary.length - 1)] ?? primary[0],
      targetDepartment: dept,
      recordMode: "public",
      location: `上海·${dept}辖区样例`,
    });
  }

  const round3 = [];
  let idx = 0;
  for (const image of images) {
    for (const dept of DEPARTMENTS) {
      const mode = MODES[idx % MODES.length];
      round3.push({
        id: `scale-${String(idx + 1).padStart(2, "0")}`,
        image,
        targetDepartment: dept,
        recordMode: mode.recordMode,
        location: idx % 3 === 0 ? undefined : `上海·样例点位 ${idx + 1}`,
      });
      idx += 1;
    }
  }

  // 补充至 ≥30：用 blocked 图重复不同文件名种子（Mock 按 fileName 哈希）
  while (round3.length < 30 && primary.length > 0) {
    const image = primary[round3.length % primary.length];
    const dept = DEPARTMENTS[round3.length % DEPARTMENTS.length];
    const mode = MODES[round3.length % MODES.length];
    round3.push({
      id: `scale-extra-${round3.length + 1}`,
      image,
      targetDepartment: dept,
      recordMode: mode.recordMode,
      location: `上海·扩展样例 ${round3.length + 1}`,
      fileAlias: `synthetic-case-${round3.length + 1}.jpg`,
    });
  }

  return [
    { name: "Round 1 · API 冒烟", cases: round1 },
    { name: "Round 2 · 场景归类矩阵", cases: round2 },
    { name: "Round 3 · 规模测试 (≥30)", cases: round3 },
  ];
}

function validateResult(body, testCase) {
  const errors = [];
  for (const field of REQUIRED_FIELDS) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      errors.push(`缺少字段: ${field}`);
    }
  }
  if (!Array.isArray(body.affectedGroups) || body.affectedGroups.length === 0) {
    errors.push("affectedGroups 为空");
  }
  if (!["低", "中", "高"].includes(body.riskLevel)) {
    errors.push(`riskLevel 非法: ${body.riskLevel}`);
  }
  const expectedText =
    testCase.recordMode === "inspection"
      ? body.inspectionText
      : body.advocacyText;
  if (body.reportText !== expectedText) {
    errors.push("reportText 与 recordMode 不匹配");
  }
  return errors;
}

async function runCase(testCase) {
  const imagePath = path.join(IMAGES_DIR, testCase.image);
  if (!fs.existsSync(imagePath)) {
    return {
      ...testCase,
      ok: false,
      status: 0,
      latencyMs: 0,
      errors: [`图片不存在: ${testCase.image}`],
    };
  }

  const buffer = fs.readFileSync(imagePath);
  const blob = new Blob([buffer], { type: "image/png" });
  const fileName = testCase.fileAlias ?? testCase.image;
  const form = new FormData();
  form.append("image", blob, fileName);
  form.append("targetDepartment", testCase.targetDepartment);
  form.append("recordMode", testCase.recordMode);
  if (testCase.location) {
    form.append("location", testCase.location);
  }

  const started = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: "POST",
      body: form,
    });
    const latencyMs = Math.round(performance.now() - started);
    const body = await res.json();

    if (!res.ok) {
      return {
        ...testCase,
        ok: false,
        status: res.status,
        latencyMs,
        errors: [body.error ?? `HTTP ${res.status}`],
        mockMode: body.mockMode,
      };
    }

    const errors = validateResult(body, testCase);
    if (latencyMs > 8000) {
      errors.push(`耗时超标: ${latencyMs}ms > 8000ms`);
    }

    return {
      ...testCase,
      ok: errors.length === 0,
      status: res.status,
      latencyMs,
      errors,
      mockMode: body.mockMode,
      riskLevel: body.riskLevel,
      issueType: body.issueType,
    };
  } catch (error) {
    return {
      ...testCase,
      ok: false,
      status: 0,
      latencyMs: Math.round(performance.now() - started),
      errors: [error instanceof Error ? error.message : String(error)],
    };
  }
}

function printRoundSummary(round, results) {
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  const avgLatency = Math.round(
    results.reduce((s, r) => s + r.latencyMs, 0) / Math.max(results.length, 1),
  );
  const maxLatency = Math.max(...results.map((r) => r.latencyMs));

  console.log(`\n${"=".repeat(60)}`);
  console.log(`${round.name}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`通过: ${passed}/${results.length}  失败: ${failed}`);
  console.log(`平均耗时: ${avgLatency}ms  最大耗时: ${maxLatency}ms`);

  for (const r of results) {
    const mark = r.ok ? "✅" : "❌";
    const mode = r.recordMode === "inspection" ? "自查" : "公众";
    console.log(
      `${mark} ${r.id} | ${r.image} | ${r.targetDepartment}/${mode} | ${r.latencyMs}ms` +
        (r.riskLevel ? ` | ${r.riskLevel}` : "") +
        (r.errors?.length ? ` | ${r.errors.join("; ")}` : ""),
    );
  }

  return { passed, failed, avgLatency, maxLatency, total: results.length };
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const res = await fetch(BASE_URL, { method: "GET" });
      if (res.ok || res.status === 304) return true;
    } catch {
      // retry
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  const images = listTestImages();
  if (images.length === 0) {
    console.error("未找到测试图片，请检查 public/images/");
    process.exit(1);
  }

  console.log("无碍 BarrierLens · 多轮测试");
  console.log(`Base URL: ${BASE_URL}`);
  console.log(`测试图片: ${images.length} 张`);
  console.log(`Mock 模式: ${process.env.GEMMA_API_KEY ? "否（已配置 GEMMA_API_KEY）" : "是"}`);

  const ready = await waitForServer();
  if (!ready) {
    console.error(`服务未就绪: ${BASE_URL}，请先 npm run dev`);
    process.exit(1);
  }

  const rounds = buildCases(images);
  const allResults = [];
  const roundSummaries = [];

  for (const round of rounds) {
    const results = [];
    for (const testCase of round.cases) {
      const result = await runCase(testCase);
      results.push(result);
      allResults.push({ round: round.name, ...result });
    }
    roundSummaries.push({ ...printRoundSummary(round, results), name: round.name });
  }

  const totalPassed = allResults.filter((r) => r.ok).length;
  const totalFailed = allResults.length - totalPassed;
  const successRate = ((totalPassed / allResults.length) * 100).toFixed(1);
  const avgLatency = Math.round(
    allResults.reduce((s, r) => s + r.latencyMs, 0) / allResults.length,
  );

  console.log(`\n${"#".repeat(60)}`);
  console.log("汇总");
  console.log(`${"#".repeat(60)}`);
  console.log(`总用例: ${allResults.length}  通过: ${totalPassed}  失败: ${totalFailed}`);
  console.log(`结构化成功率: ${successRate}% (目标 ≥95%)`);
  console.log(`平均分析耗时: ${avgLatency}ms (目标 ≤8000ms)`);
  console.log(`测试照片覆盖: ${images.length} 张 (目标 ≥30 张需扩充数据集)`);

  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const reportPath = path.join(REPORTS_DIR, `multiround-${stamp}.json`);
  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    mockMode: !process.env.GEMMA_API_KEY,
    imageCount: images.length,
    images,
    roundSummaries,
    totals: {
      cases: allResults.length,
      passed: totalPassed,
      failed: totalFailed,
      successRate: Number(successRate),
      avgLatencyMs: avgLatency,
    },
    results: allResults,
  };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n报告已保存: ${reportPath}`);

  process.exit(totalFailed > 0 ? 1 : 0);
}

main();
