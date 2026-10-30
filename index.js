/**
 * 提示词助手 —— Host half.
 *
 * Serves three things the panel needs:
 *   GET  /dsh-prompt-assistant/info     the default model, the provider catalog, prompt sources
 *   POST /dsh-prompt-assistant/rewrite  one rewrite call against either bundled system prompt
 *
 * The system prompts live in the workspace directory named by `promptDir` (default
 * D:\harness_deepseek\comfyui\系统提示词) so the user edits them in place; the copies in
 * `prompts/` are the fallback when that directory is unavailable.
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const DSH_HOME = process.env.DSH_HOME || join(homedir(), '.dsh')
const H3_SKILL = join(DSH_HOME, 'skills', 'h3-prompt-writing')

const DEFAULTS = {
  promptDir: process.env.DSH_PROMPT_ASSISTANT_PROMPTS || join(DSH_HOME, 'prompt-assistant', 'prompts'),
  // 0 means no cap on how many input images one edit request may carry.
  maxImages: 0,
  maxImageBytes: 12 * 1024 * 1024,
  maxBodyBytes: 256 * 1024 * 1024,
  maxTokens: 4096,
  timeoutMs: 180000,
  trustedHosts: [],
  // 模型提示词模式：先查本地规范库，查不到的再联网，查到的资料存进 learnedDir
  specDir: process.env.DSH_PROMPT_ASSISTANT_SPECS || join(DSH_HOME, 'skills', 'model-prompt-en', 'references'),
  specFallbackDir: join(HERE, 'specs'),
  learnedDir: process.env.DSH_PROMPT_ASSISTANT_LEARNED || join(DSH_HOME, 'prompt-assistant', 'specs'),
  // 直接挂外部文件当规范：MiniMax H3 的官方写法放在它的 skill 里（没装就自动跳过，走联网）
  specFiles: {
    h3: [join(H3_SKILL, 'SKILL.md'), join(H3_SKILL, 'references', 'base-en.txt')],
    'h3-ref': [join(H3_SKILL, 'SKILL.md'), join(H3_SKILL, 'references', 'ref-en.txt')],
  },
  aliasOverrides: {
    'minimax-h3': 'h3',
    'h3-video': 'h3',
    'h3-prompt': 'h3',
    ref2va: 'h3-ref',
    'h3-ref2va': 'h3-ref',
    'h3-reference': 'h3-ref',
  },
  specLabels: {
    h3: 'MiniMax H3 基础模式（T2VA / I2VA / FL2VA / L2VA）',
    'h3-ref': 'MiniMax H3 参考模式（Ref2VA）',
  },
  webLookup: true,
  webLookupMax: 2,
  webTimeoutMs: 15000,
}

const BASE = '/dsh-prompt-assistant'

const MODES = {
  t2i: { dir: '文生图', file: 'system_prompt_t2i.md', fallback: 't2i.md' },
  edit: { dir: '图像编辑', file: 'system_prompt_edit.md', fallback: 'edit.md' },
}

const MEDIA_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

function sendJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.statusCode = status
  res.setHeader('content-type', 'application/json; charset=utf-8')
  res.setHeader('cache-control', 'no-store')
  res.end(payload)
}

function fail(res, status, message) {
  sendJson(res, status, { ok: false, error: { message } })
}

function hostnameOf(authority) {
  const value = String(authority || '').toLowerCase()
  if (!value) return ''
  if (value.startsWith('[')) {
    const end = value.indexOf(']')
    return end > 0 ? value.slice(1, end) : ''
  }
  const colon = value.lastIndexOf(':')
  return colon >= 0 ? value.slice(0, colon) : value
}

function isLoopbackAuthority(authority) {
  const hostname = hostnameOf(authority)
  if (!hostname) return false
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) return true
  if (hostname === '::1') return true
  const match = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname)
  if (!match) return false
  return [1, 2, 3].every((i) => Number(match[i]) <= 255)
}

function isTrustedHost(authority, trustedHosts) {
  const normalized = String(authority || '').toLowerCase()
  if (!normalized) return false
  if (isLoopbackAuthority(normalized)) return true
  const hostname = hostnameOf(normalized)
  return trustedHosts.some((entry) => {
    const value = String(entry || '').toLowerCase()
    return value.includes(':') ? value === normalized : value === hostname
  })
}

/** Reject anything that is not the local page: bogus Host, cross-site marker, foreign Origin. */
function guard(req, res, config) {
  const headers = req.headers || {}
  const host = String(headers.host || '')
  if (!isTrustedHost(host, config.trustedHosts)) {
    fail(res, 403, '这个面板只接受本机请求（Host 不是回环地址）')
    return false
  }
  if (String(headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') {
    fail(res, 403, '拒绝跨站请求')
    return false
  }
  const origin = headers.origin
  if (typeof origin === 'string' && origin && origin !== 'null') {
    let originHost = ''
    try {
      originHost = new URL(origin).host
    } catch {
      fail(res, 403, '拒绝来源不明的请求')
      return false
    }
    if (originHost.toLowerCase() !== host.toLowerCase()) {
      fail(res, 403, '拒绝跨源请求')
      return false
    }
  }
  return true
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let settled = false
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      fn(value)
    }
    req.on('data', (chunk) => {
      size += chunk.length
      if (size > limit) {
        finish(reject, new Error('请求体太大'))
        req.destroy()
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => finish(resolve, Buffer.concat(chunks).toString('utf8')))
    req.on('error', (error) => finish(reject, error))
  })
}

