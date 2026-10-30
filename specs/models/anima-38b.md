# Anima 3.8B (Pro52 / Qwen3.5 Edition)

- 类型：图像
- 规范来源：https://huggingface.co/lylogummy/Anima-3.8B （README，检索 2026-10-30）
- 来源等级：official
- 与 `anima.md`（原生 2.9B）区别：**多一个 Qwen3.5 4B 语义分支**，专门加强提示词服从、多角色绑定、空间指令。

## Prompt style

自然语言、tag、混合都行，但**固定格式**是：

```text
<meta/artist/quality tags>
Description:
<自然语言描述>
```

官方示例：

```text
masterpiece, best quality, high quality, newest, year 2025, year 2024,
Description:
A fox-girl jumps over a high fence.
```

`Description:` 是分隔符，分隔符**后面必须是自然语言段**。前缀 tag 和 Description 段都要写，只写一边效果打折。

## 多角色 / 空间规则（官方明确要求）

每个主体一句，用名字点名，**避免代词**：

```text
Miku on top right.
Teto on lower left.
Apple on top left.
Nothing on lower right.
```

官方对比：

```text
不行：2girls, Miku is sitting near Teto, she is eating an ice-cream.
行：
There are two girls in this illustration.
Miku from Vocaloid and Teto from Vocaloid.
Miku is sitting near Teto, Miku is eating an ice-cream.
```

## 数量与绑定

官方示例直接写死数量：`Exactly three girls sit around a circular café table.`

```text
(@chen bin:1.1), masterpiece, best quality, high quality, newest, year 2025, year 2024, safe, detailed pupils,
Description:
Exactly three girls sit around a circular café table.
Flandre scarlet from touhou sits on the left and pours tea from a white teapot.
Kagamine rin from Vocaloid sits in the center and holds a slice of strawberry cake.
Shimakaze \(kancolle\) from kantai collection sits on the right and writes in a blue notebook.
dark background
```

注意官方示例前缀里用了 `(@chen bin:1.1)` 这种 artist 权重写法——除非用户点名这个艺术家，不要自己加。

## 画内文字

能出字且跟随指令，写法：把文字内容用引号给出 + 位置，例如 `On her left hand she holds a sign with the text: "ANIMA 3.8B"`。汉字示例官方也用了：`four large Chinese calligraphy characters in the four corners, top-left "空", top-right "是", bottom-left "即", bottom-right "色"`。

## 参数（官方推荐）

| 项 | 值 |
|---|---|
| 分辨率 | 832×1216（任何 ~1MP 都行） |
| Adapter strength | 1.0 |
| CFG | 7–8 |
| 步数 | 28–50 |
| 采样器 | `res_multistep + Beta`（凡是 Beta 系都行） |

strength=0 时 conditioning 等于原生 Anima。输出变生硬或角色趋同，先降 CFG 再降 strength。

## ComfyUI 接线

- `diffusion_models/Anima-2.9B/Anima-3.8-preview-0.1.safetensors`
- `text_encoders/qwen_3_06b_base.safetensors` + `qwen35_4b.safetensors` + `Anima-3.8-preview-0.1-adapter.safetensors`
- `vae/Qwen2D-Anime-dense_epoch_1.safetensors`
- 模型和 adapter 必须一起用。

## 翻译要点

- 中文描述 → 先拆主体，每个主体一句，用角色名点名，别写「她」。
- 前缀补：`masterpiece, best quality, high quality, newest, year 2025, year 2024`（官方示例的固定开头）。
- 位置指令直译：`在右上` → `on top right`；`在左下` → `on lower left`。
- 括号系列名转义：`\(kancolle\)`。
