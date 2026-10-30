# Ideogram 2.0（3.0 / 4.5 文档同源）

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://developer.ideogram.ai/v2/api-reference/images/generate/ideogram-2
  - https://docs.ideogram.ai/prompting/prompt-structure.md
  - https://docs.ideogram.ai/prompting/text-in-images.md
  - https://docs.ideogram.ai/prompting/refine-and-iterate.md
- 来源等级：official

## Prompt style

自然语言，官方也支持 JSON 提示词格式。

## 结构（现行文档）

短版：

```text
[image type] of [main subject], [action or placement], [setting], [lighting], [style]
```

完整八段顺序：summary → subject details → pose/action → secondary elements → setting/background → lighting/atmosphere → framing/composition → finish。

长度：Ideogram 3.0 控制在 150 词（约 200 token）以内；4.5 可以到 10000 字符。

## 参数

`prompt`（1–10000 字符）、`negative_prompt`（≤10000；**提示词优先于负面词**）、`seed`、`aspect_ratio`（16 个值；`auto` 让模型从提示词里选；不能和 `resolution` 同时用；不传该字段 = 1:1）、`rendering_speed`（turbo|default|quality）、`magic_prompt`（auto|on|off）、`num_images` 1–8、`style_type`（6 个值；`auto`）、`enable_copyright_detection`、`async`。

## 画内文字

- 确切文字放引号里，**尽早提到文字**，说明出现的位置，保持简短。
- 描述字母的粗细/形状/气质，别写字体文件名。
- 每块文字给自己的词 + 位置，按阅读顺序。
- JSON 提示词里每个文字元素给 `text`、`desc`、`color_palette`、`bbox`。
- 英文最准，非拉丁文字和重音符号可能出错。

## 多主体

明确写出位置和顺序（`The first jar on the left, in the foreground...`）；**只描述应该出现的东西**——提一句靴子就会被迫出全身。

Ideogram 2.0 的 endpoint 没有专门的角色/参考图功能（参考图和角色工具是 App / 3.0 的能力 → 2.0 未验证）。

## 翻译要点

- 按八段顺序填，别乱。
- 文字用引号 + 位置 + 粗细描述。
- 想让模型选比例就用 `auto`。