/** Pull the JSON object out of a model reply that may be fenced or padded with prose. */
function parseModelJson(text) {
  let source = String(text || '').trim()
  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced) source = fenced[1].trim()
  const start = source.indexOf('{')
  const end = source.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('模型没有输出 JSON')
  let candidate = source.slice(start, end + 1)
  try {
    return JSON.parse(candidate)
  } catch {
    candidate = candidate.replace(/\r?\n/g, ' ').replace(/,\s*}/g, '}').replace(/,\s*]/g, ']')
    return JSON.parse(candidate)
  }
}

function normalizeResult(parsed) {
  if (!parsed || typeof parsed !== 'object') throw new Error('模型返回的 JSON 不是对象')
  const rewritten = typeof parsed.rewritten_prompt === 'string' ? parsed.rewritten_prompt.trim() : ''
  if (!rewritten) throw new Error('模型返回的 JSON 里没有 rewritten_prompt')
  let wh = typeof parsed.wh_ratio === 'string' ? parsed.wh_ratio.trim() : ''
  let follow = typeof parsed.ratio_follow === 'string' ? parsed.ratio_follow.trim() : ''
  if (wh && follow) follow = ''
  return { rewritten_prompt: rewritten, wh_ratio: wh, ratio_follow: follow, reply: typeof parsed.reply === 'string' ? parsed.reply.trim() : '' }
}

function mediaTypeOf(image) {
  const declared = typeof image.mediaType === 'string' ? image.mediaType.toLowerCase() : ''
  if (MEDIA_TYPES.has(declared)) return declared
  const name = String(image.name || '').toLowerCase()
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg'
  if (name.endsWith('.webp')) return 'image/webp'
  if (name.endsWith('.gif')) return 'image/gif'
  return 'image/png'
}

