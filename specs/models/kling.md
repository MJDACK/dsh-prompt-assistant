# Kling 2.6（快手）

- 类型：视频
- 规范来源（检索 2026-10-30）：
  - https://fal.ai/learn/devs/kling-2-6-pro-developer-guide
  - https://fal.ai/learn/devs/kling-video-2-6-motion-control-prompt-guide
- 来源等级：official 结构，但文档出自 **fal 平台作者**，非快手一方文档 → `[platform]`

## Prompt style

清晰的自然语言 + **风格预设**（Cinematic / Animation / Realistic）。语言规则和长度指南官方没写 → **[not verified]**。

复杂场景建议拆成几段分别生成，后期合成。

## 官方点名的词汇

镜头：`dolly shot`、`aerial view`、`tracking shot`

光线：`golden hour lighting`、`moody low-key lighting`、`bright studio lighting`

风格参照：`in the style of Wes Anderson`、`like a scene from Blade Runner`

节奏：`slow and contemplative` / `fast-paced and dynamic`

Motion Control 模式还推荐：`Pans, tilts, and tracking shots`；时间一致性用 `consistent lighting`、`steady camera`、`continuous motion`；风格 `rendered in anime style`、`photorealistic with film grain`、`cinematic lighting, professional photography, 4K quality`。

## 音频

2.6 的 T2V 没有原生对白/音效生成的文档说明。Motion Control 有 `keep_original_sound`（默认 true，保留**参考视频**的音轨）→ 暗示不做合成。「Kling 2.6 无音频」这句官方没直说 → **[not verified]**。

## 参数

| 项 | 值 |
|---|---|
| 输出 | 1080p |
| 时长 | 默认最多 10 秒，可用场景扩展延到 3 分钟（末帧 → 续生成） |
| motion strength | 参数（唯一有运动强度参数的模型） |
| aspect ratio / seed | 参数 |

## 一致性：Elements

可上传**最多 4 张参考图**，给每个元素打标签，然后在提示词里明确引用。

## 画内文字

官方没提 → **[not verified]**。

## 翻译要点

- 提示词 + 风格预设一起给。
- 镜头运动直接用上面那批官方词，别自己造。
- 要保持角色 → 用 Elements，并在提示词里点名引用。
