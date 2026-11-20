/**
 * Browser half of the request cost meter.
 *
 * A chip under each completed answer shows what that Turn cost in yuan, priced
 * from the provider-reported usage already stored in the session log. The chip
 * is a Chat row contributed through the Conversation registry, so the host lays
 * it out with the rest of the transcript; the module reads only the durable
 * session events and contacts no network endpoint.
 */
window.__ModuleLoader__.load({
  id: '@local/dsh-request-cost',
  factory(require) {
    const React = require('react')
    const { createPortal } = require('react-dom')
    const h = React.createElement

    /**
     * Dictionaries for every shipped Web language. `en` and `zh` are the
     * required baseline pair; other languages fall back to English for any
     * key they omit.
     */
    const DICTIONARIES = {
      en: {
        'entry.label': 'Request cost',
        'pill.head': '~{at}',
        'pill.request': 'per request {total}',
        'pill.requestPartial': 'per request {total}+ ({count} unpriced)',
        'pill.session': 'session {total}',
        'pill.sessionPartial': 'session {total}+ ({count} unpriced)',
        'pill.unpriced': 'price unknown',
        'panel.title': 'Request cost',
        'panel.estimate': 'Estimated from token usage; the bill is on the platform.',
        'panel.last': 'Last request',
        'panel.lastTokens': 'Last request, tokens',
        'panel.total': 'Per request',
        'panel.session': 'Whole session',
        'panel.requests': 'Priced requests',
        'panel.input': 'Input, cache miss',
        'panel.cacheRead': 'Cached input',
        'panel.cacheWrite': 'Cache write',
        'panel.output': 'Output',
        'panel.partialNote': '{count} response(s) are not in the price list and are counted as unknown, not as free.',
        'panel.note': 'Source: {source}',
        'panel.pricesBuiltin': 'built-in list, check it against the provider price page',
      },
      zh: {
        'entry.label': '请求费用',
        'pill.head': '~{at}',
        'pill.request': '本次请求 {total}',
        'pill.requestPartial': '本次请求 {total}+（{count} 个未计价）',
        'pill.session': '本次会话 {total}',
        'pill.sessionPartial': '本次会话 {total}+（{count} 个未计价）',
        'pill.unpriced': '价格未知',
        'panel.title': '请求费用',
        'panel.estimate': '按 token 用量估算，实际账单以平台为准。',
        'panel.last': '最近一次请求',
        'panel.lastTokens': '最近一次请求的 token',
        'panel.total': '本次请求',
        'panel.session': '整个会话',
        'panel.requests': '已计价请求',
        'panel.input': '输入（缓存未命中）',
        'panel.cacheRead': '缓存输入',
        'panel.cacheWrite': '缓存写入',
        'panel.output': '输出',
        'panel.partialNote': '有 {count} 个响应用于不在价目中，按未知处理，而不是免费。',
        'panel.note': '来源：{source}',
        'panel.pricesBuiltin': '内置价目，请对照服务商价格页核对',
      },
    }

    DICTIONARIES.ru = {
      'entry.label': 'Стоимость запросов',
      'pill.head': '~{at}',
      'pill.request': 'за запрос {total}',
      'pill.requestPartial': 'за запрос {total}+ ({count} без цены)',
      'pill.session': 'по сессии {total}',
      'pill.sessionPartial': 'по сессии {total}+ ({count} без цены)',
      'pill.unpriced': 'цена неизвестна',
      'panel.title': 'Стоимость запросов',
      'panel.estimate': 'Оценка по токенам, списание считает платформа.',
      'panel.last': 'Последний ответ',
      'panel.lastTokens': 'Токенов в последнем ответе',
      'panel.total': 'За запрос',
      'panel.session': 'За сессию',
      'panel.requests': 'Тарифицировано ответов',
      'panel.input': 'Вход (без кеша)',
      'panel.cacheRead': 'Вход из кеша',
      'panel.cacheWrite': 'Запись в кеш',
      'panel.output': 'Вывод',
      'panel.partialNote': '{count} ответ(ов) нет в прайсе: считаются неизвестными, а не бесплатными.',
      'panel.note': 'Источник: {source}.',
      'panel.pricesBuiltin': 'встроенный прайс, сверьте со страницей цен провайдера',
    }

    DICTIONARIES.de = {
      'entry.label': 'Anfragekosten',
      'pill.head': '~{at}',
      'pill.request': 'pro Anfrage {total}',
      'pill.requestPartial': 'pro Anfrage {total}+ ({count} ohne Preis)',
      'pill.session': 'Sitzung {total}',
      'pill.sessionPartial': 'Sitzung {total}+ ({count} ohne Preis)',
      'pill.unpriced': 'Preis unbekannt',
      'panel.title': 'Anfragekosten',
      'panel.estimate': 'Schätzung aus der Token-Nutzung; die Abrechnung erfolgt auf der Plattform.',
      'panel.last': 'Letzte Antwort',
      'panel.lastTokens': 'Tokens der letzten Antwort',
      'panel.total': 'Pro Anfrage',
      'panel.session': 'Ganze Sitzung',
      'panel.requests': 'Bepreiste Antworten',
      'panel.input': 'Eingabe (ohne Cache)',
      'panel.cacheRead': 'Eingabe aus dem Cache',
      'panel.cacheWrite': 'Cache-Schreiben',
      'panel.output': 'Ausgabe',
      'panel.partialNote': '{count} Antwort(en) fehlen in der Preisliste und gelten als unbekannt, nicht als kostenlos.',
      'panel.note': 'Quelle: {source}.',
      'panel.pricesBuiltin': 'eingebaute Preise, bitte mit der Preisseite des Anbieters abgleichen',
    }

    DICTIONARIES.es = {
      'entry.label': 'Coste de solicitudes',
      'pill.head': '~{at}',
      'pill.request': 'por solicitud {total}',
      'pill.requestPartial': 'por solicitud {total}+ ({count} sin precio)',
      'pill.session': 'sesión {total}',
      'pill.sessionPartial': 'sesión {total}+ ({count} sin precio)',
      'pill.unpriced': 'precio desconocido',
      'panel.title': 'Coste de solicitudes',
      'panel.estimate': 'Estimación según el uso de tokens; la factura la calcula la plataforma.',
      'panel.last': 'Última respuesta',
      'panel.lastTokens': 'Tokens de la última respuesta',
      'panel.total': 'Por solicitud',
      'panel.session': 'Toda la sesión',
      'panel.requests': 'Respuestas con precio',
      'panel.input': 'Entrada (sin caché)',
      'panel.cacheRead': 'Entrada desde caché',
      'panel.cacheWrite': 'Escritura en caché',
      'panel.output': 'Salida',
      'panel.partialNote': '{count} respuesta(s) no están en la lista de precios y cuentan como desconocidas, no como gratuitas.',
      'panel.note': 'Fuente: {source}.',
      'panel.pricesBuiltin': 'lista integrada, verifíquela en la página de precios del proveedor',
    }

    DICTIONARIES.fr = {
      'entry.label': 'Coût des requêtes',
      'pill.head': '~{at}',
      'pill.request': 'par requête {total}',
      'pill.requestPartial': 'par requête {total}+ ({count} sans prix)',
      'pill.session': 'session {total}',
      'pill.sessionPartial': 'session {total}+ ({count} sans prix)',
      'pill.unpriced': 'prix inconnu',
      'panel.title': 'Coût des requêtes',
      'panel.estimate': 'Estimation d’après les tokens ; la facturation est faite par la plateforme.',
      'panel.last': 'Dernière réponse',
      'panel.lastTokens': 'Tokens de la dernière réponse',
      'panel.total': 'Par requête',
      'panel.session': 'Toute la session',
      'panel.requests': 'Réponses tarifées',
      'panel.input': 'Entrée (hors cache)',
      'panel.cacheRead': 'Entrée depuis le cache',
      'panel.cacheWrite': 'Écriture du cache',
      'panel.output': 'Sortie',
      'panel.partialNote': '{count} réponse(s) absentes de la grille tarifaire comptent comme inconnues, pas comme gratuites.',
      'panel.note': 'Source : {source}.',
      'panel.pricesBuiltin': 'grille intégrée, à vérifier sur la page des tarifs du fournisseur',
    }

    DICTIONARIES.ja = {
      'entry.label': 'リクエスト料金',
      'pill.head': '~{at}',
      'pill.request': '今回のリクエスト {total}',
      'pill.requestPartial': '今回のリクエスト {total}+（{count} 件は価格不明）',
      'pill.session': 'セッション {total}',
      'pill.sessionPartial': 'セッション {total}+（{count} 件は価格不明）',
      'pill.unpriced': '価格不明',
      'panel.title': 'リクエスト料金',
      'panel.estimate': 'トークン使用量からの概算です。請求はプラットフォーム側で確定します。',
      'panel.last': '直前のレスポンス',
      'panel.lastTokens': '直前のレスポンスのトークン',
      'panel.total': '今回のリクエスト',
      'panel.session': 'セッション全体',
      'panel.requests': '料金を計算したレスポンス',
      'panel.input': '入力（キャッシュ未使用）',
      'panel.cacheRead': 'キャッシュからの入力',
      'panel.cacheWrite': 'キャッシュ書き込み',
      'panel.output': '出力',
      'panel.partialNote': '{count} 件のレスポンスは価格表にないため、無料ではなく価格不明として扱います。',
      'panel.note': '出典：{source}。',
      'panel.pricesBuiltin': '組み込みの価格表（プロバイダーの価格ページで確認してください）',
    }

    DICTIONARIES.pt = {
      'entry.label': 'Custo das requisições',
      'pill.head': '~{at}',
      'pill.request': 'por requisição {total}',
      'pill.requestPartial': 'por requisição {total}+ ({count} sem preço)',
      'pill.session': 'sessão {total}',
      'pill.sessionPartial': 'sessão {total}+ ({count} sem preço)',
      'pill.unpriced': 'preço desconhecido',
      'panel.title': 'Custo das requisições',
      'panel.estimate': 'Estimativa pelo uso de tokens; a cobrança é calculada pela plataforma.',
      'panel.last': 'Última resposta',
      'panel.lastTokens': 'Tokens da última resposta',
      'panel.total': 'Por requisição',
      'panel.session': 'Sessão inteira',
      'panel.requests': 'Respostas com preço',
      'panel.input': 'Entrada (sem cache)',
      'panel.cacheRead': 'Entrada do cache',
      'panel.cacheWrite': 'Gravação no cache',
      'panel.output': 'Saída',
      'panel.partialNote': '{count} resposta(s) não estão na lista de preços e contam como desconhecidas, não como gratuitas.',
      'panel.note': 'Fonte: {source}.',
      'panel.pricesBuiltin': 'lista embutida, confira na página de preços do provedor',
    }

    const NS = 'requestCost2'

    /**
     * Built-in price list, yuan per one million tokens, taken from the
     * provider price page. The provider's cache-miss input price applies to
     * both uncached input and cache write. A model missing here is shown as
     * unpriced, never as free.
     */
    const PRICES = {
      'deepseek-flash': { input: 1, cacheRead: 0.02, cacheWrite: 1, output: 2 },
      'deepseek-v4-pro': { input: 3, cacheRead: 0.06, cacheWrite: 3, output: 6 },
    }

    /**
     * Online CNY→RUB reference rate: one request to a public converter, cached
     * for six hours. When it fails the chip shows yuan only.
     */
    const FX_URL = 'https://open.er-api.com/v6/latest/CNY'
    const FX_TTL_MS = 6 * 60 * 60 * 1000
    const fx = { rate: undefined, updated: 0, fetching: false }
    const fxListeners = new Set()

    function fxSubscribe(listener) {
      fxListeners.add(listener)
      return () => { fxListeners.delete(listener) }
    }

    function fxPublish() {
      for (const listener of fxListeners) {
        try {
          listener()
        } catch {
          // A failing listener must not break the others.
        }
      }
    }

    /** Load the rate once per TTL; a failure leaves yuan-only rendering. */
    function loadFx() {
      if (fx.fetching) return
      if (fx.rate !== undefined && Date.now() - fx.updated < FX_TTL_MS) return
      if (typeof fetch !== 'function') return
      fx.fetching = true
      const timeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(8000)
        : undefined
      fetch(FX_URL, { cache: 'no-store', credentials: 'omit', signal: timeout })
        .then(response => (response.ok ? response.json() : undefined))
        .then((body) => {
          const rate = body && body.rates ? body.rates.RUB : undefined
          // A plausible reference rate only; anything else keeps the old value.
          if (typeof rate === 'number' && Number.isFinite(rate) && rate > 0.5 && rate < 1000) {
            fx.rate = rate
            fx.updated = Date.now()
            fxPublish()
          }
        })
        .catch(() => {})
        .finally(() => { fx.fetching = false })
    }

    /** Subscribe a component to the rate arriving or refreshing. */
    function useRubRate() {
      const [rate, setRate] = React.useState(fx.rate)
      React.useEffect(() => {
        if (fx.rate !== undefined && Date.now() - fx.updated < FX_TTL_MS) return undefined
        loadFx()
        return fxSubscribe(() => setRate(fx.rate))
      }, [])
      return rate
    }

    /** Ruble reading of a yuan amount under the reference rate. */
    function formatRub(yuan, rate, locale) {
      if (rate === undefined || !Number.isFinite(yuan) || yuan <= 0) return ''
      const rub = yuan * rate
      const digits = rub >= 1 ? 2 : Math.min(6, Math.max(2, 3 - Math.floor(Math.log10(rub))))
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: 'RUB',
          currencyDisplay: 'narrowSymbol',
          minimumFractionDigits: 2,
          maximumFractionDigits: digits,
        }).format(rub)
      } catch {
        return '₽' + rub.toFixed(digits)
      }
    }

    /** "1 ¥ = 12.36 ₽", the reference the chip used. */
    function fxLine(rate, locale) {
      try {
        return '1 ¥ = ' + new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        }).format(rate) + ' ₽'
      } catch {
        return '1 ¥ = ' + rate.toFixed(2) + ' ₽'
      }
    }

    /* ── pricing ──────────────────────────────────────────────────────── */

    /**
     * Resolve the price of one provider/model route: the exact model id, then
     * `provider/model`. A route with no entry has an unknown price.
     */
    function priceOf(route) {
      if (route === null || typeof route !== 'object') return undefined
      const model = route.model
      if (typeof model !== 'string' || model === '') return undefined
      if (Object.prototype.hasOwnProperty.call(PRICES, model)) return PRICES[model]
      const provider = route.provider
      if (typeof provider !== 'string') return undefined
      const qualified = provider + '/' + model
      return Object.prototype.hasOwnProperty.call(PRICES, qualified) ? PRICES[qualified] : undefined
    }

    /* ── usage accounting ─────────────────────────────────────────────── */

    function isCount(value) {
      return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
    }

    /** Disjoint provider buckets of one response: uncached prompt, cache read, cache write, output. */
    function bucketsOf(usage) {
      if (usage === null || typeof usage !== 'object') return undefined
      if (!isCount(usage.inputTokens) || !isCount(usage.outputTokens)) return undefined
      const read = usage.cacheReadTokens
      const write = usage.cacheWriteTokens
      if (read !== undefined && !isCount(read)) return undefined
      if (write !== undefined && !isCount(write)) return undefined
      return { input: usage.inputTokens, cacheRead: read || 0, cacheWrite: write || 0, output: usage.outputTokens }
    }

    /** Yuan for one response, or undefined when its usage or price is unknown. */
    /**
     * Route of one `assistant/message` payload. The durable event nests the
     * assistant message under `message` and keeps the attribution in its
     * `source`; a bare `source` is accepted for already-projected rows.
     * @param payload - `assistant/message` event data.
     * @returns the provider/model pair, or undefined when unattributed.
     */
    function routeOf(payload) {
      if (payload === null || typeof payload !== 'object') return undefined
      const message = payload.message !== null && typeof payload.message === 'object' ? payload.message : undefined
      const source = (message !== undefined && message.source) || payload.source
      return source !== null && typeof source === 'object' ? source : undefined
    }

    function costOf(buckets, price) {
      if (buckets === undefined || price === undefined) return undefined
      return (buckets.input * price.input
        + buckets.cacheRead * price.cacheRead
        + buckets.cacheWrite * price.cacheWrite
        + buckets.output * price.output) / 1_000_000
    }

    /**
     * Price the latest reported response and the whole session from every
     * `assistant/message` in the log.
     * @param messages - `assistant/message` event data objects, oldest first.
     * @returns `at` (the newest response reporting usage; `cost` is absent when
     * its price is unknown) and `total` (every priced response).
     */
    function summarize(messages) {
      let at
      const tokens = { input: 0, cacheRead: 0, cacheWrite: 0, output: 0 }
      let cost = 0
      let priced = 0
      let unpriced = 0
      for (let index = 0; index < messages.length; index += 1) {
        const message = messages[index]
        const buckets = bucketsOf(message.usage)
        if (buckets === undefined) continue
        const yuan = costOf(buckets, priceOf(routeOf(message)))
        if (yuan === undefined) {
          unpriced += 1
          at = { tokens: buckets }
          continue
        }
        cost += yuan
        priced += 1
        tokens.input += buckets.input
        tokens.cacheRead += buckets.cacheRead
        tokens.cacheWrite += buckets.cacheWrite
        tokens.output += buckets.output
        at = { cost: yuan, tokens: buckets }
      }
      return {
        at,
        total: { cost, tokens, priced, unpriced },
      }
    }

    /* ── presentation ─────────────────────────────────────────────────── */

    /**
     * Yuan with at least two decimals and at least three significant digits.
     * No rounding towards zero: a fraction of a fen shows its digits instead
     * of a misleading `<¥0.0001`.
     */
    function formatYuan(value) {
      if (!Number.isFinite(value)) return '—'
      if (value <= 0) return '¥0.00'
      if (value >= 10) return '¥' + value.toFixed(2)
      if (value >= 1) return '¥' + value.toFixed(3)
      const digits = Math.min(6, Math.max(4, 3 - Math.floor(Math.log10(value))))
      return '¥' + value.toFixed(digits)
    }

    /** Exact integer with thousands groups, like the host's token readings. */
    function formatCount(value) {
      if (!Number.isFinite(value) || value <= 0) return '0'
      return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    /** The latest request's price, or the unknown-price word when it has no entry. */
    function atText(summary, t) {
      return summary.at.cost === undefined ? t('pill.unpriced') : formatYuan(summary.at.cost)
    }

    /** Pill sub-label: the session total and how much of it is unknown. */
    /**
     * Chip sub-label for one scope: the Turn's own price or the whole loaded
     * session, each with the ruble reading when the rate is known.
     * @param summary - priced reading.
     * @param t - locale seat.
     * @param rate - rubles per yuan, or undefined.
     * @param locale - active language id for number formatting.
     * @param scope - 'request' (this Turn) or 'session' (every Turn).
     * @returns the localized label.
     */
    function labelFor(summary, t, rate, locale, scope) {
      const { priced, unpriced, cost } = summary.total
      if (priced === 0) return atText(summary, t)
      const total = withRubles(formatYuan(cost), cost, rate, locale)
      const plain = scope === 'session' ? 'pill.session' : 'pill.request'
      const partial = scope === 'session' ? 'pill.sessionPartial' : 'pill.requestPartial'
      return unpriced > 0 ? t(partial, { total, count: unpriced }) : t(plain, { total })
    }

    /** "¥0.5 ≈ 6.18 ₽" once the rate is known; the yuan text alone otherwise. */
    function withRubles(text, yuan, rate, locale) {
      const rub = formatRub(yuan, rate, locale)
      return rub === '' ? text : text + ' ≈ ' + rub
    }

    const STYLE_ID = 'dsh-request-cost-style2'
    const STYLE = [
      '.dshrc2-pill{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;max-width:100%;min-width:0;',
      'padding:1px 8px;border:none;border-radius:var(--dsw-radius-sm);background:transparent;',
      'color:var(--dsw-alias-label-tertiary);font:inherit;font-variant-numeric:tabular-nums;line-height:inherit;',
      'white-space:nowrap;cursor:pointer}',
      '.dshrc2-glyph{display:inline-block;width:12px;flex:none;text-align:center;font-size:13px;',
      'line-height:1;opacity:.75}',
      '.dshrc2-pill[aria-expanded=true]{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}',
      '@media (hover:hover){.dshrc2-pill:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}}',
      '.dshrc2-head-cost{color:var(--dsw-alias-label-secondary)}',
      '.dshrc2-sub{min-width:0;overflow:hidden;text-overflow:ellipsis;margin-left:6px;color:var(--dsw-alias-label-tertiary)}',
      '.dshrc2-sub::before{content:"·";margin-right:6px;color:var(--dsw-alias-separator-primary)}',
      '.dshrc2-panel{position:fixed;z-index:1100;box-sizing:border-box;width:min(288px,calc(100vw - 24px));padding:12px;',
      'border:0;border-radius:var(--dsw-radius-lg);background:var(--dsw-specific-menu);',
      'backdrop-filter:var(--dsw-menu-backdrop-filter);--dsw-elevation-stroke-color:var(--dsw-alias-border-l1);',
      'box-shadow:var(--dsw-elevation-prominent);font-size:12px;line-height:18px;color:var(--dsw-alias-label-secondary);cursor:default;',
      'max-height:calc(100dvh - 12px - max(12px,var(--dsh-frame-overlay-top,12px)));overflow-y:auto;position-area:none;',
      'top:max(12px,var(--dsh-frame-overlay-top,12px));bottom:max(12px,calc(anchor(top) + 8px));',
      'left:max(12px,anchor(left));right:12px;align-self:end;justify-self:start;height:fit-content;margin:0;',
      'position-try-fallbacks:--dshrc2-window,--dshrc2-opposite,--dshrc2-wide-opposite,--dshrc2-tall,--dshrc2-viewport}',
      '.dshrc2-head{display:flex;justify-content:space-between;gap:16px;color:var(--dsw-alias-label-primary);font-weight:500}',
      '.dshrc2-total{font-variant-numeric:tabular-nums}',
      '.dshrc2-rule{margin:8px 0 10px;border-top:.5px solid var(--dsw-alias-border-l2)}',
      '.dshrc2-list{display:grid;grid-template-columns:minmax(0,auto) minmax(0,1fr);gap:6px 16px;margin:0}',
      '.dshrc2-line{display:contents}',
      '.dshrc2-line dt,.dshrc2-line dd{min-width:0;margin:0}',
      '.dshrc2-line dt{color:var(--dsw-alias-label-tertiary)}',
      '.dshrc2-line dd{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;text-align:right}',
      '.dshrc2-note{margin:10px 0 0;color:var(--dsw-alias-label-tertiary);line-height:16px}',
      '.dshrc2-note+.dshrc2-note{margin-top:4px}',
      // The dock is a centered flex row with a fixed 20px floor; a narrow
      // viewport must wrap the readings instead of squeezing them.
      '.dshrc2-row{display:flex;justify-content:flex-start;margin:2px 0}',
      '.dshrc2-rowSession{margin-top:0}',
      '@position-try --dshrc2-window{position-area:none;top:max(12px,var(--dsh-frame-overlay-top,12px));',
      'bottom:max(12px,calc(anchor(top) + 8px));left:12px;right:12px;margin:0;align-self:safe end;justify-self:safe end}',
      '@position-try --dshrc2-opposite{top:max(12px,calc(anchor(bottom) + 8px));bottom:12px;align-self:start}',
      '@position-try --dshrc2-wide-opposite{top:max(12px,calc(anchor(bottom) + 8px));bottom:12px;left:12px;right:12px;',
      'align-self:start;justify-self:safe end}',
      '@position-try --dshrc2-tall{position-area:none;top:max(12px,var(--dsh-frame-overlay-top,12px));bottom:12px;',
      'left:max(12px,anchor(left));right:12px;margin:0;align-self:safe start;justify-self:start}',
      '@position-try --dshrc2-viewport{position-area:none;inset:max(12px,var(--dsh-frame-overlay-top,12px)) 12px 12px;',
      'margin:0;align-self:safe start;justify-self:safe end}',
    ].join('')

    function injectStyle() {
      if (typeof document === 'undefined') return () => {}
      if (document.getElementById(STYLE_ID) !== null) return () => {}
      const element = document.createElement('style')
      element.id = STYLE_ID
      element.textContent = STYLE
      document.head.appendChild(element)
      return () => { element.remove() }
    }

    /** Leading currency mark of the chip. */
    function PillIcon() {
      return h('span', { className: 'dshrc2-glyph', 'aria-hidden': true }, '\u0024')
    }

    function Row({ label, value }) {
      return h('div', { className: 'dshrc2-line' }, h('dt', null, label), h('dd', null, value))
    }

    function tokensOf(sample) {
      return sample.tokens.input + sample.tokens.cacheRead + sample.tokens.cacheWrite + sample.tokens.output
    }

    function CostPanel({ summary, t, rate, locale, scope }) {
      const tokens = summary.total.tokens
      const requests = formatCount(summary.total.priced)
        + (summary.total.unpriced > 0 ? ' (+' + summary.total.unpriced + ')' : '')
      return h(
        'div',
        { className: 'dshrc2-panel', role: 'dialog', 'aria-label': t('panel.title') },
        h('div', { className: 'dshrc2-head' },
          h('span', null, t('panel.title')),
          h('span', { className: 'dshrc2-total' }, withRubles(formatYuan(summary.total.cost), summary.total.cost, rate, locale))),
        h('div', { className: 'dshrc2-rule', 'aria-hidden': true }),
        h('dl', { className: 'dshrc2-list' },
          h(Row, {
            label: t('panel.last'),
            value: summary.at.cost === undefined
              ? atText(summary, t)
              : withRubles(formatYuan(summary.at.cost), summary.at.cost, rate, locale),
          }),
          h(Row, {
            label: t(scope === 'session' ? 'panel.session' : 'panel.total'),
            value: withRubles(formatYuan(summary.total.cost), summary.total.cost, rate, locale),
          }),
          h(Row, { label: t('panel.lastTokens'), value: formatCount(tokensOf(summary.at)) }),
          h(Row, { label: t('panel.requests'), value: requests }),
          h(Row, { label: t('panel.input'), value: formatCount(tokens.input) }),
          h(Row, { label: t('panel.cacheRead'), value: formatCount(tokens.cacheRead) }),
          h(Row, { label: t('panel.cacheWrite'), value: formatCount(tokens.cacheWrite) }),
          h(Row, { label: t('panel.output'), value: formatCount(tokens.output) })),
        h('p', { className: 'dshrc2-note' }, t('panel.note', { source: t('panel.pricesBuiltin') })),
        summary.total.unpriced > 0
          ? h('p', { className: 'dshrc2-note' }, t('panel.partialNote', { count: summary.total.unpriced }))
          : null,
        h('p', { className: 'dshrc2-note' }, t('panel.estimate')),
        rate === undefined ? null : h('p', { className: 'dshrc2-note' }, fxLine(rate, locale)),
      )
    }

    /* ── component ────────────────────────────────────────────────────── */

    /** The visible pill and its click-open breakdown; renders nothing without a priced response. */

    function CostPill({ summary, t, fxLocale, scope = 'request' }) {
      const rate = useRubRate()
      const locale = typeof fxLocale === 'function' ? fxLocale() : undefined
      const [expanded, setExpanded] = React.useState(false)
      const rootRef = React.useRef(null)
      const panelRef = React.useRef(null)
      const anchor = '--dsh-request-cost2-' + React.useId().replaceAll(':', '')
      const available = summary !== null && summary.total.priced > 0

      React.useEffect(() => {
        if (!expanded) return undefined
        const onKeyDown = (event) => {
          if (event.key === 'Escape') setExpanded(false)
        }
        const onClick = (event) => {
          const target = event.target
          if (target instanceof Node
            && !(rootRef.current !== null && rootRef.current.contains(target))
            && !(panelRef.current !== null && panelRef.current.contains(target))) {
            setExpanded(false)
          }
        }
        document.addEventListener('keydown', onKeyDown)
        document.addEventListener('click', onClick, true)
        return () => {
          document.removeEventListener('keydown', onKeyDown)
          document.removeEventListener('click', onClick, true)
        }
      }, [expanded])

      React.useEffect(() => {
        if (!available && expanded) setExpanded(false)
      }, [available, expanded])

      if (!available) return null
      const text = labelFor(summary, t, rate, locale, scope)
      const at = summary.at.cost === undefined
        ? atText(summary, t)
        : withRubles(formatYuan(summary.at.cost), summary.at.cost, rate, locale)
      // The session chip states one figure; the request chip leads with the
      // newest response and names the Turn's total beside it.
      const head = scope === 'session' ? null : t('pill.head', { at })
      return h(
        'span',
        { ref: rootRef, className: 'dshrc2-anchor', style: { anchorName: anchor } },
        h(
          'button',
          {
            type: 'button',
            className: 'dshrc2-pill',
            'aria-haspopup': 'dialog',
            'aria-expanded': expanded,
            'aria-label': text,
            title: text,
            'data-request-cost': String(Math.round(summary.at.cost * 1e6) / 1e6),
            onClick: () => { setExpanded(!expanded) },
          },
          h(PillIcon),
          head === null ? null : h('span', { className: 'dshrc2-head-cost' }, head),
          h('span', { className: 'dshrc2-sub' }, text),
        ),
        expanded && createPortal(
          h('div', { ref: panelRef, style: { positionAnchor: anchor } }, h(CostPanel, { summary, t, rate, locale, scope })),
          document.body,
        ),
      )
    }


    /* ── chat row ─────────────────────────────────────────────────────── */

    const CHAT_KIND = 'request-cost'

    /** Anchor offset placing this row after the host's Turn footer (which uses 0.1). */
    const CHAT_ROW_OFFSET = 0.2

    /** Anchor offset placing the session total below the Turn's cost chip. */
    const SESSION_ROW_OFFSET = 0.3

    /**
     * Conversation Definition for one Chat row per completed Turn. It folds
     * the Turn's own committed events into a priced reading; every event before
     * the Turn end leaves the State reference untouched, so the engine
     * republishes only when the Turn closes.
     */
    const requestCostDefinition = {
      kind: CHAT_KIND,
      target: 'chat',
      match: (event) => {
        if (event.type === 'turn/start') return { id: String(event.data.turn), role: 'start' }
        if (event.type === 'turn/end') return { id: String(event.data.turn), role: 'update' }
        if (event.type === 'assistant/message') return { id: String(event.data.turn), role: 'update' }
        return null
      },
      start: (_context, match) => ({ turn: match.event.data.turn }),
      update: (context) => context.state,
      publication: (match) => (match.event.type === 'turn/end' ? 'immediate' : 'none'),
      buildViewNode: (context) => {
        if (context.start?.event.type !== 'turn/start') return null
        // The Context carries the Turn's committed events, so the row prices
        // exactly what this Turn billed.
        const events = context.matches.map((match) => match.event)
        const messages = []
        for (const event of events) {
          if (event.type === 'assistant/message' && event.data !== null && typeof event.data === 'object') {
            messages.push(event.data)
          }
        }
        const summary = summarize(messages)
        if (summary.total.priced === 0) return null
        // Sort just after the Turn's own footer row: the host anchors that row
        // at `turn/end` + 0.1, so 0.2 keeps this chip directly below it instead
        // of inside the folded process at the top of the Turn.
        // A Match carries only event/role/location: the durable seq lives on the event.
        const endSeq = context.matches[context.matches.length - 1].event.seq
        const anchorSeq = endSeq + CHAT_ROW_OFFSET
        // The engine's own location object: Chat placement reads `location.turn.turn`
        // and the Turn's data store from it, so a hand-built `{ kind, turn: number }`
        // leaves the row without a Turn and the flow parks it at the top.
        const location = turnLocationOf(context)
        if (location === undefined) return null
        return {
          key: context.key,
          kind: CHAT_KIND,
          id: context.id,
          target: 'chat',
          anchorSeq,
          location,
          visibility: 'visible',
          // `turn` keeps the row in its Turn outside the process disclosure; an
          // absent position would fold it into the step run at the Turn's top.
          groupTree: 'turn',
          data: { summary, seq: endSeq },
        }
      },
    }

    /** Second row kind: one running total for the whole loaded session. */
    const SESSION_KIND = 'request-cost-total'

    /**
     * Conversation Definition for the session total. Its identity is constant
     * across Turns, so one Context accumulates every Turn in the loaded window
     * and republishes only when a Turn closes.
     */
    const sessionCostDefinition = {
      kind: SESSION_KIND,
      target: 'chat',
      match: (event) => {
        if (event.type === 'turn/start') return { id: 'session', role: 'start' }
        if (event.type === 'turn/end') return { id: 'session', role: 'update' }
        if (event.type === 'assistant/message') return { id: 'session', role: 'update' }
        return null
      },
      start: () => ({ messages: [] }),
      update: (context, match) => {
        const event = match.event
        // Only a settled response extends the running accounting; every other
        // match keeps the State reference so nothing downstream re-renders.
        if (event.type !== 'assistant/message' || event.data === null || typeof event.data !== 'object') {
          return context.state
        }
        return { messages: [...context.state.messages, event.data] }
      },
      publication: (match) => (match.event.type === 'turn/end' ? 'immediate' : 'none'),
      buildViewNode: (context) => {
        const summary = summarize(context.state.messages)
        if (summary.total.priced === 0) return null
        const last = context.matches[context.matches.length - 1]
        if (last === undefined) return null
        const location = turnLocationOf(context)
        if (location === undefined) return null
        // Below the Turn's own chip: the Turn footer sits at +0.1, its cost chip
        // at +0.2, so the session total reads last.
        const anchorSeq = last.event.seq + SESSION_ROW_OFFSET
        return {
          key: context.key,
          kind: SESSION_KIND,
          id: context.id,
          target: 'chat',
          anchorSeq,
          location,
          visibility: 'visible',
          groupTree: 'turn',
          data: { summary, seq: last.event.seq },
        }
      },
    }

    /**
     * Resolve this Context's Turn location from the engine-owned matches.
     * @param context - latest complete Context.
     * @returns the Turn or Step location, or undefined when none resolved.
     */
    function turnLocationOf(context) {
      for (let index = context.matches.length - 1; index >= 0; index -= 1) {
        const location = context.matches[index].location
        if (location !== undefined && (location.kind === 'turn' || location.kind === 'step')) return location
      }
      const start = context.start === undefined ? undefined : context.start.location
      return start !== undefined && (start.kind === 'turn' || start.kind === 'step') ? start : undefined
    }

    /**
     * Chat row view for both kinds: the Turn's own price and the session total
     * render the same chip with a different label scope.
     */
    function RequestCostRow(props) {
      const data = props.node && props.node.data
      if (data === undefined || data.summary === undefined) return null
      const scope = props.node.kind === SESSION_KIND ? 'session' : 'request'
      return h('div', {
        className: scope === 'session' ? 'dshrc2-row dshrc2-rowSession' : 'dshrc2-row',
        'data-request-cost-row': String(data.seq),
        'data-request-cost-scope': scope,
      }, h(CostPill, { summary: data.summary, t: props.t, fxLocale: props.fxLocale, scope }))
    }

    /* ── client plugin ────────────────────────────────────────────────── */

    return {
      // `uiConversation` is required, not probed: the Chat row registers into the
      // Conversation registry, and a late probe could run before that service is
      // provided, silently dropping the row.
      inject: ['slots', 'locale', 'uiConversation'],
      apply(ctx) {
        // Dictionaries register per language; each registration is an owned
        // effect, so unloading the plugin removes every namespace entry.
        for (const [id, dictionary] of Object.entries(DICTIONARIES)) {
          ctx.effect(() => ctx.locale.register(NS, id, dictionary), 'request-cost: ' + id)
        }
        ctx.effect(() => injectStyle(), 'request-cost: styles')
        ctx.effect(() => { loadFx() }, 'request-cost: reference rate')

        // Chat row under each completed answer: one Conversation Definition
        // plus its renderer in the keyed Chat node slot.
        ctx.effect(() => {
          const disposeTurn = ctx.uiConversation.events.register(requestCostDefinition)
          const disposeSession = ctx.uiConversation.events.register(sessionCostDefinition)
          return () => { disposeTurn(); disposeSession() }
        }, 'request-cost: conversation definitions')
        const injectLocale = () => ({ fxLocale: () => ctx.locale.getSnapshot().active })
        for (const kind of [CHAT_KIND, SESSION_KIND]) {
          ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
            name: 'conversation.chat.node',
            key: kind,
            locale: NS,
            // The ruble figures follow the active language's number format.
            inject: injectLocale,
          }, RequestCostRow))
        }
      },
    }
  },
})