function withTimeout(promise, ms, fallback) {
  let timer
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(fallback), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

/* ------------------------------------------------------------------ */
/* 模型提示词：moss: 中文描述 → 该模型原生英文提示词 + 中文直译          */
/* ------------------------------------------------------------------ */

const MODEL_RULES = `你是提示词工程师。用户会给你一段中文画面描述，你要把它改写成目标模型原生语法的英文提示词，再附一句中文直译。

硬规则：
- 提示词正文全英文。只有「画内要渲染的文字」保留原文，并用双引号包住。
- 严格按下面给的模型规范写：tag 串型只写训练集里真有的词；自然语言型写完整句子；视频模型按它的分层公式；质量词、负面词、参数只在该规范明确支持时才给，不编造。
- 角色名用训练集写法（初音未来 → hatsune miku, vocaloid），带括号的系列名转义成 \\(name\\)。
- 用户没说的环境、光线、镜头不要硬编；必须补的只补最小值，并在 note 里用一句中文说明补了什么。
- 只写看得见的画面结果，不写相机型号、软件名，除非用户点名。
- 安全红线：未成年角色的性化内容不写。

输出：一个单行 JSON 对象，不要代码块，不要多余文字：
{"prompt":"英文提示词","translation":"中文直译","negative":"英文负面词或空串","params":"参数行或空串","note":"一句中文说明或空串"}
translation 是 prompt 的中文直译，不是解释；tag 串也要译成中文对照。`

const REFERENCE_NOTES = {
  t2i: '用户这次附了参考图（见本条消息里的图片）。把参考图当作这次画面的依据或风格参考：主体、构图、配色、光线可以取自参考图；文字要求与参考图冲突时以文字要求为准。输出仍然是一段成品画面的描述，不要写成「基于参考图修改」的说明。',
  model: '用户这次附了参考图（见本条消息里的图片）。按参考图里的主体外观和风格来写提示词；文字要求与参考图冲突时以文字要求为准。输出的是提示词本身，不要写成「把参考图改成…」这类编辑操作。',
}

const CHAT_RULES = `用户已经有一版结果，现在会继续提修改意见或者问问题。每次都要：
- 输出更新后的完整结果（字段和格式与本轮系统提示里约定的一字不差，不要只给 diff），没改就原样带回。
- 在 reply 里用一句中文说清这次改了什么；如果只是回答问题，就在 reply 里直接回答。
- 不要加用户没要求的新元素，不要动没被点名的部分。
输出仍然是一个单行 JSON 对象，在原字段之外多一个 reply，不要代码块。`

function sanitizeSlug(alias) {
  return String(alias || '')
    .trim()
    .toLowerCase()
    .replace(/[\\/\s]+/g, '-')
    .replace(/[^a-z0-9._-]/g, '')
    .replace(/^-+|-+$/g, '')
}

function parseModelInput(text) {
  const match = /^\s*([^\s:：]{1,64})\s*[:：]\s*([\s\S]+)$/.exec(String(text || ''))
  if (!match) return { alias: '', description: String(text || '').trim() }
  return { alias: match[1].toLowerCase(), description: match[2].trim() }
}

function parseAliasIndex(indexText) {
  const map = new Map()
  const models = []
  for (const line of String(indexText || '').split(/\r?\n/)) {
    if (!line.trim().startsWith('|')) continue
    const cells = line.split('|').map((cell) => cell.trim())
    if (cells.length < 4) continue
    const file = /`models\/([^`]+)\.md`/.exec(cells[2])
    if (!file) continue
    const slug = file[1]
    const aliases = cells[1].split(',').map((alias) => alias.trim().toLowerCase()).filter(Boolean)
    if (!aliases.length) continue
    for (const alias of aliases) {
      if (!map.has(alias)) map.set(alias, slug)
    }
    models.push({ slug, aliases, type: cells[3] || '', style: cells[4] || '' })
  }
  return { map, models }
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function clipText(text, limit) {
  const value = String(text || '')
  return value.length > limit ? value.slice(0, limit) + ' …' : value
}

function isPrivateHostname(hostname) {
  const host = String(hostname || '').toLowerCase().replace(/^\[|\]$/g, '')
  if (!host) return true
  if (host === 'localhost' || host === '::1' || host.endsWith('.local')) return true
  const v4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (v4) {
    const a = Number(v4[1])
    const b = Number(v4[2])
    if (a === 10 || a === 127 || a === 0) return true
    if (a === 192 && b === 168) return true
    if (a === 172 && b >= 16 && b <= 31) return true
    if (a === 169 && b === 254) return true
    return false
  }
  return false
}

/** 宿主的 web.fetch 会挡掉一些「解析到非公网 IP」的域名；这里直接抓，作兜底。 */
async function directFetchText(url, timeoutMs, limit = 8000) {
  const parsed = new URL(url)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') throw new Error('只支持 http(s)')
  if (isPrivateHostname(parsed.hostname)) throw new Error('拒绝内网地址')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; dsh-prompt-assistant)',
        accept: 'text/html,text/plain,*/*',
      },
    })
    const raw = await response.text()
    const type = String(response.headers.get('content-type') || '')
    const text = /html/i.test(type) ? stripHtml(raw) : raw
    return { status: response.status, text: clipText(String(text || '').trim(), limit) }
  } finally {
    clearTimeout(timer)
  }
}

export function apply(ctx, rawConfig) {
  const config = { ...DEFAULTS, ...(rawConfig && typeof rawConfig === 'object' ? rawConfig : {}) }
  let catalogCache = { at: 0, value: null }
  const promptCache = new Map()
  let specDirCache = { at: 0, value: null }
  let aliasCache = { key: '', at: 0, value: null }
  const specCache = new Map()

  async function readIfExists(path) {
    try {
      const text = (await readFile(path, 'utf8')).replace(/^\uFEFF/, '')
      return text.trim() ? text : null
    } catch {
      return null
    }
  }

  async function resolveSpecDir() {
    if (specDirCache.value && Date.now() - specDirCache.at < 60000) return specDirCache.value
    for (const dir of [config.specDir, config.specFallbackDir]) {
      if (!dir) continue
      if (await readIfExists(join(dir, 'index.md'))) {
        specDirCache = { at: Date.now(), value: dir }
        return dir
      }
    }
    if (specDirCache.value) return specDirCache.value
    throw new Error('找不到模型规范库：' + [config.specDir, config.specFallbackDir].filter(Boolean).join(' / '))
  }

  async function aliasIndex(dir) {
    if (aliasCache.value && aliasCache.key === dir && Date.now() - aliasCache.at < 60000) return aliasCache.value
    const text = await readIfExists(join(dir, 'index.md'))
    const value = parseAliasIndex(text || '')
    aliasCache = { key: dir, at: Date.now(), value }
    return value
  }

  async function resolveModelSpec(alias) {
    const mapped = (config.aliasOverrides && config.aliasOverrides[alias]) || alias
    const fileSpec = config.specFiles && config.specFiles[mapped]
    if (fileSpec) {
      const files = Array.isArray(fileSpec) ? fileSpec : [fileSpec]
      const parts = []
      for (const file of files) {
        const text = await readIfExists(file)
        if (text) parts.push(text)
      }
      if (parts.length) {
        return { slug: mapped, path: files[0], text: parts.join('\n\n---\n\n'), source: 'local' }
      }
    }
    const dir = await resolveSpecDir()
    const index = await aliasIndex(dir)
    const slug = index.map.get(mapped) || sanitizeSlug(mapped)
    const localPath = join(dir, 'models', slug + '.md')
    const cached = specCache.get(localPath)
    let text = cached && Date.now() - cached.at < 30000 ? cached.value : await readIfExists(localPath)
    if (text) {
      specCache.set(localPath, { at: Date.now(), value: text })
      return { slug, path: localPath, text, source: 'local' }
    }
    if (config.learnedDir) {
      const learnedPath = join(config.learnedDir, slug + '.md')
      text = await readIfExists(learnedPath)
      if (text) return { slug, path: learnedPath, text, source: 'learned' }
    }
    return { slug, path: null, text: null, source: 'unknown' }
  }

  async function webLookup(c, alias) {
    if (!config.webLookup) return null
    const web = c.get('web')
    if (!web) return null
    const query = alias + ' 模型 官方 提示词 指南 prompt guide syntax'
    const search = await withTimeout(
      web.search({ query, maxResults: 5 }).catch(() => null),
      config.webTimeoutMs,
      null,
    )
    if (!search || !Array.isArray(search.sources) || !search.sources.length) return null
    const docs = []
    const summary = typeof search.content === 'string' ? search.content.trim() : ''
    if (summary) {
      docs.push({ url: '', title: '检索摘要', snippet: summary, text: clipText(summary, 4000) })
    }
    for (const source of search.sources.slice(0, config.webLookupMax)) {
      if (!source || !source.url) continue
      const fetched = await withTimeout(
        web.fetch({ url: source.url }).catch(() => null),
        config.webTimeoutMs,
        null,
      )
      let body = ''
      if (fetched && fetched.body && typeof fetched.body.content === 'string') {
        body = fetched.body.kind === 'html' ? stripHtml(fetched.body.content) : fetched.body.content
      }
      let pageText = body.trim()
      // 官方文档站很多是前端渲染，宿主 fetch 又会挡掉一部分域名；这里直接抓兜底
      if (pageText.length < 200) {
        try {
          const direct = await directFetchText(source.url, config.webTimeoutMs)
          if (direct.text.length > pageText.length) pageText = direct.text
        } catch {
          // 抓不到就用搜索摘要
        }
      }
      const snippet = String(source.snippet || '').trim()
      const text = clipText(pageText || snippet, 6000)
      docs.push({
        url: source.url,
        title: source.title || '',
        snippet,
        text,
      })
    }
    const substance = docs.reduce((sum, doc) => sum + (doc.text || doc.snippet || '').length, 0)
    if (!docs.length || substance < 80) return null
    return { query, docs }
  }

  async function saveLearnedSpec(slug, alias, lookup) {
    if (!config.learnedDir || !lookup || !lookup.docs.length) return null
    const substance = lookup.docs.reduce((sum, doc) => sum + (doc.text || doc.snippet || '').length, 0)
    if (substance < 80) return null
    try {
      await mkdir(config.learnedDir, { recursive: true })
      const path = join(config.learnedDir, slug + '.md')
      if (await readIfExists(path)) return path
      const urls = lookup.docs.filter((doc) => doc.url).map((doc) => doc.url)
      const lines = [
        '# ' + alias + '（联网抓取，未人工核实）',
        '',
        '> 来源：' + (urls.length ? urls.join(' , ') : '检索摘要（无具体 URL）'),
        '> 等级：inferred（联网检索，规范可能不完整）',
        '> 抓取时间：' + new Date().toISOString(),
        '',
      ]
      for (const doc of lookup.docs) {
        lines.push('## ' + (doc.title || doc.url || '资料'), '', doc.url || '', doc.text || doc.snippet || '', '')
      }
      await writeFile(path, lines.join('\n'), 'utf8')
      return path
    } catch {
      return null
    }
  }

  function buildModelSystem(alias, spec, lookup) {
    const parts = [MODEL_RULES, '']
    parts.push(alias ? '目标模型：' + alias : '目标模型：未指定，按通用自然语言 caption 写。')
    parts.push('')
    if (spec && spec.text) {
      parts.push('### 该模型的提示词规范（' + (spec.source === 'local' ? '本地收录' : '本地缓存，来源是联网抓取') + '）')
      parts.push(clipText(spec.text, 14000))
    } else if (lookup) {
      parts.push('### 该模型本地没有收录规范，下面是联网检索到的资料（未经人工核实，可能不完整或过期）')
      for (const doc of lookup.docs) {
        parts.push('#### ' + (doc.title || doc.url))
        parts.push(doc.url)
        parts.push(doc.text || doc.snippet || '')
      }
      parts.push('')
      parts.push('如果这些资料互相矛盾，或者明显不是这个模型的资料，就在 note 里说明，并按通用自然语言 caption 写。')
    }
    return parts.join('\n')
  }

  function normalizeModelResult(parsed) {
    if (!parsed || typeof parsed !== 'object') throw new Error('模型返回的 JSON 不是对象')
    const pick = (key) => (typeof parsed[key] === 'string' ? parsed[key].trim() : '')
    const prompt = pick('prompt')
    if (!prompt) throw new Error('模型返回的 JSON 里没有 prompt')
    return {
      prompt,
      translation: pick('translation'),
      negative: pick('negative'),
      params: pick('params'),
      note: pick('note'),
      reply: pick('reply'),
    }
  }

  async function loadSystemPrompt(mode) {
    const spec = MODES[mode] || MODES.t2i
    const key = spec.dir
    const cached = promptCache.get(key)
    if (cached && Date.now() - cached.at < 5000) return cached.value
    const candidates = [
      join(config.promptDir, spec.dir, spec.file),
      join(HERE, 'prompts', spec.fallback),
    ]
    for (const path of candidates) {
      try {
        const text = (await readFile(path, 'utf8')).replace(/^\uFEFF/, '')
        if (text.trim()) {
          const value = { text, path }
          promptCache.set(key, { at: Date.now(), value })
          return value
        }
      } catch {
        // try the next candidate
      }
    }
    throw new Error('找不到系统提示词文件：' + candidates[0])
  }

  async function modelCatalog(c) {
    if (catalogCache.value && Date.now() - catalogCache.at < 10 * 60 * 1000) return catalogCache.value
    const providers = c.llm.listProviders()
    const withModels = await Promise.all(
      providers.map(async (provider) => {
        const models = await withTimeout(
          c.llm.listModels(provider.id).catch(() => []),
          5000,
          [],
        )
        return {
          id: provider.id,
          name: provider.name || provider.id,
          models: (models || []).map((model) => ({
            id: model.id,
            name: model.name || model.id,
            vision: Array.isArray(model.inputModalities) ? model.inputModalities.includes('image') : undefined,
          })),
        }
      }),
    )
    const value = { providers: withModels }
    catalogCache = { at: Date.now(), value }
    return value
  }

  function defaultSelection(c) {
    try {
      const selection = c.agentDefaultModel.currentSelection() || {}
      const provider = selection.provider || selection.providerId || ''
      const model = selection.model || selection.modelId || ''
      return { provider, model, reasoningEffort: selection.reasoningEffort }
    } catch {
      return { provider: '', model: '' }
    }
  }

  ctx.inject(['webServer', 'llm', 'attachments', 'agentDefaultModel'], (c) => {
    const disposers = []

    disposers.push(
      c.webServer.register({
        kind: 'exact',
        path: BASE + '/info',
        handler: async (req, res) => {
          if (!guard(req, res, config)) return
          if (req.method !== 'GET') {
            fail(res, 405, '只接受 GET')
            return
          }
          try {
            const catalog = await modelCatalog(c)
            const sources = {}
            for (const mode of Object.keys(MODES)) {
              try {
                const prompt = await loadSystemPrompt(mode)
                sources[mode] = prompt.path
              } catch (error) {
                sources[mode] = String(error && error.message ? error.message : error)
              }
            }
            let models = null
            try {
              const dir = await resolveSpecDir()
              const index = await aliasIndex(dir)
              const items = index.models.map((model) => ({
                slug: model.slug,
                name: model.aliases[0],
                aliases: model.aliases,
                type: model.type,
                style: model.style,
                source: 'local',
              }))
              for (const key of Object.keys(config.specFiles || {})) {
                if (items.some((item) => item.slug === key)) continue
                items.push({
                  slug: key,
                  name: key,
                  aliases: [key],
                  type: '规范文件',
                  style: (config.specLabels && config.specLabels[key]) || '',
                  source: 'file',
                })
              }
              try {
                const files = await readdir(config.learnedDir)
                for (const file of files) {
                  if (!file.endsWith('.md')) continue
                  const slug = file.slice(0, -3)
                  if (items.some((item) => item.slug === slug)) continue
                  items.push({
                    slug,
                    name: slug,
                    aliases: [slug],
                    type: '联网学到的',
                    style: '未人工核实',
                    source: 'learned',
                  })
                }
              } catch {
                // 还没学任何模型
              }
              models = {
                specDir: dir,
                count: items.length,
                aliases: items.reduce((sum, item) => sum + item.aliases.length, 0),
                extra: Object.keys(config.specFiles || {}),
                items,
              }
            } catch (error) {
              models = { error: String(error && error.message ? error.message : error) }
            }
            sendJson(res, 200, {
              ok: true,
              default: defaultSelection(c),
              providers: catalog.providers,
              promptSources: sources,
              models,
            })
          } catch (error) {
            fail(res, 500, String(error && error.message ? error.message : error))
          }
        },
      }),
    )

    disposers.push(
      c.webServer.register({
        kind: 'exact',
        path: BASE + '/lookup',
        handler: async (req, res) => {
          if (!guard(req, res, config)) return
          if (req.method !== 'GET') {
            fail(res, 405, '只接受 GET')
            return
          }
          const alias = String(new URL(req.url, 'http://127.0.0.1').searchParams.get('alias') || '').trim()
          if (!alias) {
            fail(res, 400, '带上 alias 参数')
            return
          }
          const web = c.get('web')
          const report = { hasWeb: !!web, alias, sources: [], fetched: [] }
          if (!web) {
            sendJson(res, 200, { ok: true, ...report })
            return
          }
          const query = alias + ' 模型 官方 提示词 指南 prompt guide syntax'
          let search = null
          try {
            search = await withTimeout(web.search({ query, maxResults: 5 }), config.webTimeoutMs * 2, null)
          } catch (error) {
            report.searchError = String(error && error.message ? error.message : error)
          }
          report.query = query
          report.searchContent = search && typeof search.content === 'string' ? search.content.slice(0, 300) : ''
          report.sources = search && Array.isArray(search.sources)
            ? search.sources.map((source) => ({
                url: source.url,
                title: source.title || '',
                snippetLength: String(source.snippet || '').length,
              }))
            : []
          for (const source of (search && search.sources ? search.sources.slice(0, config.webLookupMax) : [])) {
            if (!source || !source.url) continue
            let fetched = null
            try {
              fetched = await withTimeout(web.fetch({ url: source.url }), config.webTimeoutMs * 2, null)
            } catch (error) {
              report.fetched.push({ url: source.url, error: String(error && error.message ? error.message : error) })
            }
            let text = ''
            if (fetched && fetched.body && typeof fetched.body.content === 'string') {
              text = fetched.body.kind === 'html' ? stripHtml(fetched.body.content) : fetched.body.content
            }
            if (fetched) {
              report.fetched.push({
                url: source.url,
                status: fetched.statusCode,
                kind: fetched.body ? fetched.body.kind : null,
                bodyLength: fetched.body && typeof fetched.body.content === 'string' ? fetched.body.content.length : 0,
                textLength: text.trim().length,
              })
            }
            if (text.trim().length < 200) {
              try {
                const direct = await directFetchText(source.url, config.webTimeoutMs)
                report.fetched.push({ url: 'direct:' + source.url, status: direct.status, textLength: direct.text.length })
              } catch (error) {
                report.fetched.push({ url: 'direct:' + source.url, error: String(error && error.message ? error.message : error) })
              }
            }
          }
          sendJson(res, 200, { ok: true, ...report })
        },
      }),
    )

    disposers.push(
      c.webServer.register({
        kind: 'exact',
        path: BASE + '/chat',
        handler: async (req, res) => {
          if (!guard(req, res, config)) return
          if (req.method !== 'POST') {
            fail(res, 405, '只接受 POST')
            return
          }
          const startedAt = Date.now()
          try {
            const raw = await readBody(req, config.maxBodyBytes)
            let body
            try {
              body = JSON.parse(raw)
            } catch {
              fail(res, 400, '请求体不是合法 JSON')
              return
            }
            const mode = body.mode === 'edit' ? 'edit' : body.mode === 'model' ? 'model' : 't2i'
            const input = String(body.input || '').trim()
            const text = String(body.text || '').trim()
            if (!text) {
              fail(res, 400, '先写一句修改要求')
              return
            }

            let system
            let modelMeta = null
            if (mode === 'model') {
              const parsedInput = parseModelInput(input || text)
              const spec = parsedInput.alias ? await resolveModelSpec(parsedInput.alias) : null
              modelMeta = {
                alias: parsedInput.alias,
                slug: spec ? spec.slug : sanitizeSlug(parsedInput.alias) || 'generic',
                source: spec ? spec.source : 'unknown',
                path: spec ? spec.path : null,
                lookupUrls: [],
              }
              system = buildModelSystem(parsedInput.alias, spec, null)
            } else {
              system = (await loadSystemPrompt(mode)).text
            }

            const current = body.result && typeof body.result === 'object' ? body.result : {}
            const history = Array.isArray(body.history) ? body.history.slice(-12) : []
            const lines = [
              '【原始需求】',
              input || '（未提供）',
              '',
              '【当前结果 JSON】',
              JSON.stringify(current, null, 2),
              '',
            ]
            if (history.length) {
              lines.push('【此前对话】')
              for (const turn of history) {
                const who = turn && turn.role === 'assistant' ? '助手' : '用户'
                lines.push(who + '：' + String((turn && turn.text) || '').slice(0, 2000))
              }
              lines.push('')
            }
            lines.push('【本轮要求】', text)

            const selection = defaultSelection(c)
            const chosen = body.model && typeof body.model === 'object' ? body.model : null
            const provider = String((chosen && chosen.provider) || selection.provider || '')
            const model = String((chosen && chosen.model) || selection.model || '')
            if (!provider || !model) {
              fail(res, 400, '没有可用的模型：请先在设置里选一个默认模型')
              return
            }

            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), config.timeoutMs)
            let output = ''
            let finish = null
            try {
              const request = {
                provider,
                model,
                system: system + '\n\n' + CHAT_RULES,
                messages: [{ role: 'user', content: [{ type: 'text', text: lines.join('\n') }] }],
                signal: controller.signal,
              }
              if (config.maxTokens) request.maxTokens = config.maxTokens
              for await (const chunk of c.llm.stream(request)) {
                if (chunk.type === 'text-delta') output += chunk.text
                else if (chunk.type === 'finish') finish = chunk.reason
              }
            } finally {
              clearTimeout(timer)
            }

            if (finish && finish.kind === 'error') {
              const message = finish.failure && finish.failure.message ? finish.failure.message : '模型调用失败'
              fail(res, 502, message)
              return
            }
            if (finish && finish.kind === 'aborted') {
              fail(res, 504, '模型调用被中断或超时')
              return
            }
            if (!output.trim()) {
              fail(res, 502, '模型没有返回内容')
              return
            }

            let parsed
            try {
              parsed = mode === 'model'
                ? normalizeModelResult(parseModelJson(output))
                : normalizeResult(parseModelJson(output))
            } catch (error) {
              fail(res, 502, '模型输出解析失败：' + String(error && error.message ? error.message : error))
              return
            }

            sendJson(res, 200, {
              ok: true,
              mode,
              result: parsed,
              reply: parsed.reply || '',
              raw: output,
              model: { provider, model },
              spec: modelMeta,
              durationMs: Date.now() - startedAt,
            })
          } catch (error) {
            fail(res, 500, String(error && error.message ? error.message : error))
          }
        },
      }),
    )

    disposers.push(
      c.webServer.register({
        kind: 'exact',
        path: BASE + '/rewrite',
        handler: async (req, res) => {
          if (!guard(req, res, config)) return
          if (req.method !== 'POST') {
            fail(res, 405, '只接受 POST')
            return
          }
          const startedAt = Date.now()
          try {
            const raw = await readBody(req, config.maxBodyBytes)
            let body
            try {
              body = JSON.parse(raw)
            } catch {
              fail(res, 400, '请求体不是合法 JSON')
              return
            }
            const mode = body.mode === 'edit' ? 'edit' : body.mode === 'model' ? 'model' : 't2i'
            const text = String(body.text || '').trim()
            if (!text) {
              fail(res, 400, '先写一句描述')
              return
            }

            let prompt
            let modelMeta = null
            let lookupForSave = null
            let messageText = text
            if (mode === 'model') {
              const parsedInput = parseModelInput(text)
              if (!parsedInput.description) {
                fail(res, 400, '冒号后面还没写描述')
                return
              }
              messageText = parsedInput.description
              let spec = null
              let lookup = null
              if (parsedInput.alias) {
                spec = await resolveModelSpec(parsedInput.alias)
                if (spec.source === 'unknown') lookup = await webLookup(c, parsedInput.alias)
              } else {
                const dir = await resolveSpecDir()
                const genericPath = join(dir, 'generic.md')
                const genericText = await readIfExists(genericPath)
                if (genericText) spec = { slug: 'generic', path: genericPath, text: genericText, source: 'local' }
              }
              modelMeta = {
                alias: parsedInput.alias,
                slug: spec ? spec.slug : sanitizeSlug(parsedInput.alias) || 'generic',
                source: spec ? (parsedInput.alias ? spec.source : 'generic') : 'unknown',
                path: spec ? spec.path : null,
                lookupUrls: lookup ? lookup.docs.map((doc) => doc.url).filter(Boolean) : [],
              }
              if (spec && spec.source === 'unknown') lookupForSave = lookup
              prompt = { text: buildModelSystem(parsedInput.alias, spec, lookup), path: spec ? spec.path : null }
            } else {
              prompt = await loadSystemPrompt(mode)
            }

            const selection = defaultSelection(c)
            const chosen = body.model && typeof body.model === 'object' ? body.model : null
            const provider = String((chosen && chosen.provider) || selection.provider || '')
            const model = String((chosen && chosen.model) || selection.model || '')
            if (!provider || !model) {
              fail(res, 400, '没有可用的模型：请先在设置里选一个默认模型')
              return
            }

            const content = []
            const allImages = Array.isArray(body.images) ? body.images : []
            const rawImages = config.maxImages > 0 ? allImages.slice(0, config.maxImages) : allImages
            let imageCount = 0
            for (const image of rawImages) {
              if (!image || typeof image.data !== 'string' || !image.data) continue
              const base64 = image.data.replace(/^data:[^;]+;base64,/, '')
              const bytes = Buffer.from(base64, 'base64')
              if (!bytes.length) continue
              if (bytes.length > config.maxImageBytes) {
                fail(res, 413, '单张图超过 ' + Math.round(config.maxImageBytes / 1024 / 1024) + 'MB')
                return
              }
              let ref
              try {
                ref = await c.attachments.saveImage({
                  data: bytes,
                  mediaType: mediaTypeOf(image),
                  name: String(image.name || 'input'),
                })
              } catch (error) {
                const detail = error && error.message ? error.message : '图片读不了'
                fail(res, 400, '这张图读不了（' + detail + '）：换一张 PNG / JPG 再试。')
                return
              }
              content.push({ type: 'image', attachment: ref })
              imageCount += 1
            }
            content.push({ type: 'text', text: messageText })

            if (mode !== 'edit' && imageCount > 0 && REFERENCE_NOTES[mode]) {
              prompt = { ...prompt, text: prompt.text + '\n\n' + REFERENCE_NOTES[mode] }
            }

            if (imageCount > 0) {
              try {
                const resolved = await c.llm.resolveModelInfo(provider, model)
                const modalities = resolved.inputModalities || []
                if (modalities.length && !modalities.includes('image')) {
                  fail(res, 400, '当前模型（' + provider + ' / ' + model + '）不支持图片输入。换一个能看图的模型，比如 deepseek-flash，或者把参考图去掉。')
                  return
                }
              } catch {
                // 查不到模型能力就交给上游判断
              }
            }

            const controller = new AbortController()
            const timer = setTimeout(() => controller.abort(), config.timeoutMs)
            let output = ''
            let finish = null
            try {
              const request = {
                provider,
                model,
                system: prompt.text,
                messages: [{ role: 'user', content }],
                signal: controller.signal,
              }
              if (config.maxTokens) request.maxTokens = config.maxTokens
              for await (const chunk of c.llm.stream(request)) {
                if (chunk.type === 'text-delta') output += chunk.text
                else if (chunk.type === 'finish') finish = chunk.reason
              }
            } finally {
              clearTimeout(timer)
            }

            if (finish && finish.kind === 'error') {
              const message = finish.failure && finish.failure.message ? finish.failure.message : '模型调用失败'
              const hint = imageCount > 0 && /image|图片|unsupported|malformed/i.test(String(message))
                ? '（这张图没被当前通道接受：换 deepseek-flash 试试，或把图另存成 PNG 再传）'
                : ''
              fail(res, 502, message + hint)
              return
            }
            if (finish && finish.kind === 'aborted') {
              fail(res, 504, '模型调用被中断或超时')
              return
            }
            if (!output.trim()) {
              fail(res, 502, '模型没有返回内容')
              return
            }

            let parsed
            try {
              parsed = mode === 'model'
                ? normalizeModelResult(parseModelJson(output))
                : normalizeResult(parseModelJson(output))
            } catch (error) {
              fail(res, 502, '模型输出解析失败：' + String(error && error.message ? error.message : error))
              return
            }

            const payload = {
              ok: true,
              mode,
              result: parsed,
              raw: output,
              model: { provider, model },
              imageCount,
              promptPath: prompt.path,
              durationMs: Date.now() - startedAt,
            }
            if (mode === 'model') {
              payload.spec = modelMeta
              if (lookupForSave) {
                const saved = await saveLearnedSpec(modelMeta.slug, modelMeta.alias, lookupForSave)
                if (saved) {
                  payload.savedSpec = saved
                  payload.spec.source = 'learned'
                  payload.spec.path = saved
                }
              }
            }
            sendJson(res, 200, payload)
          } catch (error) {
            fail(res, 500, String(error && error.message ? error.message : error))
          }
        },
      }),
    )

    c.effect(() => () => {
      for (const dispose of disposers) {
        try {
          dispose()
        } catch {
          // already gone
        }
      }
    })
  })
}
