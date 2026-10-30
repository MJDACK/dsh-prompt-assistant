# MiniMax Hailuo 02

- 类型：视频
- 规范来源（检索 2026-10-30）：
  - https://platform.minimax.io/docs/api-reference/video-generation-t2v
  - https://platform.minimax.io/docs/api-reference/video-generation-i2v
- 来源等级：official
- 注意：MiniMax 现在的**指南页写的是 H3 / H3 Max**，Hailuo-02 只活在中台 v1 API 的模型枚举里。H3 的提示词语法（`integrated_multimodal_description` / `overall_soundscape` / `non_diegetic_music`）是另一套，**不是 02 的**，别混。

## Prompt style

自然语言，**上限 2000 字符**。语言规则官方没写 → **[not verified]**。

## 镜头控制是 token，不是散文

15 个方括号命令：

```text
[Truck left] [Truck right] [Pan left] [Pan right] [Push in] [Pull out]
[Pedestal up] [Pedestal down] [Tilt up] [Tilt down]
[Zoom in] [Zoom out] [Shake] [Tracking shot] [Static shot]
```

规则：

- 同一个 `[]` 里多个命令**同时**执行，最多建议 3 个：`[Pan left,Pedestal up]`
- 顺序出现 = 执行顺序：`"...[Push in], then...[Push out]"`
- 自由行文也能用，但官方说「显式命令效果更准」。
- 官方示例：`A man picks up a book [Pedestal up], then reads [Static shot].`

## 参数

| 项 | 值 |
|---|---|
| prompt_optimizer | 默认 **true**；要精确控制就设 false |
| fast_pretreatment | 默认 false（Hailuo-02 适用） |
| duration | 默认 6 秒 |
| 分辨率 | 768P 支持 6 / 10 秒；1080P 只支持 6 秒；默认 768P |

## 音频

Hailuo-02 没找到音频字段（v1 API 只有 prompt / camera / duration / resolution）→ **[not verified]**。新一代 H3 有声音，不是 02。

## 一致性

v1 API 只有 `first_frame_image`（图生视频），没有参考角色机制。H3 v2 才有 Reference Generation（≤9 图 / ≤3 视频 / ≤3 音频，提示词里用 "reference image 1" 这类标签）→ **[inference]** H3 的机制 02 没有。

## 画内文字

02 没提（H3 文档说 H3 覆盖画内文字）→ **[inference]** 02 不覆盖。

## 翻译要点

- 运镜写进 `[]`，别用散文描述。
- prompt_optimizer 默认会改写你的提示词；要精确就关掉。
- 2000 字符上限。
