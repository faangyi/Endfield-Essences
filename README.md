# Endfield Essences

明日方舟：终末地武器基质刷取建议工具。

当前版本根据武器的附加属性和技能属性，寻找能够同时产出这两种目标属性的淤积区（Alluvium）。

## 当前数据

- 武器：69 把
- 淤积区：13 个
- 武器基础属性：5 种
- 武器附加属性：12 种
- 武器技能属性：14 种
- 每个淤积区：8 种附加属性 + 8 种技能属性

数据来源文件：

- `src/data/weapons.ts`：武器名称、类型、`attributeStats`、`secondaryStats`、`skillStats`。
- `src/data/alluvium.ts`：淤积区名称、`secondaryStats` 属性池、`skillStats` 属性池。

录入或修改数据时，请沿用游戏内属性名称，并确保同一种属性始终使用完全一致的字符串。

## 匹配规则

对每把武器遍历所有淤积区。只有以下两个条件在**同一个淤积区**同时成立，才返回该淤积区：

1. 淤积区的 `secondaryStats` 包含武器的 `secondaryStats`。
2. 淤积区的 `skillStats` 包含武器的 `skillStats`。

武器的 `attributeStats` 是基础属性，在所有淤积区都可能出现，因此不参与淤积区匹配。

核心实现位于 `src/logic/recommendation.ts`。

## 项目结构

```text
src/
├── data/
│   ├── weapons.ts
│   └── alluvium.ts
├── logic/
│   ├── recommendation.ts
│   └── recommendation.test.ts
├── App.vue
├── main.ts
├── style.css
└── types.ts
worker/
└── index.ts
```

代码中统一使用 `Alluvium`、`alluviums` 等命名；界面文案使用“淤积区”或“刷取区域”。

## 本地测试

需要安装 Node.js（包含 npm），不需要安装 Cloudflare CLI：

```bash
npm install
npm run dev
```

然后打开终端显示的本地地址，通常是 `http://localhost:5173`。

执行算法测试：

```bash
npm test
```

执行 TypeScript 检查和生产构建：

```bash
npm run build
```

## Cloudflare Workers 部署

项目使用 Vite 构建前端，并通过 Workers Static Assets 提供静态资源。仓库包含 `wrangler.jsonc` 和 `worker/index.ts`。

在 Cloudflare 控制台将 GitHub 仓库 `zhoutongmike/Endfield-Essences` 连接到 Workers Builds，建议配置：

- Root directory：`/`
- Build command：`npm run build`
- Deploy command：`npm run deploy`
- Production branch：`main`

推荐先本地运行测试和构建；也可以先让 Cloudflare 对 GitHub 提交构建并部署，再通过 `workers.dev` 或绑定的域名进行实际浏览器测试。
