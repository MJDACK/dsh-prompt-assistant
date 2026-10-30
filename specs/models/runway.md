# Runway Gen-4 / Gen-4.5

- 类型：视频
- 规范来源（检索 2026-10-30）：
  - https://help.runwayml.com/hc/en-us/articles/46182941379347-Introduction-to-Prompting
  - https://help.runwayml.com/hc/en-us/articles/47313737321107-Text-to-Video-Prompting-Guide
  - https://help.runwayml.com/hc/en-us/articles/48324313115155-Image-to-Video-Prompting-Guide
  - https://help.runwayml.com/hc/en-us/articles/46749315925395
  - https://help.runwayml.com/hc/en-us/articles/46974685288467
- 来源等级：official

## Prompt style

自然语言，**完整句子优先**（关键词堆砌只是建议）。框架是 **who / what / when / where / how**。

- 用**正面表述**：`sharp focus, high detail`，不要 `not blurry`。
- 避开主观词（`beautiful`、`professional`）和互相冲突的指令。
- 过度细的多段提示词反而压死创作自由。

## 结构（建议，非强制）

- T2V：`[Camera] shot of [a subject/object] [action] in [environment]. [Supporting component descriptions]`
- I2V：`The camera [motion description] as the subject [action]. [Additional descriptions]`

**顺序不重要**——官方原话「the order in which elements are introduced in a prompt do not matter」。长度没有理想值，清晰 > 字数；T2V 通常比 I2V 长。

## 要素清单

视觉：主体外观、环境、光线、构图取景、风格。运动：主体动作、环境运动、镜头运动、运动风格与节奏、方向与速度。**漏掉某项 = 交出创作自由。**

## 官方镜头术语表

pan、tilt up/down、dolly、push in、pull back、truck、tracking、pedestal、crane/jib、orbit、arc、zoom、crash zoom、whip pan、handheld、steadicam、gimbal、static。

取景：medium shot、close-up、POV、establishing shot、close shot。

## 时间戳 / 顺序提示词

```text
[00:00 through 00:02] ... [00:02 through 00:03] ...
```

或者自然语言：`X occurs, then Y occurs. Finally, Z occurs.`。动作要给合理的时间预算。

## 锁机位技巧（官方原句）

- `The locked-off camera remains perfectly still.`
- `The camera must start and end on the exact same frame to create a perfect loop.`
- `Minimal subject motion only.`
- `Continuous, seamless shot`（压制 unwanted cuts）

## 参数

| 项 | 值 |
|---|---|
| 时长 | 2–10 秒 |
| 比例 | 16:9 1280x720、9:16 720x1280、1:1 960x960、4:3 1104x832、3:4 832x1104、21:9 1584x672 |
| 输出 | 720p，24 或 25 fps |

## 音频 / 画内文字

- 音频：五篇官方帮助文档都没把音频写成 Gen-4.5 的能力 → **[not verified]**（第三方普遍说无声）。
- 画内文字：官方没写 → **[not verified]**。
- 一致性：没有 @ 引用机制，官方路径是**拿上一条的末帧**当下一条的输入图。

## 翻译要点

- 完整句子 + who/what/when/where/how。
- 要素该给都给，漏了等于放弃控制。
- 镜头词直接抄官方术语表。
