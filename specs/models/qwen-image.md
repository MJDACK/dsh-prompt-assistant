# Qwen-Image / Qwen-Image-Edit（阿里通义）

- 类型：图像（另有编辑版）
- 规范来源（检索 2026-10-30）：
  - https://huggingface.co/Qwen/Qwen-Image/raw/main/README.md
  - https://huggingface.co/Qwen/Qwen-Image-Edit/raw/main/README.md
  - https://raw.githubusercontent.com/QwenLM/Qwen-Image/main/README.md
  - https://huggingface.co/docs/diffusers/main/en/api/pipelines/qwenimage.md
- 来源等级：official

## Prompt style

自然语言，中英都吃（card 标 language: en, zh）。官方示例是长句描述：年龄 → 五官 → 发型 → 服装材质 → 场景 → 光线 → 取景方式。

## 质量词：官方推荐

model card 直接给出：

```text
positive_magic = ", Ultra HD, 4K, cinematic composition."
```

中文版：`", 超清，4K，电影级构图."`

这是**唯一有官方质量词结论的模型之一**（另一个是 FLUX 明确不推荐）。

## 负面词

支持，但要靠 `true_cfg_scale` + `negative_prompt` 一起才有效果（`guidance_scale` 无效）。官方默认给**空字符串**——「没有特定要消除的概念就用空串」。官方没有负面词表。

2512 示例里出现过一条中文负面词（低分辨率、低画质、肢体畸形…），可当参考，但不是官方推荐表。

## 画内文字

强项。官方说「significant advances in complex text rendering… especially for Chinese」。写法照抄示例：引号内写原文 + 说明载体和位置。

```text
a chalkboard sign reading "Qwen Coffee 😊 $2 per cup,"
neon light ... displaying "通义千问"
```

## 多主体 / 空间

官方 Edit-2509 示例按位置绑定：`The magician bear is on the left, the alchemist bear is on the right`。2511 支持多张参考图融合成群像。

## 编辑专属规则（Qwen-Image-Edit）

- 官方明确：**编辑结果若不做 prompt rewriting 会不稳定**，推荐用官方 rewrite / `polish_edit_prompt` 工具。
- 多图编辑用 `Figure 1` / `Figure 2` 指代。
- 改错字可以框选区域分步改。

## 参数（官方）

| 项 | 值 |
|---|---|
| steps | 50 |
| true_cfg_scale | 4.0（必须配合 negative_prompt 才启用 CFG） |
| max_sequence_length | 512 |
| 分辨率 | 1:1=1328²、16:9=1664×928、9:16=928×1664、4:3=1472×1140、3:4=1140×1472、3:2=1584×1056、2:3=1056×1584 |

## 翻译要点

- 英文提示词末尾挂官方那句：`, Ultra HD, 4K, cinematic composition.`
- 中文画面文字（招牌、霓虹）保留中文原文。
- 想要 CFG 生效就一定要同时给 `negative_prompt`，否则 `true_cfg_scale` 不起作用。
