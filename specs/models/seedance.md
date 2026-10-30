# Seedance 1.5 Pro（字节）

- 类型：视频（原生音画一体）
- 规范来源（检索 2026-10-30）：
  - https://fal.ai/learn/devs/seedance-1-5-prompt-guide
  - https://fal.ai/learn/devs/seedance-1-5-user-guide
  - https://seed.bytedance.com/en/seedance1_5_pro
- 来源等级：official 结构，但文档出自 **fal 平台作者**，非字节一方文档 → 结构可信度记 `[platform]`

## Prompt style

自然语言散文。英文 API 没写语言规则和长度上限。中文提示词是否接受 **[not verified]**。

## 结构（官方四层，按这个顺序）

1. **主要动作或主体**
2. **对白或关键声音事件 —— 必须加引号**（引号是「优先匹配这段音频」的信号）
3. **环境音线索** —— 逗号分隔的声音来源
4. **视觉风格与氛围**

`prompt` 的官方定义是 "Scene, action, dialogue, camera, and sound"——镜头是行文的一部分，没有官方镜头词表。

## 镜头

唯一参数是 `camera_fixed`（bool，默认 false；true 锁死机位）。示例里用的是自由行文：`quick zoom in`、`golden hour cinematography`。官方镜头词表 **[not verified]**。

## 音频：支持

原生联合音视频（双分支 diffusion transformer）：口型同步对白、拟音、环境音，48 kHz AAC，MP4/H.264。`generate_audio`（bool，默认 true）。

对白写法：`"We have to leave now."`（引号内）。环境音写成一串逗号分隔的音源。

## 参数（不在提示词里）

| 项 | 值 |
|---|---|
| aspect_ratio | 21:9 / 16:9 / 4:3 / 1:1 / 3:4 / 9:16（默认 16:9） |
| resolution | 480p / 720p（默认 720p） |
| duration | 4–12 秒整数（默认 5） |
| seed | — |

没有运动强度参数；快慢写进提示词。

## 画内文字 / 角色一致性

- 画内文字：官方文档没提 → **[not verified]**，当作不支持处理。
- 一致性：fal 提供 T2V + I2V（首/尾帧），没有 @ 引用机制 → **[not verified]**。

## 翻译要点

- 严格按四层顺序写，别把风格提到最前面。
- 有对白就一定加引号。
- 环境音单独一层，逗号分隔。
