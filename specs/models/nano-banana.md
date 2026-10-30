# Nano Banana = Gemini 3 Pro Image（Google）

- 类型：图像（多轮编辑是原生用法）
- 规范来源（检索 2026-10-30）：
  - https://blog.google/products-and-platforms/products/gemini/prompting-tips-nano-banana-pro/
  - https://ai.google.dev/gemini-api/docs/image-generation
- 来源等级：official

## Prompt style

对话式自然语言，多轮编辑是它的主场。

模型 ID：`gemini-3-pro-image`（Nano Banana Pro）、`gemini-nano-banana-2.1`、`gemini-3.1-flash-image`、`gemini-3.1-flash-lite-image`、`gemini-2.5-flash-image`。

中文提示词支持 → **UNVERIFIED**（多语言画内文字有文档）。

## 结构（官方 7 tips）

核心：**Subject, Composition, Action, Location, Style, Editing Instructions**

- 编辑指令：`change the man's tie to green`、`remove the car in the background`
- 进阶：
  - 构图与比例：`A 9:16 vertical poster`、`A cinematic 21:9 wide shot`
  - 镜头与光线：`low-angle shot with shallow depth of field (f/1.8)`、`golden hour backlighting creating long shadows`、`cinematic color grading with muted teal tones`
  - 具体文字整合
  - 事实性约束（图表）
  - 参考图**分配角色**：`Use Image A for the character's pose, Image B for the art style, Image C for the background environment`

## 参数

`response_format: {aspect_ratio, image_size, mime_type}`

- 比例：1:1、3:2、2:3、3:4、4:3、4:5、5:4、9:16、16:9、21:9
- 尺寸：1K / 2K / 4K（3.1 Flash Image 另有 512px / 0.5K；Lite 只有 1K）
- 多轮：`previous_interaction_id`，例如 `Update this infographic to be in Spanish. Do not change any other elements of the image.`

## 负面词

没有 `negative_prompt` 字段；用正面排除写进提示词（`No text`、`no other text`）。

## 画内文字

引号写内容 + 描述外观和位置：

```text
The headline "URBAN EXPLORER" rendered in bold, white, sans-serif font at the top.
```

官方文档也写了多语言文字渲染和图内文字翻译/本地化。限制：小字、细节、精确拼写「may not work perfectly」。

## 多主体 / 一致性

最多混合 6–14 张参考图并保持多角色一致（按型号）：

- Gemini 3 Pro Image：最多 6 个物体参考、**最多 5 个角色参考**、最多 3 个风格参考
- 2.1 / 3.1 Flash Image：10 物体、4 角色
- Lite：14 物体，不支持角色参考

## 翻译要点

- 提示词写成「主体 + 构图 + 动作 + 地点 + 风格」五块。
- 要精确控图就写比例、镜头、光线。
- 多轮编辑时明确说「什么不要动」。
