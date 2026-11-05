# Endfield Essences

明日方舟：终末地武器基质刷取建议工具。

当前版本先实现最基础的地点匹配：**一个地点必须同时包含武器的附加属性和技能属性，才是该武器的可刷取地点。**

> 当前仓库内的武器与地点均为演示数据，不代表完整或真实的游戏资料。正式数据接入前，请勿将演示结果作为实际刷取攻略。

## 当前功能

- 单页武器刷取地点查询。
- 按武器类型筛选，按名称或属性搜索。
- 为每把武器列出满足双属性条件的地点。
- 当两个目标属性分别出现在不同地点时，不会错误地合并为匹配结果。
- 基础属性仅展示，不参与地点匹配。
- 提供针对核心匹配规则的 Vitest 单元测试。

## 匹配逻辑

对每把武器，遍历全部刷取地点。只有以下两个条件在**同一个地点**同时成立，才返回该地点：

1. 地点的附加属性池包含武器的附加属性。
2. 地点的技能属性池包含武器的技能属性。

基础属性不参与判断，因为它在所有地点都可能出现。

核心实现位于 `src/logic/recommendation.ts`。

## 数据文件

### 武器：`src/data/weapons.ts`

每把武器的数据结构：

```ts
interface Weapon {
  id: string
  name: string
  type: string
  baseAttribute: string
  additionalAttribute: string
  skillAttribute: string
}
```

### 刷取地点：`src/data/locations.ts`

每个地点的数据结构：

```ts
interface FarmingLocation {
  id: string
  name: string
  additionalAttributes: string[]
  skillAttributes: string[]
}
```

地点数据需要有稳定的 `id` 和用于展示的 `name`。每个地点的 `additionalAttributes` 应填入该地点实际可能出现的 8 种附加属性，`skillAttributes` 应填入该地点实际可能出现的 8 种技能属性。

属性名称使用精确字符串匹配。录入正式数据时，同一种属性请始终使用完全一致的名称，避免因别名、空格或错别字造成漏匹配。

## Cloudflare Workers 部署

项目使用 Vite 构建前端，并通过 Workers Static Assets 提供静态资源。仓库已经包含 `wrangler.jsonc` 和 `worker/index.ts`，不需要单独部署前端托管服务。

在 Cloudflare 控制台将 GitHub 仓库 `zhoutongmike/Endfield-Essences` 连接到 Workers Builds，建议配置：

- Root directory：`/`
- Build command：`npm run build`
- Deploy command：`npm run deploy`
- Production branch：`main`

后续推送到 `main` 的代码会触发构建和部署。当前没有用户账号或后端数据库；未来可在 Worker 中逐步增加 API。

## 开发与测试

需要 Node.js 和 npm：

```bash
npm install
npm run dev
npm test
npm run build
```

Cloudflare 部署由 GitHub 集成执行；本地开发并不要求配置 Cloudflare 账号。
