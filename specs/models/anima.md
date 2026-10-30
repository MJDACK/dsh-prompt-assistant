# Anima (CircleStone Labs × Comfy Org，2B / 2.9B 系)

- 类型：图像（二次元为主，不适合写实）
- 规范来源：https://huggingface.co/circlestone-labs/Anima （README，检索 2026-10-30）
- 来源等级：official

## Prompt style

训练数据是 **Danbooru 风格 tag + 自然语言 caption + 两者混合**，三种都能吃。默认走 **tag 串**。

## tag 顺序（官方）

```text
[quality/meta/year/safety] [1girl/1boy/1other etc] [character] [series] [artist] [general tags]
```

每个小节内部的 tag 顺序随意。

- **Quality（人评）**：masterpiece, best quality, good quality, normal quality, low quality, worst quality
- **Quality（美学会）**：score_9 … score_1
- 两种质量词可单用、可并用、可都不用。
- **Year**：year 2025, year 2024 …；阶段：newest, recent, mid, early, old
- **Meta**：highres, absurdres, anime screenshot, jpeg artifacts, official art 等
- **Safety**：safe, sensitive, nsfw, explicit
- **Artist**：`@` 开头，例如 `@big chungus`。**必须带 @**，否则效果很弱。

## 官方完整示例

```text
year 2025, newest, normal quality, score_5, highres, safe, 1girl, oomuro sakurako, yuru yuri, @nnn yryr, smile, brown hair, hat, solo, fur-trimmed gloves, open mouth, long hair, gift box, fang, skirt, red gloves, blunt bangs, gloves, one eye closed, shirt, brown eyes, santa costume, red hat, skin fang, twitter username, white background, holding bag, fur trim, simple background, brown skirt, bag, gift bag, looking at viewer, santa hat, ;d, red shirt, box, gift, fur-trimmed headwear, holding, red capelet, holding box, capelet
```

## Tag dropout

训练时随机丢 tag，**不用把相关 tag 写全**。挑重要的写。

## dataset tag（可选，前置两行）

额外在 ye-pop、DeviantArt 两个非二次元数据集上训练过，caption 开头加 dataset tag，第二行放 alt-text 或作品标题：

```text
ye-pop
For Sale: Others by Arun Prem
Abstract, oil painting of three faceless, blue-skinned figures. ...
```

```text
deviantart
Flame
Digital painting of a fiery dragon with glowing yellow eyes, ...
```

普通二次元图不用加。

## 负面词

官方 README 没给负面词推荐。用通用：`lowres, worst quality, bad anatomy, extra fingers, watermark`。要更准就按本地工作流调。

## 参数

官方 Anima 页面没给完整参数表，社区常用 1MP 级分辨率、CFG 7–8、28–50 步、`res_multistep + Beta` 采样器（见 `anima-38b.md`，那是 3.8B 的官方推荐，2.9B 可参考）。

## 翻译要点

- 角色名用 Danbooru 英文写法 + 系列 tag：初音未来 → `hatsune miku, vocaloid`。
- 系列名带括号要转义：`\(kancolle\)`。
- 场景、动作、镜头全用通用 tag（见 `references/tag-mapping.md`）。
- 多人物用 `2girls` + 各自特征（`girl with red hair`, `girl with black hair`），别用代词。
- 画内文字：`text`, `sign`, `speech bubble` 之类能不能出字不确定，要精确文字建议换 MOSS / Qwen-Image 那类强文字模型。
