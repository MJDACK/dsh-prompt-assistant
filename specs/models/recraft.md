# Recraft V3

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://www.recraft.ai/docs/api-reference/models/recraft-v3.md
  - https://www.recraft.ai/docs/prompt-engineering-guide/prompt-templates/universal.md
  - https://www.recraft.ai/docs/prompt-engineering-guide/core-principles/context
  - https://www.recraft.ai/docs/recraft-studio/image-generation/working-with-text-and-prompts/negative-prompts.md
  - https://www.recraft.ai/docs/best-practices/character-consistency.md
- 来源等级：official

## Prompt style

自然语言 + 模块化模板。官方通用模板：

```text
[SUBJECT + ACTION], [COMPOSITION], [CONTEXT], [MEDIUM], [STYLE], [VIBE], [ATTRIBUTES: lighting, color, texture, technical details]
```

Context 页的提示：加环境/风格/氛围/光线；细节要**平衡**——太少结果不可预测，太多会过度约束。

## 参数

`prompt`（≤1000 字符）、`model`（recraftv3 / recraftv3_vector）、`style`（curated，默认 "Recraft V3 Raw"，如 Photorealism、Illustration、Vector art）、`size`（比例或 WxH；可从提示词自动推断）、`n` 1–6、`negative_prompt`、`style_id`、`style_reference_urls`（≤10）、`text_layout`（文字 + 归一化 bbox，**唯一能把文字放到精确位置的功能**）、`random_seed`、`controls.colors`、`controls.background_color`、`controls.artistic_level` 0–5、`controls.no_text`。

输出 1K。

## 负面词

有 `negative_prompt` 字段。写**裸概念**，不要双重否定（写 `apples`，不要 `no apples`）。另有 "Avoid text in image" 开关（`controls.no_text`）。

## 角色一致性

**没有专门的追踪功能**。官方办法：写详细的定义性提示词、固定 style/自定义 style、用 Frames 做局部编辑、用参考图、或接外部模型。

## 画内文字

引号和大小写的规则官方页面超时没抓到 → **UNVERIFIED**。有 `text_layout` 可精确定位。中文支持 → UNVERIFIED。

## 翻译要点

- 按官方七段模板填，顺序别乱。
- 提示词控制在 1000 字符内。
- 要文字精确位置就用 `text_layout`。
