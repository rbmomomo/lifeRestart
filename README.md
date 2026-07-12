# 浮生万象：AI 开放式人生模拟器

React + TypeScript + Vite。流程为：配置 AI → 选择模板 → AI 生成严格 10 项主题 → 选择 3—5 项 → AI 生成完整世界 → 投胎与家庭 → 角色/天赋 → AI 出生叙事。

## AI 配置与隐私

应用**不含本地伪 AI、不含默认 endpoint、Key 或模型，也没有本地生成 fallback**。开始前须在“AI 设置”中自行填写：

- OpenAI 兼容 Chat Completions：填写完整的聊天补全 API 地址
- Anthropic Messages：填写完整的 Messages API 地址
- API Key、模型、最大输出 token、temperature

配置只存储在浏览器 `localStorage` 的独立键中，不进入 `SimulatorState`/游戏存档，也不会被源码提交。真实密钥仍会由浏览器直接发送到用户填写的 API 地址，因此应仅使用可信服务和设备，并确保服务支持浏览器 CORS。设置支持显示/隐藏 Key、测试连接、保存和清空。

所有主题、结构化世界和出生篇章都由统一的 `RemoteAiProvider` 调用真实 API。主题标签由 AI 每次即兴生成，并加入独立创作扰动，不存在内置标签表；标签必须恰好 10 个且互不重复。

现代都市、古代王朝、武侠江湖、修仙世界、末日生存、赛博朋克、魔法学院、太空殖民等内容只是世界模板。模板只限定时代背景、力量体系和基本逻辑边界，不提供固定剧情。世界推演只会向 AI 发送模板边界、氛围规则、自定义补充和玩家选中的 3—5 个主题，不会把固定家庭、天赋或事件当作答案提示。结构化响应会去除 Markdown 代码块并从附加文本中提取 JSON；世界字段不完整时，UI 会显示错误并允许返回设置。

## 代码结构

- `src/ai/provider.ts`：OpenAI/Anthropic 请求、JSON 提取、校验及统一 provider
- `src/storage/aiSettings.ts`：独立的 AI 配置 localStorage
- `src/types.ts`：配置、世界、provider 与流程类型
- `src/App.tsx`：流程和 AI 设置弹窗
- `src/domain/generators.ts`：家庭、天赋及选择限制（不承担 AI 内容生成）

## 本地运行与验证

```bash
npm install
npm run dev
npm test
npm run build
```
