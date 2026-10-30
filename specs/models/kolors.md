# Kolors (快手可图)

- 类型：图像
- 规范来源：https://github.com/kwai-kolors/Kolors （README，检索 2026-10-30）
- 来源等级：official
- ComfyUI：ComfyUI-KwaiKolorsWrapper

## Prompt style

**中英双语原生**，上下文 256 tokens。官方描述是「bilingual in both Chinese and English」，且中文文字渲染（中英文字符）强。

- 官方示例本身就是中文：`一张瓢虫的照片，微距，变焦，高质量，电影，拿着一个牌子，写着"可图"`
- 中文语义理解好，尤其是中文元素和中文画面文字。
- 风格靠自然语言描述堆质量词：官方示例里常见 `高品质，超清晰，色彩鲜艳，超高分辨率，最佳品质，8k，高清，4K`、`新海诚风格` 这类中文质量/风格词。

## 结构与顺序

官方没给固定顺序，从示例反推（**inferred**）：

主体 + 外观/服装 → 场景/风格 → 质量词堆 → 画内文字（放最后，用引号给出内容）。

写实向，摄影词有效：`微距`、`电影`、`景深`、`胶片拍摄, 噪点, 晕影, 柯达胶卷, 复古`。

## 负面词

Diffusers 示例里 `negative_prompt` 默认空串，官方没给推荐负面词清单。

## 画内文字

**强项**。写法：`拿着一个牌子，写着"可图"` / `上面中文绿色大字写着"可图"`。中文直接写，不用翻译。

## 多主体 / 空间

官方没专门讲。

## 参数（官方推荐）

| 调度器 | guidance_scale | steps |
|---|---|---|
| EulerDiscreteScheduler（默认） | 5.0 | 50 |
| EDMDPMSolverMultistepScheduler | 5.0 | 25 |

## 翻译要点

- 这个模型**中文能直用**。用户要英文就给英文，但中国元素、汉字招牌建议保留中文原样。
- 质量词中文效果同样好，要英文版就写 `high quality, ultra detailed, sharp focus, best quality, 8k`。
- 风格词直译：`新海诚风格` → `Makoto Shinkai style`（模型也认 `shinkai style`）。
- 上下文只有 256 tokens，别写超长描述。

## 官方示例

```text
一张瓢虫的照片，微距，变焦，高质量，电影，拿着一个牌子，写着"可图"
```

```text
一个漂亮的女孩，高品质，超清晰，色彩鲜艳，超高分辨率，最佳品质，8k，高清，4K
```

```text
穿着晚礼服，在星光下的晚宴场景中，烛光闪闪，整个场景洋溢着浪漫而奢华的氛围
```
