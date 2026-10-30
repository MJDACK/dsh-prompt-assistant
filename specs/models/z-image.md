# Z-Image / Z-Image-Turbo / Z-Image-Edit（阿里通义）

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/raw/main/README.md
  - https://raw.githubusercontent.com/Tongyi-MAI/Z-Image/main/README.md
  - https://arxiv.org/abs/2511.22699
- 来源等级：official

## Prompt style

自然语言，官方示例是逗号分隔的散文式 caption：主体 → 外观 → 道具 → 背景。中英皆可。

## 质量词：不推荐

官方 README 和报告都没提质量词堆砌（inferred：不要加 `masterpiece`、`8k` 这类）。

## 负面词

- 基础版 Z-Image 官方写：**Strongly recommended** for better control（但没给推荐词表）。
- Z-Image-Turbo `guidance_scale=0.0`，CFG 是关的，**负面词无效**。

## 画内文字

中英双语准确渲染（官方 showcase: `assets/showcase_rendering.png`）。

## 多主体 / 空间

官方示例用方位词（`above extended left palm`、`silhouetted tiered pagoda`）。没有专门的绑定规则（inferred）。

## 参数（官方 README）

| 档 | 参数 |
|---|---|
| Z-Image-Turbo | 8 NFEs（代码 `num_inference_steps=9`，实际 8 次前向）、guidance 0.0、1024×1024 |
| Z-Image 基础版 | 512×512–2048×2048（按总像素面积，任意比例）、guidance 3.0–5.0、steps 28–50、cfg_normalization：通用风格 False / 写实 True |
| Z-Image-Edit | steps 50、CFG 开 |

官方另有带推理的 **Prompt Enhancer**。

## 翻译要点

- 逗号分隔的散文，别写 tag 串。
- Turbo 别给负面词（无效）。
- 写实风格把 cfg_normalization 开成 True。

## 未能核实

Z-Image-Edit 官方 model card 尚未发布（README 标 "To be released"）。
