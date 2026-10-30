# Seedream 4.0 / 4.5（字节豆包）

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://ai.byteplus.com/ark/region:ap-southeast-1/docs/seedream-4-0-5-0-prompt-guide
  - https://fal.ai/docs/model-api-reference/image-generation-api/bytedance-seedream-v4
  - https://fal.ai/docs/model-api-reference/image-generation-api/bytedance-seedream-v3
- 来源等级：official

## Prompt style

自然语言句子，**明确不要 tag 堆**。官方对比：

- 推荐：`A girl in a lavish dress walking under a parasol along a tree-lined path, in the style of a Monet oil painting`
- 避免：`Girl, umbrella, tree-lined street, oil painting texture.`

4.x 的文字理解比 3.0 强，**简洁精确胜过一堆华丽词**（官方原话）。BytePlus 指南只有英文版；Seedream 3.0 被 fal 描述为双语模型。4.x 的中文支持 → **UNVERIFIED**。

## Caption 结构（官方 General guidelines）

主体 + 动作 + 环境写成一个通顺句子；要审美就加风格/色彩/光线/构图；说明应用场景（`Design a logo for a gaming company...`）；图表类用精确术语 + 明确格式/布局。

## 参数（不在提示词里）

fal v4：`prompt`（必填）、`image_size` 枚举 `square_hd|square|portrait_4_3|portrait_16_9|landscape_4_3|landscape_16_9|auto|auto_2K|auto_4K`（总像素 960×960–4096×4096）、`num_images` 1–6、`max_images` 1–6（合计 ≤15 张）、`seed`、`enhance_prompt_mode` standard|fast。

fal v3：`image_size` 固定枚举（宽高 512–2048）、`guidance_scale` 1–10（默认 2.5）、`num_images` 1–4、`seed`。

比例**不写进提示词**。

## 负面词

v3/v4 的 schema 里**没有** `negative_prompt` 字段。排除项用散文写进提示词（官方平面图示例结尾就是 `Do not include any text or hand-drawn edges from the original sketch`）。

## 画内文字

用**双引号**包住：

- 推荐：`Generate a poster with the title "Seedream 4.5"`
- 避免：不加引号

## 多主体 / 一致性

- 参考图：描述「Reference Target」（要保留什么：角色设计、产品材质）+「Generated Scene Description」（场景/布局）。
- 多图编辑：`Replace the subject in Image 1 with the subject from Image 2`、`Apply the style of Image 2 to Image 1`、`Dress the character in Image 1 with the outfit from Image 2`。
- 多图输出：用 `a series`、`a set` 或数量触发。
- 编辑：简洁、无歧义、不用模糊代词，明确说什么保持不变（`keeping its pose unchanged`）。

## 翻译要点

- 一句话写完主体+动作+环境，别列 tag。
- 文字一律加双引号。
- 要排除的东西直接写 `Do not include ...`。
