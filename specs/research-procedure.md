# 未知模型：联网查规范

本地 `models/` 没有这个模型时，按下面流程走一遍，把结果固化成文件，以后就不用再查。

## 1. 找一手来源

按优先级：

1. HuggingFace 官方 model card（`huggingface.co/<org>/<repo>` 的 README）。
2. 官方 GitHub 仓库 README（`raw.githubusercontent.com/<org>/<repo>/main/README.md`）。
3. 官方文档站（fal.ai / replicate / 官方 docs 域名）。
4. 官方博客 / 发布页。

社区博客、Reddit、知乎、提示词合集只能当参考，标成 `[community]`，不能当规范。

抓取用 `web_fetch`；raw.githubusercontent 偶发 TLS 断连，重试一次。GitHub API 在共享 IP 上限流，列目录改用 `https://r.jina.ai/https://github.com/.../tree/main/...`。

## 2. 抽这 8 个字段

抽不齐就写「文档未说明」，别猜。

1. **Prompt style**：自然语言 / Danbooru tag / 混合；训练数据是 caption 还是 tag。
2. **语言**：推荐英文还是原生语言；是否支持中文。
3. **结构**：tag 型要官方顺序（quality / meta / year / count / character / series / artist / general 之类）；自然语言型要官方推荐的要素顺序和长度区间。
4. **负面词**：支不支持、官方推荐词、没有就说没有。
5. **画内文字**：能不能渲染文字、官方写法规则。
6. **多主体 / 空间**：怎么绑定人物到位置、要不要避免代词。
7. **参数**：官方明确写了的分辨率 / 步数 / CFG / 采样器。
8. **特殊语法**：Layout JSON、`Description:` 分隔符、`--flag`、参考图 `@mention` 之类。

## 3. 判来源等级

- `official` — 官方文档原文。
- `inferred` — 从训练数据描述或示例反推，标注推理依据。
- `community` — 社区经验，别写成硬规则。

## 4. 落盘模板

写到 `references/models/<slug>.md`：

```markdown
# <官方模型全名>

- 类型：图像 / 视频 / 编辑
- 规范来源：<URL>（检索日期 YYYY-MM-DD）
- 来源等级：official / inferred / community

## Prompt style
<自然语言 / tag / 混合；训练数据构成>

## 结构与顺序
<tag 顺序，或自然语言的要素顺序和长度>

## 负面词
<官方推荐，或「无」>

## 画内文字
<规则>

## 多主体 / 空间
<规则>

## 参数
<官方明确写了的>

## 示例
<官方示例原文 1–3 条>

## 翻译要点
<中文 → 该模型语法的具体注意点>
```

## 5. 更新路由表

在 `references/index.md` 的表里加一行：别名 / 文件 / 类型 / 风格。

## 6. 回答里带一句

「<model> 的规范是这次现查的，来源：<URL>」。

## 7. 查不到怎么办

明确说不确定，按 `generic.md` 写通用自然语言提示词，并说明「没查到该模型的官方规范，先按通用写法给」。别拿别的模型的规范硬套。
