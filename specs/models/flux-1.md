# FLUX.1 (dev / schnell / Kontext)

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://docs.bfl.ml/guides/prompting_unified_basics.md
  - https://docs.bfl.ml/guides/prompting_unified_technical.md
  - https://docs.bfl.ml/api-reference/models/generate-an-image-with-flux1-[dev].md
  - https://raw.githubusercontent.com/black-forest-labs/flux/main/docs/text-to-image.md
  - https://raw.githubusercontent.com/black-forest-labs/flux/main/docs/image-editing.md
- 来源等级：official（HF model card 是 gated，读不到）
- 备注：两份 prompting 指南挂在 FLUX 3 Image 名下，但其 Prompt Reference 页自称覆盖早期 FLUX 模型。

## Prompt style

自然语言。官方给的模板：

```text
[Subject], [location], [style], [camera settings], [lighting], [colors], [effect], [additional elements]
```

官方 caption 顺序：先媒介/风格 → 主体及各自位置 → 光线/颜色/背景。

## 质量词：不推荐

官方明确「Only what's visible」——不要写 `beautiful`、`iconic`、`masterpiece` 这类空质量词。写看得见的东西。

（这和 Qwen-Image 正好相反，别串。）

## 负面词：不支持

- FLUX.1 [dev] 官方 API schema 里**没有** `negative_prompt` 字段。
- BFL 现行指南要求：**把否定句改成正面描述**。例如写 `an empty promenade` 而不是 `no crowds`。
- 本地 ComfyUI 工作流常见负面词（如 `text, watermark`）属于社区用法，非官方。

## 画内文字

用**引号**括住原文，并说明位置和字体样式。官方例子：`The text reads "東京"`。

## 多主体 / 空间

- 位置用方位词写：`In the right foreground`、`To the left`。
- 多图用 `image 1` / `image 2` 指代。
- Kontext 主打角色一致性和多轮迭代编辑；官方博客的编辑指令写法：`tilt her head towards the camera`、`change the "YOU HAD ME AT BEER" to "..."`。

## 参数（官方 API）

| 项 | 值 |
|---|---|
| width / height | 默认 1024 / 768；范围 256–1440，须为 32 的倍数 |
| steps | 默认 28（1–50） |
| guidance | 默认 3（1.5–5） |
| prompt_upsampling | 默认 false（开启后自动扩写提示词） |

- Schnell 官方 diffusers 示例：`num_inference_steps=4`。
- Kontext 官方 CLI 示例：`--num_steps 30 --aspect_ratio "16:9" --guidance 2.5`。

## 翻译要点

- 按官方模板顺序排：主体 → 地点 → 风格 → 镜头 → 光线 → 颜色 → 效果 → 附加元素。
- 否定语义一律翻成正面描述。
- 别加空质量词。

## 未能核实

训练集语言构成（是否英文 caption）、官方负面词表、caption 长度区间。
