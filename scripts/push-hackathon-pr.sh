#!/usr/bin/env bash
# 完成方式 A 提交：需先在浏览器 Fork 并完成 2FA
# https://github.com/gdgshanghai/Gemma4-Hackathon-ShangHai/fork
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HACK="${ROOT}/../Gemma4-Hackathon-ShangHai"
FORK="git@github.com:timeyour/Gemma4-Hackathon-ShangHai.git"
BRANCH="submit/barrierlens-d"

if [[ ! -d "$HACK/.git" ]]; then
  echo "缺少 $HACK，请先: git clone git@github.com:gdgshanghai/Gemma4-Hackathon-ShangHai.git"
  exit 1
fi

cd "$HACK"
git checkout "$BRANCH" 2>/dev/null || {
  mkdir -p submissions/2026/track_D/BarrierLens
  cp "$ROOT/submissions/2026/D/BarrierLens/"* submissions/2026/track_D/BarrierLens/
  git checkout -b "$BRANCH"
  git add submissions/2026/track_D/BarrierLens/
  git commit -m "submit: [赛道D] 无碍 BarrierLens - 小马过河"
}

git remote remove fork 2>/dev/null || true
git remote add fork "$FORK"
git push -u fork "$BRANCH"

echo ""
echo "✅ 已 push 到 fork。请打开创建 PR："
echo "https://github.com/gdgshanghai/Gemma4-Hackathon-ShangHai/compare/main...timeyour:Gemma4-Hackathon-ShangHai:submit/barrierlens-d?expand=1"
echo "标题: [赛道D] 无碍 BarrierLens - 小马过河"
echo "表单: https://hackathon.googdg.cn/onsite-submit"
