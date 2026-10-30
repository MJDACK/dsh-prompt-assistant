# HiDream-I1 (Full / Dev / Fast)

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://huggingface.co/HiDream-ai/HiDream-I1-Full/raw/main/README.md
  - https://raw.githubusercontent.com/HiDream-ai/HiDream-I1/main/README.md
  - https://huggingface.co/docs/diffusers/main/en/api/pipelines/hidream.md
- 来源等级：official（训练数据构成官方未公开 → 英文 caption 属 inferred）

## Prompt style

自然语言。HF 卡 metadata `language: en`。官方示例：

```text
A cat holding a sign that says "HiDream.ai".
```

## 质量词：不推荐

官方未提（inferred）。

## 负面词

diffusers 管线支持 `negative_prompt`，但**guidance_scale ≤ 1 时会被忽略**。官方没有推荐负面词。

## 画内文字

支持，官方示例就是让牌子写字。官方没给文字写法细则 → 照抄示例：引号内写原文。

## 多主体 / 空间

官方无提示词级规则（inferred）。官方评测里 GenEval 位置 0.60、DPG 关系 93.74，说明位置和关系遵循不弱。

## 参数（官方）

| 档 | steps | guidance_scale |
|---|---|---|
| Full | 50 | 5.0 |
| Dev | 28 | 0.0 |
| Fast | 16 | 0.0 |

分辨率 1024×1024。管线支持 prompt_2/3/4 分路送不同文本编码器（CLIP-L / OpenCLIP bigG / T5-XXL / Llama-3.1-8B-Instruct）。

⚠️ **T5 默认 max_sequence_length=128**，长提示词要手动调大，否则会被截断。

## 翻译要点

- 想要负面词生效，必须用 Full 档（guidance 5.0）。
- 提示词长（>128 token）记得调 T5 的 max_sequence_length。
