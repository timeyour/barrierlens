#!/usr/bin/env node
/**
 * 无碍 BarrierLens · 整体功能框架 E2E 测试
 * 覆盖：页面结构、上传分析归档、时间线筛选复查、导出、导航
 */

import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BASE_URL = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const TEST_IMAGE = path.join(ROOT, "public/images/scene-blocked-close.png");

const results = [];

function record(id, ok, detail) {
  results.push({ id, ok, detail });
  console.log(`${ok ? "✅" : "❌"} ${id}${detail ? ` — ${detail}` : ""}`);
}

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function loadPlaywright() {
  const candidates = [
    () => require("playwright"),
    () => require("/tmp/bl-e2e/node_modules/playwright"),
  ];
  for (const load of candidates) {
    try {
      return load();
    } catch {
      // try next
    }
  }
  return null;
}

async function main() {
  const pw = await loadPlaywright();
  if (!pw?.chromium) {
    console.error("请先安装 playwright: npx playwright install chromium");
    process.exit(1);
  }
  const { chromium } = pw;

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(String(e)));

  // --- 1. 页面加载与结构 ---
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(800);

  record(
    "page-load",
    (await page.title()).includes("BarrierLens") || (await page.locator("body").innerText()).includes("无碍"),
    "首页标题/品牌可见",
  );

  record("section-tool", (await page.locator("#tool").count()) > 0, "#tool 记录区");
  record("section-records", (await page.locator("#records").count()) > 0, "#records 时间线");
  record("section-story", (await page.locator("#story").count()) > 0, "#story 故事区");

  // --- 2. 导航锚点 ---
  await page.locator('a[href="#records"]').first().click();
  await page.waitForTimeout(400);
  const recordsInView = await page.evaluate(() => {
    const el = document.querySelector("#records");
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  });
  record("nav-records", recordsInView, "点击导航到时间线");

  // --- 3. 清空 localStorage，准备干净测试 ---
  await page.evaluate(() => localStorage.removeItem("barrierlens-records"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);

  const recordItems = page.locator("#records ul.space-y-3 > li");

  const demoCount = await recordItems.count();
  record("timeline-seed", demoCount >= 3, `演示数据 ${demoCount} 条`);

  // --- 4. 时间线筛选 ---
  await page.getByRole("button", { name: "全部" }).click();
  await page.waitForTimeout(300);
  record(
    "filter-all",
    (await recordItems.count()) >= demoCount,
    "切换「全部」显示记录",
  );

  await page.getByRole("button", { name: "历史归档" }).click();
  await page.waitForTimeout(300);
  const historyCount = await recordItems.count();
  record("filter-history", historyCount === 0, `历史队列 ${historyCount} 条（演示无 fixed/unfixed）`);

  await page.getByRole("button", { name: "工作队列" }).click();
  await page.waitForTimeout(300);

  // --- 5. 整改复查 UI 结构 ---
  await page.locator("#records").scrollIntoViewIfNeeded();
  const firstItem = recordItems.first();
  await firstItem.scrollIntoViewIfNeeded();

  const reviewTexts = await firstItem.innerText();
  record(
    "review-section-order",
    reviewTexts.includes("整改复查") &&
      reviewTexts.includes("更新状态") &&
      reviewTexts.indexOf("整改反馈照片") < reviewTexts.indexOf("更新状态"),
    "整改复查：照片在上、更新状态在下",
  );

  // 地图内联展开
  const mapBtn = firstItem.getByRole("button", { name: "查看整改前后地图" });
  if (await mapBtn.count()) {
    await mapBtn.click();
    await page.waitForTimeout(400);
    record(
      "map-inline",
      (await firstItem.getByRole("button", { name: "收起整改地图" }).count()) > 0,
      "地图在同条记录内展开",
    );
    await firstItem.getByRole("button", { name: "收起整改地图" }).click();
  }

  // 状态更新
  const statusSelect = firstItem.locator("select").first();
  await statusSelect.selectOption("exported");
  await firstItem.getByPlaceholder("复查备注").fill("E2E 测试备注");
  await firstItem.getByRole("button", { name: "保存状态" }).click();
  await page.waitForTimeout(400);
  record(
    "review-status-save",
    (await firstItem.innerText()).includes("已导出"),
    "保存状态后标签更新",
  );

  // --- 6. 上传 → 分析 → 归档 ---
  await page.locator("#tool").scrollIntoViewIfNeeded();
  const fileInput = page.locator('#tool input[type="file"]').first();
  await fileInput.setInputFiles(TEST_IMAGE);
  await page.waitForTimeout(500);

  const dashedUpload = page.locator("#tool .border-dashed.min-h-\\[180px\\]");
  record(
    "upload-single-preview",
    (await dashedUpload.count()) === 0 && (await page.locator("#tool img[alt='现场照片预览']").count()) > 0,
    "上传后仅显示预览，无多余虚线框",
  );

  await page.locator("#tool button.btn-primary").click();

  // 等待分析完成（mock ~2s）
  await page.waitForSelector('h2:has-text("结构化记录")', { timeout: 30000 });
  record("analyze-complete", true, "分析完成，结构化记录出现");

  record(
    "pipeline-visible",
    (await page.locator("text=Gemma 4 推理过程").count()) > 0,
    "推理过程面板",
  );

  record(
    "json-collapsed",
    (await page.locator("summary:has-text('Gemma 4 结构化输出')").count()) > 0 &&
      (await page.locator("pre.text-emerald-300").count()) === 0,
    "JSON 默认折叠在 details 内",
  );

  record(
    "archive-notice",
    (await page.locator("text=已归档到本机").count()) > 0,
    "归档提示",
  );

  // 时间线应新增记录
  await page.locator("#records").scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  const afterCount = await page.evaluate(() => {
    const raw = localStorage.getItem("barrierlens-records");
    return raw ? JSON.parse(raw).length : 0;
  });
  record("archive-localStorage", afterCount >= 4, `localStorage ${afterCount} 条（含新归档）`);

  // --- 7. 导出按钮存在 ---
  record(
    "export-buttons",
    (await page.getByRole("button", { name: /复制|导出 Markdown/ }).count()) >= 2,
    "复制与导出按钮",
  );

  // --- 8. 无致命 JS 错误 ---
  record(
    "no-page-errors",
    pageErrors.length === 0,
    pageErrors.length ? pageErrors.join(" | ") : "无 pageerror",
  );

  await browser.close();

  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;

  console.log(`\n${"=".repeat(50)}`);
  console.log(`E2E 汇总: ${passed}/${results.length} 通过, ${failed} 失败`);
  console.log(`${"=".repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
