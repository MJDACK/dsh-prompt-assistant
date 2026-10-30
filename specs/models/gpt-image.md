# OpenAI gpt-image（现行文档是 GPT Image 2.5）

- 类型：图像（可多轮编辑）
- 规范来源（检索 2026-10-30）：
  - https://developers.openai.com/api/docs/guides/image-prompting
  - https://developers.openai.com/api/docs/guides/image-generation
- 来源等级：official
- ⚠️ 官方现行指南写的是 **GPT Image 2.5**（`gpt-image-2.5-sunburst` / `-flare`）；gpt-image-1 时代的细节（比如三档提示词长度）**不在现行页面里** → UNVERIFIED

## Prompt style

自由格式：短提示词、描述段落、类 JSON 结构、指令式、tag 都合法。官方原话：「choose the format that makes the requirements easiest to read and update rather than relying on special syntax」。

复杂需求按 **scene, subject, details, constraints** 分标签段组织。

中文提示词支持 → UNVERIFIED。

## 参数（与提示词分开）

`model`、`quality`（auto|low|medium|high|xhigh|max）、`size`、`background`（auto|opaque|transparent）、`output_format` / `output_compression`。

尺寸：1024×1024、1536×1024、1024×1536、2048×2048、2048×1152、3840×2160、2160×3840。

自定义 `WIDTHxHEIGHT` 约束：每边 ≤3840，两边都是 16 的倍数，长短边 ≤3:1，总像素 655,360–8,294,400（>3,686,400 属实验性）。

## 负面词

**没有 `negative_prompt` 参数**。排除项写进提示词散文：`No extra text, no watermarks, no unrelated logos`。编辑时写 `change only X`，并明确列出要保留的（身份、几何、布局、光线、标签）和要排除的。

## 画内文字

- 必须的文字加引号，说明位置和字体排印。
- 生僻词、品牌名**逐字母拼**。
- 明确要求不要多余文字，然后核对出图。
- 小字或密集排版要对比 medium / high 质量档。
- 官方指南的精确串写法：`Billboard text (EXACT, verbatim, no extra characters):` + 引号内容。

## 多主体 / 一致性

- 给每张输入图编号并**分配角色**（主体、风格、服装、背景），说明怎么组合：`Place the dog from the second image into the setting of image 1... Do not change anything else.`
- 角色一致性 = 先建可复用的角色参考图，之后每轮在 `Character Consistency` 段重复特征描述，并加 `Do not redesign the character`。

## 多轮

Image API 用于单次出图；Responses API 用于迭代编辑（`previous_response_id`、`action: generate|edit|auto`、`partial_images`）。

## 翻译要点

- 复杂需求按四段分标签写。
- 排除项写进提示词本身。
- 多图输入要编号 + 分角色。
