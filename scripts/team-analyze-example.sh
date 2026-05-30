#!/usr/bin/env bash
# 团队调用示例（需先在 Vercel 配置 GEMINI_API_KEY + TEAM_API_KEY）
#
#   export BARRIERLENS_URL=https://barrierlens.vercel.app
#   export TEAM_API_KEY=your-team-secret
#   ./scripts/team-analyze-example.sh path/to/photo.jpg

set -euo pipefail

BASE_URL="${BARRIERLENS_URL:-https://barrierlens.vercel.app}"
IMAGE="${1:-public/images/scene-blocked-close.png}"
KEY="${TEAM_API_KEY:?请设置 TEAM_API_KEY}"

curl -sS -X POST "${BASE_URL}/api/analyze" \
  -H "Authorization: Bearer ${KEY}" \
  -F "image=@${IMAGE}" \
  -F "targetDepartment=城管" \
  -F "recordMode=public" \
  -F "location=南京西路常德路口南侧便道" \
  | node -e "const d=[];process.stdin.on('data',c=>d.push(c));process.stdin.on('end',()=>{const j=JSON.parse(Buffer.concat(d));console.log('source:',j.analysisSource);console.log('issue:',j.issueType);console.log('risk:',j.riskLevel);});"
