# Imagen 4 / Imagen 3（Google Vertex AI）

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/img-gen-prompt-guide
  - https://docs.cloud.google.com/vertex-ai/generative-ai/docs/image/omit-content-using-a-negative-prompt
- 来源等级：official

## Prompt style

描述性自然语言。官方原话：「Prompts don't need to be long or complex, but most good prompts are descriptive and clear.」

Vertex AI 有 "Set text prompt language"（`promptLanguage`）参数，支持语言列表 → **UNVERIFIED**（页面导航太多没抓到）。

## 结构

**主体 + 背景语境 + 风格**。官方示例：`A sketch of a modern apartment building surrounded by skyscrapers`。

Imagen 3 的建议：加描述性形容词/副词、加背景语境、引用艺术家或艺术流派、人脸用 `portrait` 这个词。

官方点名的修饰词：

- 相机距离与机位
- 光线：natural / dramatic / warm / cold
- 相机设置：motion blur、soft focus、bokeh、portrait
- 镜头：35mm、50mm、fisheye、wide angle、macro
- 胶片：black and white、polaroid
- 材质：`...made of...`
- 画质：high-quality、4K、HDR、Studio Photo、detailed

## 参数

`parameters.aspectRatio`：1:1（默认）、3:4、4:3、16:9、9:16；`sampleCount` 1–4；`enhancePrompt` 默认 true；`seed`；`personGeneration`；`safetySetting`；`outputOptions`。

比例是参数，不写进提示词（文档示例里也出现过 `(16:9 aspect ratio)` 追加写法）。

## 负面词

有 `negativePrompt` 字段。官方措辞规则很特别：**平铺直叙写不要什么**（`wall, frame`），**避免 `no` / `don't` 这类指令词**（`no walls`、`don't show walls` 都不行）。

官方示例值：`animals`、`blurry`、`text`、`cropped`。

⚠️ 主提示词里写 `a rainy city street at night with no people` 会被误读成「要有人」，这种要挪进 negativePrompt。

⚠️ 负面词页面只列了 imagen-3.0 的模型 ID，**Imagen 4 是否支持 `negativePrompt` 未验证**。

## 画内文字

引号写内容，**长度限制 25 字符以内**，最多 2–3 个短语；给个大概字体风格（别指望精确复刻字体）；给大小提示（small/medium/large）；位置是近似的，要多迭代。

## 多主体

这份指南里没写（另有 Subject customization / Style customization 页面，未读 → UNVERIFIED）。

## 翻译要点

- 主体 + 背景 + 风格三段就够，别写长。
- 画面文字超过 25 字符就别指望准。
- 要排除的东西放 negativePrompt，用名词写，别写「不要 X」。
