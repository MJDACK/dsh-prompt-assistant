# 三个样例

## 例 1 · moss

输入：`moss:生成一个女孩穿着洛丽塔，手拿哥特伞。`

```text
prompt:
A young woman wearing a Victorian-inspired lolita dress with layered lace ruffles, a high collar and a full petticoat, holding an open gothic parasol with ornate black lace trim and a curved handle in one hand, soft diffused daylight, muted pastel palette, full body, sharp focus on the lace details.

negative:
nsfw, worst quality, bad anatomy, watermark, jpeg artifact

params: steps ≥ 50, CFG 3.0, Shift 5.0, sampler Euler, SLG on (uncond skip, layer 22), 1–2M pixels
```

（环境与光线用户没给，是补的最小值；不要就在末尾标一句「补了构图和光线」。）

## 例 2 · anima

输入：`anima：初音未来坐在课桌上`

```text
prompt:
masterpiece, best quality, highres, newest, year 2025, safe, 1girl, hatsune miku, vocaloid, sitting on desk, classroom, blue hair, twintails, looking at viewer, solo
```

## 例 3 · anima-38b

输入：`anima-38b：初音未来坐在课桌上`

```text
prompt:
masterpiece, best quality, high quality, newest, year 2025, year 2024,
Description:
Hatsune Miku from Vocaloid sits on a desk in a classroom, blue twintails, school uniform, looking at the viewer, soft daylight through the windows, anime illustration.
```

注意 `Description:` 单独一行，后面才是自然语言段。

## 对照：同一个描述在三种语法下的差别

| | 写法 |
|---|---|
| moss | 自然语言长描述（可见信息优先） |
| anima | 一行 Danbooru tag，官方顺序 |
| anima-38b | 前缀 tag + `Description:` + 自然语言段 |

## 例 4 · veo（视频）

输入：`veo：女孩撑着透明伞走过雨后的街道，霓虹倒映在水洼里。`

```text
prompt:
Slow tracking shot at eye level, shallow depth of field. A young woman in a beige trench coat holds a transparent umbrella and walks toward the camera. She crosses a rain-soaked city street at night, stepping through shallow puddles that mirror the neon shop signs. Cinematic night photography, moody low-key lighting, teal and magenta neon reflections on wet asphalt, 35mm film grain.
Ambient noise: light rain, distant traffic.
SFX: footsteps splashing in puddles.
```

（Veo 五段公式：摄影段在最前；对白用引号，音效 `SFX:`，环境音 `Ambient noise:`。）

## 例 5 · wan（视频）

输入：`wan：一个女孩撑着伞走过雨夜街道`

```text
prompt:
Entity: a young woman in a beige trench coat holding a transparent umbrella.
Scene: a rain-soaked city street at night, neon shop signs reflecting in shallow puddles.
Motion: she walks slowly toward the camera, the umbrella swaying gently, her hair and coat hem moving in the wind.
Aesthetic control: overcast light mixed with neon lighting, medium shot, eye-level angle, wide-angle lens, camera tracking the subject.
Stylization: cinematic night photography, teal and magenta palette, film grain, shallow depth of field.
```

（Wan 公式：Entity + Scene + Motion + Aesthetic control + Stylization；负面词走独立字段，不写进提示词。）
