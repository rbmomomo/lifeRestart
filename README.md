# 浮生万象：AI 开放式人生模拟器

React + TypeScript + Vite MVP。当前核心流程：

`欢迎页 → 选择世界模板 → 模板详情 → AI 生成 10 个主题标签 → 选择 3—5 个 → AI 推演完整世界 → 世界确认 → 投胎方式/家庭 → 角色与天赋 → 出生`

## 当前能力

- 现代都市、古代、武侠、修仙、末日、赛博朋克、魔法学院、太空殖民与自定义等模板；模板不是固定世界。
- `WorldGenerationProvider` 接口将标签生成和结构化世界生成与 UI 解耦。
- 默认 `LocalWorldGenerationProvider` 无需密钥即可模拟 AI 推演；未来可替换为真实 API provider。
- 生成结果包含名称、时代背景、社会结构、核心矛盾、生活环境、成长路径、爱情婚姻、家庭结构、危险、寿命和出生地区。
- 标签严格选择 3—5 个；家庭与天赋基于生成世界和模板随机创建。
- AI 推演加载页、结果确认、重新推演、日间/深色模式和本地自动保存。
- 玩家界面与游戏状态中没有种子、固定开局或复现机制；每次均由 AI 重新推演。

## 代码结构

- `src/world-generation/provider.ts`：`WorldGenerationProvider` 的默认本地实现。
- `src/types.ts`：模板、生成世界、provider 和流程状态类型。
- `src/domain/generators.ts`：家庭、天赋及选择限制。
- `src/narrative/provider.ts`：出生叙事 provider。
- `src/App.tsx`：开局状态机和界面。

接入真实 API 时，实现 `WorldGenerationProvider`，返回 `GeneratedWorld` 结构，并在应用注入该实现即可；建议由服务端代理密钥。

## 本地运行

```bash
npm install
npm run dev
```

验证：

```bash
npm test
npm run build
```
