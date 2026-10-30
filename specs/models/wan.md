# Wan 2.2（阿里通义万相）

- 类型：视频
- 规范来源（检索 2026-10-30）：
  - https://www.alibabacloud.com/help/en/model-studio/text-to-video-prompt
  - https://www.alibabacloud.com/help/en/model-studio/legacy-wan-text-to-video-api-reference
  - https://github.com/Wan-Video/Wan2.2
  - https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- 来源等级：official

## Prompt style

自然语言。**中文或英文都行**，官方明说。**长度上限 800 字符**（wan2.2 / 2.1 系列，超了自动截断）。

## 结构（官方公式）

- 基础：`Entity + Scene + Motion`
- 进阶：`Entity(desc) + Scene(desc) + Motion(desc) + Aesthetic control + Stylization`
- Aesthetic control = 光源 + 光照环境 + 景别 + 机位角度 + 镜头 + 运镜
- 图生视频：`Motion + Camera movement`（实体和场景由输入图提供）
- 多镜头公式和声音公式是 Wan 3.0 / 2.7 / 2.6 的，**2.2 没有**

## 官方镜头词典

- 运镜：camera pushes in、camera moves left、fixed camera
- 景别：close-up、close shot、medium shot、medium close-up、medium full shot、full shot、wide shot
- 角度：eye-level、low-angle、top-down、over-the-shoulder
- 镜头：wide-angle lens、long-focus lens、tilt-shift lens、macro
- 光线：daylight、firelight、overcast light、clear sky light、soft light、hard light、side light、rim light、backlight、top light、mixed light、practical light
- 构图：center / symmetrical / left-heavy / balanced / short-side

运镜语义（官方教的）：push-in = 亲密/紧张，pull-out = 尺度/孤立，tracking = 跟拍主体，orbit = 强调主体，fixed camera = 静止。

## 音频：2.2 静音

官方原文：「只有 wan2.2 和 wan2.1 系列支持静音视频生成，这些模型默认生成静音视频。」2.5 / 2.6 会自动生成音乐和音效，但 2.2 的音频要走单独的 Wan2.2-S2V-14B。官方还提醒：口型对白精确到词「不可靠」。

## 参数

| 项 | 值 |
|---|---|
| size | 宽×高（如 `1920*1080`，不是比例字符串） |
| 默认 | 1920*1080，480P/1080P 两档 |
| duration | **固定 5 秒**（2.2） |
| prompt_extend | 默认 **true**（Qwen 改写；返回里有 `actual_prompt`） |
| negative_prompt | 独立字段，≤500 字符，官方示例：`low resolution, error, worst quality, low quality, deformed, extra fingers, bad proportions` |

开源版：`Wan2.2-T2V-A14B` 5 秒 @480P/720P；`TI2V-5B` 720P@24fps、1280*704。

没有运动强度参数——快慢写进提示词（`moving slowly`、`swaying violently`）。

## 画内文字：官方明说别指望

「Text renders approximately — specific words will not be precise.」

## 一致性

2.2 的 T2V 没有 @ 引用。机制在 **Wan2.2-Animate-14B**（角色动画/替换）和 **S2V-14B**。「Image n / Video n」标识法是 2.6/2.7/3.0 才有的 → **[inference] 不适用于 2.2**。

## 翻译要点

- 800 字符是硬上限，英文比中文省字符，中文内容要压。
- 严格按公式分层写，Aesthetic control 单独一段。
- 负面词走独立字段，别塞进提示词。
