# Stable Diffusion XL (SDXL 1.0 / base + refiner)

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/raw/main/README.md
  - https://huggingface.co/docs/diffusers/main/en/api/pipelines/stable_diffusion/stable_diffusion_xl
- 来源等级：official（限制项、示例、参数默认值）；**提示词格式本身官方没规定** → 下面的风格部分标 community / inferred

## Prompt style

官方 model card **没有给提示词格式规范**，只给了能力边界和示例。官方示例是短句：

```text
An astronaut riding a green horse
A majestic lion jumping from a big stone at night
```

社区通行写法（**community**）：一行短语描述（主体 + 动作 + 场景），逗号分隔；质量词单独一段；负面词走独立字段。

SDXL 训练用了两个文本编码器（OpenCLIP-ViT/G + CLIP-ViT/L），对两种风格都吃。

## 官方明示的能力边界（重要）

- **不能渲染清晰可读的文字**（"The model cannot render legible text"）→ 需要画面文字就别用 SDXL，换 MOSS / Qwen-Image / Z-Image。
- 组合关系弱（"A red cube on top of a blue sphere" 这类会翻车）。
- 人脸和人物容易崩。
- 不是照片级写实。

## 负面词

管线支持 `negative_prompt`，diffusers 默认空串。官方没给推荐负面词表；社区常用：

```text
lowres, bad anatomy, bad hands, extra fingers, worst quality, low quality, watermark, text
```

## 参数

diffusers 默认值（非 Stability 官方推荐值，别当硬规则）：1024×1024、steps 50、guidance_scale 5.0、negative_prompt 空串。

两段式（base + refiner）：40 步，high_noise_frac 0.8。

## 翻译要点

- 短句 + 逗号分隔，别写长叙事。
- 质量词（`masterpiece, best quality, highres`）社区普遍有用，官方没说要不要 → 标 community，可给可不给。
- 画面文字需求 → 明确提示「这个模型出不了准字」，并建议换模型。
