# 模型路由表

`别名` 是用户可能写的模型关键词（小写比对）。命中即读对应规范文件。

| 别名 | 规范文件 | 类型 | 提示词风格 |
|---|---|---|---|
| moss, moss-image, moss-image-base, openmoss | `models/moss.md` | 图像 | 自然语言 caption 为主，也吃 tag 串 / Layout JSON |
| anima, anima-2.9b, anima-preview, circlestone-anima | `models/anima.md` | 图像 | Danbooru tag 串（可混自然语言） |
| anima-38b, anima3.8b, anima-3.8b, anima-pro52 | `models/anima-38b.md` | 图像 | tag 前缀 + `Description:` 自然语言段 |
| kolors, 可图, kwai-kolors | `models/kolors.md` | 图像 | 中英双语自然语言（中文原生强） |
| hunyuan-image, hunyuanimage, hunyuan, 混元 | `models/hunyuan-image.md` | 图像 | 自然语言，官方推荐先 recaption |
| flux, flux-1, flux1, flux-dev, flux-schnell, flux-kontext, kontext | `models/flux-1.md` | 图像 | 自然语言；官方明确不写空质量词；无负面词字段 |
| qwen-image, qwen, qwen-image-edit, 通义万相 | `models/qwen-image.md` | 图像 | 自然语言；官方推荐质量尾巴；中英文字渲染强 |
| z-image, z-image-turbo, z-image-edit | `models/z-image.md` | 图像 | 自然语言；Turbo 关 CFG，负面词无效 |
| hidream, hidream-i1, hidream-ai | `models/hidream-i1.md` | 图像 | 自然语言；只有 Full 档能吃负面词 |
| sd3, sd3.5, sd35, stable-diffusion-3, stable-diffusion-3-5 | `models/sd3.5.md` | 图像 | 自然语言 caption；官方负面词是空串 |
| sdxl, sd-xl, stable-diffusion-xl, sd1-5, sd15 | `models/sdxl.md` | 图像 | 短句短语；官方明示「画不出准字」 |
| seedream, seedream-4, seedream-4-5, seedream-4.0, doubao | `models/seedream.md` | 图像 | 自然语言句子，官方明确反对 tag 堆 |
| nano-banana, nanobanana, gemini-3-pro-image, gemini-image | `models/nano-banana.md` | 图像 | 对话式自然语言，多轮编辑 |
| imagen, imagen-4, imagen-3 | `models/imagen.md` | 图像 | 主体+背景+风格；画内文字 ≤25 字符 |
| midjourney, mj, midjourney-v7, mj7 | `models/midjourney.md` | 图像 | 描述画面 + `--参数` 结尾 |
| recraft, recraft-v3, recraftv3 | `models/recraft.md` | 图像 | 官方七段模块模板 |
| ideogram, ideogram-2, ideogram-2.0 | `models/ideogram.md` | 图像 | 自然语言或 JSON 提示词 |
| gpt-image, gpt-image-1, gpt-image-2.5, openai-image | `models/gpt-image.md` | 图像 | 自由格式；复杂需求按四段分标签 |
| seedance, seedance-1-5, seedance-1.5, seedance-1-5-pro | `models/seedance.md` | 视频 | 四层结构；对白加引号；原生音频 |
| kling, kling-2-6, kling-2.6, kling-2-6-pro | `models/kling.md` | 视频 | 自然语言 + 风格预设；Elements 参考图 |
| wan, wan-2-2, wan2.2, 万相 | `models/wan.md` | 视频 | 实体+场景+运动+美学控制；2.2 静音、800 字符上限 |
| veo, veo-3, veo-3-1, veo3.1 | `models/veo.md` | 视频 | 摄影段在最前的五段公式；原生音频规则明确 |
| hailuo, hailuo-02, hailuo2, minimax-hailuo | `models/hailuo.md` | 视频 | 方括号运镜命令；2000 字符上限 |
| runway, runway-gen-4, runway-gen-4-5, gen4, gen-4-5 | `models/runway.md` | 视频 | 完整句子；18 词镜头术语表；末帧接续 |

> MiniMax **H3** 不在这里——它有单独的 skill `h3-prompt-writing`（语法完全不同：integrated_multimodal_description / overall_soundscape / non_diegetic_music）。

## 未收录的模型

按 `research-procedure.md` 联网查 → 落盘 `models/<slug>.md` → 在本表加一行。

## 命名约定

- 文件名用小写 slug：官方模型名去掉空格，`-` 分隔（如 `qwen-image.md`、`seedream-4.md`）。
- 别名表里同时列官方名和常见口语写法。
