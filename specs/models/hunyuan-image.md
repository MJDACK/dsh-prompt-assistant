# HunyuanImage 3.0（腾讯混元）

- 类型：图像（原生多模态自回归；另有 Instruct / Instruct-Distil 版）
- 规范来源：https://github.com/Tencent-Hunyuan/HunyuanImage-3.0 （README，检索 2026-10-30）
- 来源等级：official
- 官方提示词手册：docs.qq.com 上的 PromptHandBook（腾讯文档，可能要登录才能看）

## Prompt style

自然语言。官方定位是「超强的提示词服从」，并明确说它**会自动把稀疏提示词扩写成带上下文细节的完整描述**。

- 三个 bot-task 档位（官方 CLI 参数）：
  - `--bot-task image` — 直接生图。
  - `--bot-task recaption` — 先改写提示词再生图。
  - `--bot-task think_recaption` — 先推理（CoT）再改写再生图，**官方推荐**。
- 系统提示词档位 `--use-system-prompt`：`None / dynamic / en_vanilla / en_recaption / en_think_recaption / en_unified / custom`，官方推荐 `en_unified`。
- 纯 T2I 的 base checkpoint 不自动改写，官方自己建议**用 DeepSeek 改写提示词**（`--rewrite 1` + DeepSeek key）。

## 结构与顺序

官方没有强制的字段顺序，但它按「subject, composition, lighting, color palette, style」拆解复杂提示词（README 里描述 Instruct 的推理过程时这么写的）。写提示词照这个顺序排最稳：

主体 → 外观/服装 → 动作 → 场景环境 → 构图 → 光线 → 色彩 → 风格 → 画内文字。

官方 showcase 里的中文长提示词就是这个路子（材质、服装、道具、背景、配色、字号位置全写清），可以直接当模板。

## 负面词

官方没提负面词字段。

## 画内文字

强。中文文字排版是 showcase 重点：内容 + 字号（超大号/粗体）+ 位置 + 配色 + 字体感觉都要写。

## 多主体 / 空间

支持复杂指令和元素增删（编辑模式），多图融合最多 3 张参考图。生成时官方例子强调「exactly N 个主体」这类精确数量。

## 参数（官方推荐）

| 项 | 值 |
|---|---|
| 采样步数 | 50（Distil 版 8） |
| 分辨率 | `auto`（如 `1280x768`、`16:9`） |
| 系统提示 | `en_unified` |
| bot_task | `think_recaption` |
| max_new_tokens | 2048 |

## 翻译要点

- 这个模型是「中文原生 + 会自动扩写」，所以**别把提示词写得过于精简**——写细一点它才有东西可扩。
- 输出英文时保持要素全：主体、材质、配色、字号、位置都别丢。
- 官方 showcase 的中文范例风格很好用，值得当句式模板抄结构。

## 官方 showcase 提示词（结构范本）

```text
3D 毛绒质感拟人化马，暖棕浅棕肌理，穿藏蓝西装、白衬衫，戴深棕手套；疲惫带期待，坐于电脑前，旁置印 "HAPPY AGAIN" 的马克杯。橙红渐变背景，配超大号藏蓝粗体 "马上下班"，叠加米黄 "Happy New Year" 并标 "(2026)"。橙红为主，藏蓝米黄撞色，毛绒温暖柔和。
```
