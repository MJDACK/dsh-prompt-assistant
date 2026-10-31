/**
 * 提示词助手 —— Client half.
 *
 * Registers one sidebar panel icon and its matching main panel. The panel posts to
 * the Host routes defined in index.js; nothing is imported from Harness Client
 * packages beyond the module table's own react.
 */
window.__ModuleLoader__.load({
  id: 'dsh-prompt-assistant',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const { useState, useEffect, useRef } = React

    const COPY_FEEDBACK_MS = 1400

    const CSS = [
      '.dshpa-root{height:100%;display:flex;flex-direction:column;overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;}',
      '.dshpa-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px 24px 14px;}',
      '.dshpa-head-main{min-width:0;flex:1 1 auto;}',
      '.dshpa-title{font-size:17px;font-weight:600;line-height:1.3;}',
      '.dshpa-sub{margin-top:4px;font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary);}',
      '.dshpa-head-right{display:flex;flex-direction:column;align-items:flex-end;gap:6px;flex-shrink:0;}',
      '.dshpa-body{flex:1;min-height:0;display:flex;gap:18px;padding:0 24px 20px;}',
      '.dshpa-col{display:flex;flex-direction:column;min-height:0;}',
      '.dshpa-col-input{width:min(44%,460px);flex-shrink:0;gap:12px;}',
      '.dshpa-col-output{flex:1;min-width:0;gap:12px;}',
      '.dshpa-modes{display:inline-flex;align-self:flex-start;gap:2px;padding:3px;border-radius:10px;background:var(--dsw-alias-bg-layer-2);}',
      '.dshpa-mode{border:0;background:transparent;color:var(--dsw-alias-label-secondary);font-size:13px;line-height:1.4;padding:6px 14px;border-radius:8px;cursor:pointer;font-family:inherit;}',
      '.dshpa-mode[data-active="true"]{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);box-shadow:0 1px 2px rgba(0,0,0,.12);}',
      '.dshpa-mode:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}',
      '.dshpa-hint{font-size:12px;line-height:1.5;color:var(--dsw-alias-label-secondary);}',
      '.dshpa-input{flex:1;min-height:180px;width:100%;box-sizing:border-box;resize:none;border:1px solid var(--dsw-alias-border-l2);border-radius:12px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13.5px;line-height:1.7;padding:12px 14px;outline:none;}',
      '.dshpa-input:focus{border-color:var(--dsw-alias-brand-primary);}',
      '.dshpa-input::placeholder{color:var(--dsw-alias-state-idle-primary);}',
      '.dshpa-files{display:flex;flex-wrap:wrap;gap:8px;}',
      '.dshpa-file{position:relative;width:64px;height:64px;border-radius:10px;overflow:hidden;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);}',
      '.dshpa-file img{width:100%;height:100%;object-fit:cover;display:block;}',
      '.dshpa-file-x{position:absolute;top:2px;right:2px;width:18px;height:18px;border-radius:9px;border:0;background:rgba(0,0,0,.55);color:#fff;font-size:12px;line-height:18px;padding:0;cursor:pointer;}',
      '.dshpa-tools{display:flex;align-items:center;gap:8px;}',
      '.dshpa-btn{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.4;padding:7px 12px;border-radius:9px;cursor:pointer;}',
      '.dshpa-btn:hover{background:var(--dsw-alias-bg-layer-2);}',
      '.dshpa-btn:disabled{opacity:.5;cursor:default;}',
      '.dshpa-btn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}',
      '.dshpa-primary{margin-left:auto;border-color:transparent;background:var(--dsw-alias-brand-primary);color:#fff;font-weight:500;padding:8px 18px;}',
      '.dshpa-primary:hover{background:var(--dsw-alias-brand-primary);filter:brightness(1.05);}',
      '.dshpa-error{margin-top:10px;border:1px solid var(--dsw-alias-state-error-primary);border-radius:10px;padding:9px 12px;font-size:12.5px;line-height:1.6;color:var(--dsw-alias-state-error-primary);}',
      '.dshpa-out{flex:1;min-height:0;overflow:auto;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);padding:16px 18px;}',
      '.dshpa-empty{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;color:var(--dsw-alias-label-secondary);border:1px dashed var(--dsw-alias-border-l2);border-radius:14px;font-size:13px;line-height:1.7;text-align:center;padding:24px;}',
      '.dshpa-card{border:1px solid var(--dsw-alias-border-l1);border-radius:12px;background:var(--dsw-alias-bg-base);padding:12px 14px;margin-bottom:12px;}',
      '.dshpa-card-head{display:flex;align-items:center;gap:10px;margin-bottom:8px;}',
      '.dshpa-card-title{font-size:12px;font-weight:600;letter-spacing:.02em;color:var(--dsw-alias-label-secondary);text-transform:uppercase;}',
      '.dshpa-card-head .dshpa-btn{margin-left:auto;padding:4px 10px;font-size:12px;}',
      '.dshpa-prose{margin:0;white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.75;font-family:inherit;}',
      '.dshpa-mono{margin:0;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12px;line-height:1.65;color:var(--dsw-alias-label-secondary);}',
      '.dshpa-chips{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;}',
      '.dshpa-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--dsw-alias-border-l1);border-radius:999px;background:var(--dsw-alias-bg-layer-2);padding:4px 10px;font-size:12px;color:var(--dsw-alias-label-primary);}',
      '.dshpa-chip b{font-weight:600;}',
      '.dshpa-meta{display:flex;flex-wrap:wrap;gap:12px;font-size:11.5px;color:var(--dsw-alias-label-secondary);margin-bottom:10px;}',
      '.dshpa-select{border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:5px 8px;max-width:260px;}',
      '.dshpa-model-row{display:flex;align-items:center;gap:6px;}',
      '.dshpa-spin{display:inline-block;width:12px;height:12px;border:2px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;margin-right:7px;vertical-align:-1px;animation:dshpa-spin .8s linear infinite;}',
      '@keyframes dshpa-spin{to{transform:rotate(360deg)}}',
      '.dshpa-chat{flex:none;display:flex;flex-direction:column;min-height:0;max-height:46%;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);overflow:hidden;}',
      '.dshpa-chat-head{display:flex;align-items:baseline;gap:8px;padding:8px 12px;border-bottom:1px solid var(--dsw-alias-border-l1);font-size:12px;color:var(--dsw-alias-label-secondary);}',
      '.dshpa-chat-head b{font-weight:600;color:var(--dsw-alias-label-primary);font-size:12.5px;}',
      '.dshpa-chat-log{flex:1;min-height:54px;max-height:260px;overflow:auto;padding:10px 12px;display:flex;flex-direction:column;gap:8px;}',
      '.dshpa-bubble{max-width:92%;border-radius:10px;padding:7px 10px;font-size:12.5px;line-height:1.65;white-space:pre-wrap;word-break:break-word;}',
      '.dshpa-bubble[data-role="user"]{align-self:flex-end;background:var(--dsw-alias-bg-layer-2);}',
      '.dshpa-bubble[data-role="assistant"]{align-self:flex-start;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);}',
      '.dshpa-chat-empty{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.7;}',
      '.dshpa-chat-row{display:flex;gap:8px;padding:10px;border-top:1px solid var(--dsw-alias-border-l1);}',
      '.dshpa-chat-input{flex:1;min-height:36px;max-height:96px;resize:none;border:1px solid var(--dsw-alias-border-l2);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font:inherit;font-size:13px;line-height:1.6;padding:8px 10px;outline:none;box-sizing:border-box;}',
      '.dshpa-chat-input:focus{border-color:var(--dsw-alias-brand-primary);}',
      '.dshpa-chat-row .dshpa-primary{margin-left:0;align-self:flex-end;}',
      '.dshpa-spec-wrap{position:relative;display:flex;flex-direction:column;align-items:flex-end;}',
      '.dshpa-spec-toggle{border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:1.4;padding:4px 10px;border-radius:8px;cursor:pointer;}',
      '.dshpa-spec-toggle:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);}',
      '.dshpa-spec-toggle:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}',
      '.dshpa-spec-pop{position:absolute;right:0;top:100%;margin-top:6px;width:min(420px,76vw);max-height:340px;overflow:auto;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.18);padding:8px;z-index:30;display:flex;flex-direction:column;gap:2px;}',
      '.dshpa-spec-tip{font-size:11.5px;line-height:1.5;color:var(--dsw-alias-label-secondary);padding:4px 6px 8px;}',
      '.dshpa-spec-item{display:flex;align-items:baseline;gap:10px;width:100%;border:0;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;text-align:left;padding:6px 8px;border-radius:8px;cursor:pointer;}',
      '.dshpa-spec-item:hover{background:var(--dsw-alias-bg-layer-2);}',
      '.dshpa-spec-name{font-weight:500;}',
      '.dshpa-spec-meta{margin-left:auto;font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;}',
      '@media (max-width:900px){.dshpa-body{flex-direction:column;overflow:auto;}.dshpa-col-input{width:100%;flex:none;height:auto;}.dshpa-col-output{flex:none;min-height:320px;}.dshpa-out{height:auto;}.dshpa-chat{max-height:none;}.dshpa-chat-log{max-height:220px;}}'
    ].join('')

    function copyText(value) {
      const text = String(value == null ? '' : value)
      if (!text) return Promise.resolve(false)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(
          () => true,
          () => legacyCopy(text),
        )
      }
      return Promise.resolve(legacyCopy(text))
    }

    function legacyCopy(text) {
      try {
        const area = document.createElement('textarea')
        area.value = text
        area.setAttribute('readonly', '')
        area.style.position = 'fixed'
        area.style.top = '-1000px'
        area.style.opacity = '0'
        document.body.appendChild(area)
        area.select()
        const ok = document.execCommand('copy')
        document.body.removeChild(area)
        return ok
      } catch {
        return false
      }
    }

    function CopyButton(props) {
      const [state, setState] = useState('idle')
      const timer = useRef(0)
      useEffect(() => () => clearTimeout(timer.current), [])
      function onClick() {
        copyText(props.value).then((ok) => {
          setState(ok ? 'done' : 'fail')
          clearTimeout(timer.current)
          timer.current = setTimeout(() => setState('idle'), COPY_FEEDBACK_MS)
        })
      }
      const label = state === 'done' ? '已复制' : state === 'fail' ? '复制失败' : props.label || '复制'
      return h(
        'button',
        { type: 'button', className: 'dshpa-btn', onClick },
        label,
      )
    }

    function PanelIcon(props) {
      const size = (props && props.size) || 18
      const active = !!(props && props.active)
      return h(
        'svg',
        {
          viewBox: '0 0 24 24',
          width: size,
          height: size,
          fill: 'none',
          stroke: 'currentColor',
          strokeWidth: 1.7,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          'aria-hidden': true,
          style: { display: 'block', opacity: active ? 1 : 0.8 },
        },
        h('path', { d: 'M4.5 19.5 14 10' }),
        h('path', { d: 'M12.6 8.6l2.8 2.8' }),
        h('path', { d: 'M15.2 3.2v2.4M14 4.4h2.4' }),
        h('path', { d: 'M19.4 8.6v2.4M18.2 9.8h2.4' }),
      )
    }

    // 统一重编码成 PNG/JPEG：粘贴来的、WebP、带奇怪 MIME 的图，上游不会因为
    // 「声明的类型和真实字节对不上」报 Unsupported or malformed image data。
    function normalizeImageFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const img = new Image()
          img.onload = () => {
            try {
              const limit = 2048
              const width = img.naturalWidth || img.width
              const height = img.naturalHeight || img.height
              const scale = Math.min(1, limit / Math.max(width, height))
              const w = Math.max(1, Math.round(width * scale))
              const h = Math.max(1, Math.round(height * scale))
              const canvas = document.createElement('canvas')
              canvas.width = w
              canvas.height = h
              const ctx = canvas.getContext('2d')
              if (!ctx) {
                resolve({ data: String(reader.result || ''), mediaType: file.type || 'image/png' })
                return
              }
              ctx.drawImage(img, 0, 0, w, h)
              const type = file.type || ''
              const keepAlpha = /png|webp|gif|svg/i.test(type) || !type
              const mediaType = keepAlpha ? 'image/png' : 'image/jpeg'
              resolve({ data: canvas.toDataURL(mediaType, 0.92), mediaType })
            } catch (err) {
              reject(err)
            }
          }
          img.onerror = () => reject(new Error('图片解码失败：' + (file.name || 'image')))
          img.src = String(reader.result || '')
        }
        reader.onerror = () => reject(reader.error || new Error('读取图片失败'))
        reader.readAsDataURL(file)
      })
    }

    const MAX_IMAGE_BYTES = 12 * 1024 * 1024

    // The panel unmounts whenever the user visits another sidebar entry, so the
    // draft, the uploaded images and the last result live outside the component.
    const memory = { mode: 't2i', text: '', images: [], modelKey: '', info: null, result: null, chat: [], sourceText: '' }

    function PromptAssistantPage() {
      const [mode, setMode] = useState(memory.mode)
      const [text, setText] = useState(memory.text)
      const [images, setImages] = useState(memory.images)
      const [info, setInfo] = useState(memory.info)
      const [modelKey, setModelKey] = useState(memory.modelKey)
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')
      const [result, setResult] = useState(memory.result)
      const [sourceText, setSourceText] = useState(memory.sourceText)
      const [chat, setChat] = useState(memory.chat)
      const [chatInput, setChatInput] = useState('')
      const [chatBusy, setChatBusy] = useState(false)
      const [chatError, setChatError] = useState('')
      const [specOpen, setSpecOpen] = useState(false)
      const [dragging, setDragging] = useState(false)
      const fileInput = useRef(null)
      const textArea = useRef(null)
      const chatLog = useRef(null)
      const specRef = useRef(null)

      useEffect(() => { memory.mode = mode }, [mode])
      useEffect(() => { memory.text = text }, [text])
      useEffect(() => { memory.images = images }, [images])
      useEffect(() => { memory.modelKey = modelKey }, [modelKey])
      useEffect(() => { memory.result = result }, [result])
      useEffect(() => { memory.chat = chat }, [chat])
      useEffect(() => { memory.sourceText = sourceText }, [sourceText])

      useEffect(() => {
        if (chatLog.current) chatLog.current.scrollTop = chatLog.current.scrollHeight
      }, [chat, chatBusy])

      useEffect(() => {
        if (!specOpen) return undefined
        const onDown = (event) => {
          if (specRef.current && !specRef.current.contains(event.target)) setSpecOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
      }, [specOpen])

      function loadInfo(force) {
        const url = '/dsh-prompt-assistant/info' + (force ? '?refresh=1' : '')
        return fetch(url, { headers: { accept: 'application/json' } })
          .then((response) => response.json())
          .then((body) => {
            if (!body || body.ok !== true) return
            memory.info = body
            setInfo(body)
            const keys = []
            for (const provider of body.providers || []) {
              for (const model of provider.models || []) keys.push(provider.id + '|' + model.id)
            }
            if (!memory.modelKey || !keys.includes(memory.modelKey)) {
              if (body.default && body.default.provider && body.default.model) {
                setModelKey(body.default.provider + '|' + body.default.model)
              }
            }
          })
          .catch(() => {})
      }

      useEffect(() => {
        loadInfo(false)
      }, [])

      function addFiles(fileList) {
        const files = Array.from(fileList || []).filter((file) => file && /^image\//.test(file.type || ''))
        if (!files.length) return
        setError('')
        Promise.all(
          files.map(async (file) => {
            if (file.size > MAX_IMAGE_BYTES) throw new Error('单张图不能超过 12MB：' + file.name)
            const normalized = await normalizeImageFile(file)
            return {
              id: Math.random().toString(36).slice(2),
              name: file.name || 'input.png',
              mediaType: normalized.mediaType,
              data: normalized.data,
            }
          }),
        )
          .then((added) => {
            if (added.length) setImages((current) => current.concat(added))
          })
          .catch((err) => setError(String((err && err.message) || err)))
      }

      function onDrop(event) {
        event.preventDefault()
        setDragging(false)
        addFiles(event.dataTransfer && event.dataTransfer.files)
      }

      function onPaste(event) {
        const items = (event.clipboardData && event.clipboardData.items) || []
        const files = []
        for (const item of items) {
          if (item.kind === 'file') {
            const file = item.getAsFile()
            if (file) files.push(file)
          }
        }
        if (files.length) {
          event.preventDefault()
          addFiles(files)
        }
      }

      function onSubmit() {
        const trimmed = text.trim()
        if (busy) return
        if (!trimmed) {
          setError('先写一句描述')
          if (textArea.current) textArea.current.focus()
          return
        }
        if (mode === 'edit' && images.length === 0) {
          setError('编辑模式需要输入图：先把要改的图加进来')
          return
        }
        if (mode === 'model' && !/[:：]/.test(trimmed)) {
          setError('格式是「模型名: 中文描述」，比如 moss: 生成一个女孩……')
          return
        }
        if (images.length && visionByModel[modelKey] === false) {
          setError('当前模型不支持图片输入：换一个能看图的模型（如 DeepSeek-V4.1-Flash），或把参考图去掉。')
          return
        }
        setBusy(true)
        setError('')
        const payload = {
          mode,
          text: trimmed,
          images: images.map((image) => ({ name: image.name, mediaType: image.mediaType, data: image.data })),
        }
        if (modelKey) {
          const separator = modelKey.indexOf('|')
          if (separator > 0) {
            payload.model = { provider: modelKey.slice(0, separator), model: modelKey.slice(separator + 1) }
          }
        }
        fetch('/dsh-prompt-assistant/rewrite', {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((response) => response.json().then((body) => ({ response, body })))
          .then(({ response, body }) => {
            if (!response.ok || !body || body.ok !== true) {
              const message = body && body.error && body.error.message ? body.error.message : 'HTTP ' + response.status
              throw new Error(message)
            }
            setResult(body)
            setSourceText(trimmed)
            setChat([])
            setChatInput('')
            setChatError('')
          })
          .catch((err) => setError(String((err && err.message) || err)))
          .finally(() => setBusy(false))
      }

      function sendChat() {
        const trimmed = chatInput.trim()
        if (!trimmed || chatBusy || !result) return
        setChat((current) => current.concat({ role: 'user', text: trimmed }))
        setChatInput('')
        setChatError('')
        setChatBusy(true)
        const payload = {
          mode: result.mode,
          input: sourceText,
          result: result.result || {},
          history: chat,
          text: trimmed,
        }
        if (modelKey) {
          const separator = modelKey.indexOf('|')
          if (separator > 0) {
            payload.model = { provider: modelKey.slice(0, separator), model: modelKey.slice(separator + 1) }
          }
        }
        fetch('/dsh-prompt-assistant/chat', {
          method: 'POST',
          headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((response) => response.json().then((body) => ({ response, body })))
          .then(({ response, body }) => {
            if (!response.ok || !body || body.ok !== true) {
              const message = body && body.error && body.error.message ? body.error.message : 'HTTP ' + response.status
              throw new Error(message)
            }
            setResult((current) => (current
              ? { ...current, result: body.result, spec: body.spec || current.spec, durationMs: body.durationMs }
              : current))
            setChat((current) => current.concat({ role: 'assistant', text: body.reply || '（结果已更新）' }))
          })
          .catch((err) => setChatError(String((err && err.message) || err)))
          .finally(() => setChatBusy(false))
      }

      function onKeyDown(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
          event.preventDefault()
          onSubmit()
        }
      }

      const modelOptions = []
      const visionByModel = {}
      if (info && Array.isArray(info.providers)) {
        for (const provider of info.providers) {
          for (const model of provider.models || []) {
            const value = provider.id + '|' + model.id
            visionByModel[value] = model.vision
            modelOptions.push({
              value,
              label: provider.name + ' / ' + model.name + (model.vision === false ? '（不支持图片）' : ''),
            })
          }
        }
      }
      if (modelKey && info && info.default && info.default.model) {
        const known = modelOptions.some((option) => option.value === modelKey)
        if (!known) {
          modelOptions.unshift({
            value: modelKey,
            label: (info.default.provider || 'default') + ' / ' + info.default.model,
          })
        }
      }

      const sourcePath = info && info.promptSources ? info.promptSources[mode] : ''
      const sourceLine = mode === 'model'
        ? ''
        : sourcePath
          ? '提示词：' + shortPath(sourcePath)
          : ''
      const specItems = info && info.models && Array.isArray(info.models.items) ? info.models.items : []
      const sourceTitle = mode === 'model'
        ? (info && info.models && info.models.specDir ? info.models.specDir : '')
        : sourcePath || ''
      const placeholder = mode === 't2i'
        ? '例：做一张竖版海报，一个女孩站在海边，标题写「夏日特惠」，整体清爽一点。'
        : mode === 'model'
          ? '例：moss: 生成一个女孩穿着洛丽塔，手拿哥特伞。'
          : '例：把背景换成夜晚的东京街头，人物、衣服和表情都不要变。'

      const output = result ? (result.mode === 'model' ? modelResultView(result) : resultView(result)) : null

      return h(
        'div',
        { className: 'dshpa-root' },
        h('style', null, CSS),
        h(
          'div',
          { className: 'dshpa-head' },
          h(
            'div',
            { className: 'dshpa-head-main' },
            h('div', { className: 'dshpa-title' }, '提示词助手'),
            h('div', { className: 'dshpa-sub' }, '一句中文描述，改写成可直接用的结构化提示词。'),
          ),
          h(
            'div',
            { className: 'dshpa-head-right', ref: specRef },
            h(
              'div',
              { className: 'dshpa-model-row' },
              modelOptions.length
                ? h(
                    'select',
                    {
                      className: 'dshpa-select',
                      value: modelKey,
                      onChange: (event) => setModelKey(event.target.value),
                      'aria-label': '模型',
                    },
                    modelOptions.map((option) => h('option', { key: option.value, value: option.value }, option.label)),
                  )
                : info && info.default && info.default.model
                  ? h('div', { className: 'dshpa-hint' }, info.default.provider + ' / ' + info.default.model)
                  : null,
              h('button', {
                type: 'button',
                className: 'dshpa-btn',
                style: { padding: '4px 9px', fontSize: '12px' },
                title: '重新读取模型列表：新加的本地模型不用重启',
                onClick: () => loadInfo(true),
              }, '↻'),
            ),
            mode === 'model' && specItems.length
              ? h(
                  'div',
                  { className: 'dshpa-spec-wrap' },
                  h('button', {
                    type: 'button',
                    className: 'dshpa-spec-toggle',
                    'aria-expanded': specOpen,
                    onClick: () => setSpecOpen((open) => !open),
                  }, '规范库：' + specItems.length + ' 个模型 ' + (specOpen ? '▴' : '▾')),
                  specOpen
                    ? h(
                        'div',
                        { className: 'dshpa-spec-pop', role: 'list' },
                        h('div', { className: 'dshpa-spec-tip' }, '点一个填进输入框，接着写冒号后面的中文描述'),
                        specItems.map((item) => h(
                          'button',
                          {
                            type: 'button',
                            key: item.slug,
                            className: 'dshpa-spec-item',
                            role: 'listitem',
                            title: item.style || (item.aliases || []).join(', '),
                            onClick: () => {
                              setText(item.name + ': ')
                              setSpecOpen(false)
                              if (textArea.current) textArea.current.focus()
                            },
                          },
                          h('span', { className: 'dshpa-spec-name' }, item.name),
                          h('span', { className: 'dshpa-spec-meta' }, [
                            item.type,
                            item.source === 'learned' ? '联网' : item.source === 'file' ? '外挂' : '',
                          ].filter(Boolean).join(' · ')),
                        )),
                      )
                    : null,
                )
              : sourceLine
                ? h('div', { className: 'dshpa-hint', title: sourceTitle }, sourceLine)
                : null,
          ),
        ),
        h(
          'div',
          { className: 'dshpa-body' },
          h(
            'div',
            { className: 'dshpa-col dshpa-col-input' },
            h(
              'div',
              { className: 'dshpa-modes', role: 'tablist' },
              h('button', {
                type: 'button',
                className: 'dshpa-mode',
                'data-active': mode === 't2i',
                role: 'tab',
                'aria-selected': mode === 't2i',
                onClick: () => {
                  setMode('t2i')
                  setError('')
                },
              }, '文生图'),
              h('button', {
                type: 'button',
                className: 'dshpa-mode',
                'data-active': mode === 'edit',
                role: 'tab',
                'aria-selected': mode === 'edit',
                onClick: () => {
                  setMode('edit')
                  setError('')
                },
              }, '图像编辑'),
              h('button', {
                type: 'button',
                className: 'dshpa-mode',
                'data-active': mode === 'model',
                role: 'tab',
                'aria-selected': mode === 'model',
                onClick: () => {
                  setMode('model')
                  setError('')
                },
              }, '模型提示词'),
            ),
            h('div', { className: 'dshpa-hint' }, mode === 't2i'
              ? (images.length
                  ? '输出：一段英文画面描述 + 画幅；已加 ' + images.length + ' 张参考图'
                  : '输出：一段英文画面描述 + 画幅比例；可放参考图')
              : mode === 'model'
                ? '格式：模型名: 中文描述（moss / anima / h3 …）；英文提示词 + 中文翻译'
                  + (images.length ? '；已加 ' + images.length + ' 张参考图' : '；可放参考图')
                : images.length
                  ? '输出：一条编辑指令 + 画幅；已加 ' + images.length + ' 张输入图'
                  : '输出：一条编辑指令 + 画幅；需要先放输入图，张数不限'),
            h('textarea', {
              ref: textArea,
              className: 'dshpa-input',
              value: text,
              placeholder,
              onChange: (event) => setText(event.target.value),
              onKeyDown,
              onPaste,
              spellCheck: false,
            }),
            h(
              'div',
              {
                className: 'dshpa-files',
                onDragOver: (event) => {
                  event.preventDefault()
                  setDragging(true)
                },
                onDragLeave: () => setDragging(false),
                onDrop,
                style: dragging ? { outline: '2px dashed var(--dsw-alias-brand-primary)', outlineOffset: 4, borderRadius: 10 } : undefined,
              },
              images.map((image) => h(
                'div',
                { className: 'dshpa-file', key: image.id, title: image.name },
                h('img', { src: image.data, alt: image.name }),
                h('button', {
                  type: 'button',
                  className: 'dshpa-file-x',
                  'aria-label': '移除 ' + image.name,
                  onClick: () => setImages((current) => current.filter((item) => item.id !== image.id)),
                }, '×'),
              )),
              h('button', {
                type: 'button',
                className: 'dshpa-btn',
                style: { height: 64, width: 64, padding: 0, fontSize: 20, color: 'var(--dsw-alias-label-secondary)' },
                onClick: () => fileInput.current && fileInput.current.click(),
                title: mode === 'edit' ? '添加要改的图（也可以拖进来或直接粘贴）' : '添加参考图（也可以拖进来或直接粘贴）',
              }, '+'),
            ),
            h('input', {
              ref: fileInput,
              type: 'file',
              accept: 'image/*',
              multiple: true,
              style: { display: 'none' },
              onChange: (event) => {
                addFiles(event.target.files)
                event.target.value = ''
              },
            }),
            h(
              'div',
              { className: 'dshpa-tools' },
              busy
                ? h('span', { className: 'dshpa-hint' }, '生成中，通常 10–40 秒…')
                : h('span', { className: 'dshpa-hint' }, 'Ctrl / ⌘ + Enter 提交'),
              h('button', {
                type: 'button',
                className: 'dshpa-btn dshpa-primary',
                disabled: busy,
                onClick: onSubmit,
              }, busy ? h('span', null, h('span', { className: 'dshpa-spin' }), '生成中') : '生成提示词'),
            ),
            error ? h('div', { className: 'dshpa-error', role: 'alert' }, error) : null,
          ),
          h(
            'div',
            { className: 'dshpa-col dshpa-col-output' },
            output || h(
              'div',
              { className: 'dshpa-empty' },
              h('div', { style: { fontSize: 22, opacity: 0.5 } }, '✧'),
              h('div', null, '左边写一句描述，点「生成提示词」。'),
              h('div', null, '结果按字段拆开，单独复制或一键复制整段 JSON。'),
            ),
            result
              ? h(
                  'div',
                  { className: 'dshpa-chat' },
                  h(
                    'div',
                    { className: 'dshpa-chat-head' },
                    h('b', null, '对话调整'),
                    h('span', null, '说改哪儿，或者直接问'),
                  ),
                  h(
                    'div',
                    { className: 'dshpa-chat-log', ref: chatLog },
                    chat.length === 0
                      ? h('div', { className: 'dshpa-chat-empty' }, '例：「背景换成夜晚」「再短一点」「翻译改口语一点」「这个模型支持中文吗」')
                      : chat.map((item, index) => h(
                          'div',
                          {
                            key: index,
                            className: 'dshpa-bubble',
                            'data-role': item.role === 'assistant' ? 'assistant' : 'user',
                          },
                          item.text,
                        )),
                    chatBusy ? h('div', { className: 'dshpa-bubble', 'data-role': 'assistant' }, '思考中…') : null,
                  ),
                  chatError ? h('div', { className: 'dshpa-error', style: { margin: '0 10px 8px' }, role: 'alert' }, chatError) : null,
                  h(
                    'div',
                    { className: 'dshpa-chat-row' },
                    h('textarea', {
                      className: 'dshpa-chat-input',
                      value: chatInput,
                      placeholder: '说一句想改的，Enter 发送，Shift+Enter 换行',
                      onChange: (event) => setChatInput(event.target.value),
                      onKeyDown: (event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          sendChat()
                        }
                      },
                      spellCheck: false,
                    }),
                    h('button', {
                      type: 'button',
                      className: 'dshpa-btn dshpa-primary',
                      disabled: chatBusy || !chatInput.trim(),
                      onClick: sendChat,
                    }, chatBusy ? '发送中' : '发送'),
                  ),
                )
              : null,
          ),
        ),
      )
    }

    function shortPath(path) {
      const parts = String(path).split(/[\\/]/)
      return parts.slice(-2).join('/')
    }

    function fieldCard(title, value, copyLabel) {
      return h(
        'div',
        { className: 'dshpa-card' },
        h(
          'div',
          { className: 'dshpa-card-head' },
          h('span', { className: 'dshpa-card-title' }, title),
          h(CopyButton, { value, label: copyLabel }),
        ),
        h('pre', { className: 'dshpa-prose' }, value),
      )
    }

    function jsonCard(pretty, oneLine) {
      return h(
        'div',
        { className: 'dshpa-card' },
        h(
          'div',
          { className: 'dshpa-card-head' },
          h('span', { className: 'dshpa-card-title' }, 'JSON'),
          h(CopyButton, { value: oneLine, label: '复制一行' }),
          h(CopyButton, { value: pretty, label: '复制多行' }),
        ),
        h('pre', { className: 'dshpa-mono' }, pretty),
      )
    }

    const SPEC_LABELS = {
      local: '本地规范',
      learned: '已记住（联网查的）',
      generic: '通用规范',
      unknown: '联网查的',
    }

    function modelResultView(body) {
      const result = body.result || {}
      const spec = body.spec || {}
      const payload = {
        prompt: result.prompt,
        translation: result.translation,
        negative: result.negative,
        params: result.params,
      }
      const pretty = JSON.stringify(payload, null, 2)
      const oneLine = JSON.stringify(payload)
      return h(
        'div',
        { className: 'dshpa-out' },
        h(
          'div',
          { className: 'dshpa-meta' },
          spec.alias ? h('span', null, spec.alias) : null,
          h('span', null, SPEC_LABELS[spec.source] || '规范来源未知'),
          Number.isFinite(body.durationMs) ? h('span', null, (body.durationMs / 1000).toFixed(1) + ' s') : null,
          spec.path ? h('span', { title: spec.path }, shortPath(spec.path)) : null,
        ),
        spec.lookupUrls && spec.lookupUrls.length
          ? h(
              'div',
              { className: 'dshpa-hint', style: { marginBottom: 10, wordBreak: 'break-all' } },
              '参考：' + spec.lookupUrls.join('   '),
            )
          : null,
        fieldCard('PROMPT', result.prompt, '复制提示词'),
        result.translation ? fieldCard('中文翻译', result.translation, '复制翻译') : null,
        result.negative ? fieldCard('NEGATIVE', result.negative, '复制负面词') : null,
        result.params ? fieldCard('PARAMS', result.params, '复制参数') : null,
        result.note ? h('div', { className: 'dshpa-hint', style: { marginBottom: 12 } }, '说明：' + result.note) : null,
        jsonCard(pretty, oneLine),
      )
    }

    function resultView(body) {
      const result = body.result || {}
      const isEdit = body.mode === 'edit'
      const payload = isEdit
        ? { rewritten_prompt: result.rewritten_prompt, wh_ratio: result.wh_ratio, ratio_follow: result.ratio_follow }
        : { rewritten_prompt: result.rewritten_prompt, wh_ratio: result.wh_ratio }
      const pretty = JSON.stringify(payload, null, 2)
      const oneLine = JSON.stringify(payload)
      const chips = []
      if (result.wh_ratio) chips.push({ label: '画幅', value: result.wh_ratio })
      if (isEdit && result.ratio_follow) chips.push({ label: '跟随', value: result.ratio_follow })
      return h(
        'div',
        { className: 'dshpa-out' },
        h(
          'div',
          { className: 'dshpa-meta' },
          body.model ? h('span', null, body.model.provider + ' / ' + body.model.model) : null,
          Number.isFinite(body.durationMs) ? h('span', null, (body.durationMs / 1000).toFixed(1) + ' s') : null,
          body.promptPath ? h('span', { title: body.promptPath }, shortPath(body.promptPath)) : null,
        ),
        chips.length
          ? h(
              'div',
              { className: 'dshpa-chips' },
              chips.map((chip) => h('span', { className: 'dshpa-chip', key: chip.label }, h('span', null, chip.label), h('b', null, chip.value))),
            )
          : null,
        h(
          'div',
          { className: 'dshpa-card' },
          h(
            'div',
            { className: 'dshpa-card-head' },
            h('span', { className: 'dshpa-card-title' }, 'rewritten_prompt'),
            h(CopyButton, { value: result.rewritten_prompt, label: '复制这一段' }),
          ),
          h('pre', { className: 'dshpa-prose' }, result.rewritten_prompt),
        ),
        h(
          'div',
          { className: 'dshpa-card' },
          h(
            'div',
            { className: 'dshpa-card-head' },
            h('span', { className: 'dshpa-card-title' }, 'JSON'),
            h(CopyButton, { value: oneLine, label: '复制一行' }),
            h(CopyButton, { value: pretty, label: '复制多行' }),
          ),
          h('pre', { className: 'dshpa-mono' }, pretty),
        ),
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register(
          { name: 'sidebar.panellist', id: 'prompt-assistant', order: 30, label: () => '提示词助手' },
          PanelIcon,
        ))
        ctx.slots.inject('main', () => ctx.slots.register(
          { name: 'main', key: 'prompt-assistant' },
          PromptAssistantPage,
        ))
      },
    }
  },
})
