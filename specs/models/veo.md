# Veo 3.1（Google）

- 类型：视频（原生音频）
- 规范来源（检索 2026-10-30）：
  - https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- 来源等级：official

## Prompt style

结构化自然语言。官方没写语言规则 → **[not verified]**。

## 官方五段公式（顺序别改）

```text
[Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance]
```

注意 **Cinematography 在最前**，和别家不一样。

## 官方镜头词表

- 运镜：dolly shot、tracking shot、crane shot、aerial view、slow pan、POV shot
- 构图：wide shot、close-up、extreme close-up、low angle、two-shot
- 镜头与焦点：shallow depth of field、wide-angle lens、soft focus、macro lens、deep focus

## 音频：支持，规则明确

- 对白用引号：`A woman says, "We have to leave now."`
- 音效前缀：`SFX: thunder cracks in the distance.`
- 环境音前缀：`Ambient noise: the quiet hum of a starship bridge.`
- 情绪标签：`Emotion:`
- 加/删物体走 Veo 2 路线，不带音频。
- 输出带 SynthID。

## 负面词

写「要排除什么」的描述，而不是否定句：`a desolate landscape with no buildings or roads` 优于 `no man-made structures`。

## 参数（不在提示词里）

720p 或 1080p；16:9 或 9:16；片长 **4 / 6 / 8 秒**。

## 时间戳提示词（一次生成多镜头）

```text
[00:00-00:02] ...
[00:02-00:04] ...
```

每段自带景别、运镜、音效。

## 一致性

- **Ingredients to video**：上传场景/角色/物体/风格参考图，提示词里点名调用：`Using the provided images for the detective, the woman, and the office setting, create ...`
- **首尾帧**（first and last frame）做转场，可带音频。

## 画内文字

官方指南没提 → **[not verified]**。

## 翻译要点

- 五段公式逐段写，摄影段放最前。
- 有对白就引号，有音效就 `SFX:`，有环境音就 `Ambient noise:`。
