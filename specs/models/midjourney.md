# Midjourney v7（v6/v8 同样适用）

- 类型：图像
- 规范来源（检索 2026-10-30）：
  - https://docs.midjourney.com/hc/en-us/articles/32859204029709-Parameter-List
  - https://docs.midjourney.com/hc/en-us/articles/32502277092109-Text-Generation
  - https://docs.midjourney.com/hc/en-us/articles/32173351982093-No
  - https://docs.midjourney.com/hc/en-us/articles/31894244298125-Aspect-Ratio
  - https://docs.midjourney.com/hc/en-us/articles/36285124473997-Omni-Reference
  - https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
- 来源等级：official

## Prompt style

**描述画面**，不要下指令（传统 MJ 写法）。提示词语言：英文；中文文字渲染 → UNVERIFIED。

## 参数规则（硬性）

- 参数**永远放在最后**，描述之后，`--` 前有一个空格。
- **参数内部不能有任何标点**；参数后面不能再跟提示词文本。
- 可用：`--ar/--aspect`、`--no`、`--stylize/--s`、`--sref`、`--sw`、`--sv`、`--oref`、`--ow`、`--cref/--cw`、`--seed`、`--chaos/--c`、`--q`、`--r`、`--v`、`--version`、`--draft`、`--raw`、`--iw`、`--niji`、`--tile`、`--weird/--w`、`--profile/--p`、`--relax`、`--turbo`、`--fast`、`--stealth`、`--public`、`--hd/--sd`、`--edit`。
- `--ar` **不接受小数**（用 `139:100`）；默认 1:1。

## 负面词

用 `--no`，逗号分隔，放在最后：

```text
still life gouache painting --no fruit, apple, pear
```

别写 `without any fruit`、`please don't add fruit!`。

审查注意：`--no` 里每个词会被单独读，`--no modern clothing` 等于「no modern」+「no clothing」。

## 画内文字

- 必须用**双引号**（单引号和撇号不行）。
- 标准拉丁字母效果最好；词越短越好。
- 带上 `with the words` / `text` / `written`。
- 官方示例：`a pastel watercolor landscape with "imagine" written in the clouds`

## 角色一致性

V7 的角色参考是 **Omni Reference**：`--oref <url>`，只能一张图，只兼容 V7，`--ow` 1–1000（默认 100；除非 stylize 很高，否则保持 <400）；要配清晰的文本提示词，并在提示词**开头和结尾都强化风格**；多个角色就做一张含全部角色的图。

风格参考：`--sref`（图或代码）、`--sw` 0–1000（默认 100）、V7 `--sv 4|6`（默认 6）。

⚠️ `--cref/--cw` 现在列在 **Legacy Features**（V6 时代的东西）。`--seed` 官方明说**不能**用来保存角色或风格。

## 翻译要点

- 描述 + 参数，参数永远在最后。
- 文字用双引号。
- 保持角色 → 用 `--oref`，一张图，并在提示词首尾都点风格。
