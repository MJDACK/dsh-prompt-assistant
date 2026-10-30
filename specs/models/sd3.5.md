# Stable Diffusion 3.5 (Large / Large-Turbo / Medium)

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://raw.githubusercontent.com/Stability-AI/sd3.5/main/README.md
  - https://raw.githubusercontent.com/Stability-AI/sd3.5/main/sd3_infer.py
  - https://huggingface.co/docs/diffusers/main/en/api/pipelines/stable_diffusion/stable_diffusion_3.md
  - https://arxiv.org/abs/2403.03206
- 来源等级：official（SD3.5 model card 是 gated，读不到全文）

## Prompt style

自然语言 caption，官方示例全是散文：

```text
cute wallpaper art of a cat
photo of woman, presumably in her mid-thirties, ... holding the moon close to her hand
```

SD3 官方论文有专节「5.2.2 Improved Captions」，说明训练用重写 caption（正文抓取被截断 → 该条 inferred）。

## 质量词：不推荐

官方示例里没有 masterpiece/8k 类词（inferred）。

## 负面词

官方参考实现 `sd3_infer.py` 把负向条件写成**空串**（`neg_cond = self.get_cond("")`）→ 官方不推荐负面词文本。diffusers 管线虽有 `negative_prompt` 字段，官方示例也传空串。

## 画内文字

SD3 官方论文称 MMDiT 改善了 text comprehension 和 typography；SD3.5 发布页标题也强调这点（正文抓不到，部分验证）。

## 多主体 / 空间

官方无提示词级规则（SD3 论文 Figure 1 caption 提到 spatial reasoning）→ 未验证。

## 参数（官方仓库 CONFIGS）

| 档 | steps | CFG | 采样器 | 其它 |
|---|---|---|---|---|
| sd3.5_medium | 50 | 5.0 | dpmpp_2m | Skip-Layer Guidance：layers [7,8,9]、scale 2.5、start 0.01、end 0.20、cfg 4.0（diffusers 文档注 "Recommended value by StabilityAI"） |
| sd3.5_large | 40 | 4.5 | dpmpp_2m | shift 3.0 |
| sd3.5_large_turbo | 4 | 1.0 | euler | shift 3.0 |

默认分辨率 1024×1024。代码注释："Most models prefer the range of 4-5"（CFG）。

## 翻译要点

- 散文式 caption，别堆质量词。
- 负面词官方是空串，想用负向提示就走 CFG，把否定改成正面描述更稳（和 FLUX 同理）。
