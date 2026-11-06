# Endfield Essences

《明日方舟：终末地》武器基质联合刷取规划工具。

## 当前页面

- 单屏布局，不使用整页滚动；武器列表与刷取地点结果分别在卡片内部滚动。
- 左侧武器库支持按武器种类切换、按名称搜索和选择目标武器。
- 右侧配置刻写券固定属性，以及三种基础属性。
- 推荐结果按淤积区展示，每个地点卡片列出能够同时刷取的武器，并按武器数量降序排列。
- 武器图片尚未录入，当前使用统一的工业风占位图形，后续可替换为真实图片。

## 数据文件

- \`src/data/weapons.ts\`：武器名称、类型、\`attributeStats\`、\`secondaryStats\`、\`skillStats\`。
- \`src/data/alluvium.ts\`：淤积区名称、\`secondaryStats\` 属性池、\`skillStats\` 属性池。

## 联合刷取规则

固定附加属性时：
1. 候选武器的附加属性必须与目标武器相同。
2. 候选武器的技能属性必须存在于所选淤积区的技能属性池。
3. 候选武器的基础属性必须属于刻写券选择的三种基础属性。

固定技能属性时，交换附加属性和技能属性的判断方向。

目标武器的附加属性与技能属性都必须存在于该淤积区。目标武器的基础属性必须包含在三种基础属性中。

## 自动基础属性优化

目标武器的基础属性固定占一个名额，其余两个名额从另外四种基础属性中枚举选择，共有六种组合。

组合按以下顺序比较：
1. 最大化单个淤积区能够同时刷取的武器数量。
2. 若并列，最大化所有淤积区的武器-地点匹配总数。
3. 若仍并列，最大化有结果的淤积区数量。

如果仍有多个完全相同的最优组合，则按照武器数据中基础属性首次出现的顺序选择默认组合。手动模式允许用户修改三种基础属性，结果会立即重新计算。

核心实现位于 \`src/logic/recommendation.ts\`，页面位于 \`src/App.vue\`。

## 本地开发与检查

需要 Node.js 和 npm，不需要安装 Cloudflare CLI：

\`\`\`bash
npm install
npm run dev
npm test
npm run build
\`\`\`

## Cloudflare Workers 部署

项目通过 Vite 构建前端，并使用 Workers Static Assets 托管。GitHub 仓库连接到 Workers Builds 后，提交到生产分支会触发自动构建和部署。

- Root directory：\`/\`
- Build command：\`npm run build\`
- Deploy command：\`npm run deploy\`
- Production branch：\`main\`
