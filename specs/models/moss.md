# MOSS-Image (OpenMOSS MOSS-Image-Base)

- 类型：图像
- 规范来源：https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md（检索 2026-10-30）
- 来源等级：official
- 官网：https://openmoss.ai/MOSS-Image/

## Prompt style

支持三种输入：**自然语言 caption**（主力）、**tag 串**、**JSON Layout**（实验性），也能混着写。

- 语言：**推荐英文**（训练量最多）；也支持中文等多语言。
- 官方示例的 caption 形态就是一段自然语言长描述（一个穿 MOSI T 恤的中国美女 + 背景玻璃板手写文字那种）。

## 自然语言 caption 怎么写

官方 captioning 规范要求描述：**composition, key subjects, actions, setting, colors, lighting, artistic style**，且**只写看得见的信息**。

落到写提示词就是这段顺序：

主体 → 动作 → 服装/外观 → 环境 → 构图 → 颜色 → 光线 → 艺术风格 → 画内文字（放最后）。

- 只写画面结果，不写相机型号、软件名、渲染引擎。
- 画内文字**原样保留**（中文也保留），用引号包住。

## tag 串顺序（官方推荐）

```text
Quality -> Score -> Meta -> Year -> Character -> Series -> Artist -> General
```

官方示例：

```text
best quality, highres, hatsune miku, vocaloid, @foo bar, 1girl, blue hair
```

同一段内小节顺序别乱；General 段里放通用 tag（服装、场景、动作、镜头）。

## 负面词（官方推荐）

```text
nsfw, worst quality, bad anatomy, watermark, jpeg artifact
```

按需要增删，但保留官方这几条。

## 画内文字

模型支持生成文字并自动换行，但**未必完全符合预期**。要精确控制换行，在 prompt 里手动加 `\n` 或直接换行。文字内容用引号包住。

## Layout JSON（实验性，默认不用）

```json
{
  "summary": {
    "meta": ["poster"],
    "canvas": "single",
    "caption": "A minimalist travel poster with a cream background, a blue mountain illustration, and the title EXPLORE at the top."
  },
  "items": [
    {"label": "text", "caption": "Large dark-blue uppercase title centered at the top.", "text": "EXPLORE", "bbox": [-416, -384, -288, 384]},
    {"label": "object", "caption": "A flat blue mountain illustration in the lower center.", "bbox": [-192, -288, 384, 288]}
  ],
  "bbox_coord_space": "abs_centralized",
  "bbox_format": "yxyx"
}
```

- `bbox_format: "yxyx"` → `[y_min, x_min, y_max, x_max]`。
- `bbox_coord_space: "abs_centralized"` → 原点在画布中心的绝对像素，x 向右、y 向下。1024×1024 范围是 -512..+512。常规左上角原点坐标减去 W/2、H/2 即得。
- `label` 取 `text` / `object`，生成文字的内容放 `text` 字段。

## 参数（官方推荐）

| 项 | 值 |
|---|---|
| 分辨率 | 总像素 1M / 1.5M / 2M（可外推 0.25M–4M）；宽高必须是 16 的正整数倍 |
| 步数 | ≥ 50 |
| CFG | 默认 3.0（推荐 3.0–6.0）；长 prompt 用 3.0，短 prompt 调高 |
| Shift | 5.0 |
| 采样器 | Euler |
| SLG | 标准 SLG scale 3（0.01–1.0）；二次采样用 `uncond skip`，推荐 skip layer 22（22/24/26 都有帮助） |

关掉 SLG 画面更真，但细节可能崩。

## 翻译要点

- 中文长句 → 拆成「主体句 + 场景句 + 文字句」的英文短句，别堆成一段。
- 洛丽塔这类风格词，MOSS 走自然语言时写 `Victorian-inspired lolita dress with layered lace ruffles and a petticoat`，比堆 tag 更稳。
- 用户要画面文字 → 明确写出文字内容和排版（字号、位置），必要时给 `\n`。

## 官方示例

```text
prompt:
一个穿着"MOSI"标志的T恤的中国美女正拿着黑色的马克笔面向镜头微笑。她身后的玻璃板上手写体写着 "一、MOSS-Image的技术路线：5B 的单流 DiT 模型，基于 Muon 训练。..."

negative prompt:
worst quality, bad anatomy
```

```text
prompt:
A wide view of a refrigerator beside a kitchen counter with a fruit bowl. A small sticky note on the refrigerator door is handwritten in Chinese:
"记得买牛奶和鸡蛋！
牛奶两盒，鸡蛋一打。
顺便带一袋面包。"
```
