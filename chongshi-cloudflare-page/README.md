# 崇实科技 · 能力缺口与产品化方案（交互页）

单文件静态页面，可直接部署到 Cloudflare Pages，无需构建步骤、无需外部依赖。

## 内容

- 能力缺口：雷达图 + 18 项可筛选缺口卡（P0/P1、现状/目标/补齐动作）
- 方案构思：一个底座 + 两个产品 + 先诊断后闭环
- 路线图：阶段 0–5 可展开时间线
- 行动建议：4 项立即可启动工作（可勾选，状态存本机）+ 10 项内部确认输入

## 本地预览

直接双击 `index.html`，或在目录内运行任一静态服务器，例如：

```bash
python -m http.server 8000
# 打开 http://localhost:8000
```

## 部署到 Cloudflare Pages

### 方式 A：网页上传（最快）

1. 打开 Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**。
2. 选择 **Upload assets**，项目名填 `chongshi-gap` 等。
3. 把本目录（包含 `index.html`）拖入上传区，或选择上传文件夹。
4. 点 **Deploy**，完成后访问分配的 `*.pages.dev` 域名。

### 方式 B：Wrangler CLI

```bash
npx wrangler pages deploy chongshi-cloudflare-page --project-name chongshi-gap
```

### 方式 C：连接 Git 仓库

1. 将本目录推送到 GitHub/GitLab。
2. Pages 创建时选择 **Connect to Git**，构建命令留空、输出目录填 `/`（或上传 assets）。

## 说明

- 页面中的节能率、能效提升率等数值均为崇实科技官网公开披露口径，本页未做第三方验证。
- 雷达图成熟度打分为基于公开资料的定性评估，用于识别能力缺口，不代表精确评分。
