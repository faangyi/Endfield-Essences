# Endfield Essences

明日方舟：终末地武器基质刷取建议工具。

## 当前功能

- 根据武器附加属性与技能属性，查找能同时产出两种属性的淤积区。
- 联合刷取规划：选择目标武器、淤积区和刻写券固定属性，查找能够一起刷取的其他武器。
- 自动枚举基础属性组合：目标武器的基础属性必选，另外两种从其余基础属性中选择，使可联合刷取的武器数量最大。
- 支持手动调整另外两种基础属性，并实时更新联合刷取结果。

## 数据文件

- \`src/data/weapons.ts\`：武器名称、类型、\`attributeStats\`、\`secondaryStats\`、\`skillStats\`。
- \`src/data/alluvium.ts\`：淤积区名称、\`secondaryStats\` 属性池、\`skillStats\` 属性池。

## 联合刷取规则

固定附加属性时：
1. 候选武器的附加属性必须与目标武器相同。
2. 候选武器的技能属性必须存在于所选淤积区的技能属性池。
3. 候选武器的基础属性必须属于刻写券选择的三种基础属性。

固定技能属性时，交换附加属性和技能属性的判断方向。

目标武器的两种非基础属性必须都在所选淤积区中。基础属性组合必须包含目标武器自身的基础属性。自动模式枚举所有可能的三属性组合，按可联合刷取武器数量最大化；若有并列最优组合，按武器数据中基础属性首次出现的顺序选择默认项。

核心实现位于 \`src/logic/recommendation.ts\`，界面位于 \`src/App.vue\`。

## 本地开发与检查

需要 Node.js 和 npm，不需要安装 Cloudflare CLI：

\`\`\`bash
npm install
npm run dev
npm test
npm run build
\`\`\`

## Cloudflare Workers 部署

项目通过 Vite 构建前端，并使用 Workers Static Assets 托管。将 GitHub 仓库连接到 Workers Builds：

- Root directory：\`/\`
- Build command：\`npm run build\`
- Deploy command：\`npm run deploy\`
- Production branch：\`main\`
