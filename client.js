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
        'pill.peak': 'peak',
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
        'panel.windowNote': 'Part of the history is not loaded: the total uses the whole log\'s token usage and the {model} price.',
        'panel.note': 'Prices: {source}',
        'panel.pricesBuiltin': 'the DeepSeek pricing page, USD per 1M tokens, peak and off-peak',
        'panel.peak': 'Peak tariff: 01:00-04:00 and 06:00-10:00 UTC on weekdays (Chinese holidays not accounted for).',
        'panel.offPeak': 'Off-peak tariff: half of peak, applied outside the weekday peak windows.',
      },
      zh: {
        'entry.label': '请求费用',
        'pill.head': '~{at}',
        'pill.request': '本次请求 {total}',
        'pill.requestPartial': '本次请求 {total}+（{count} 个未计价）',
        'pill.session': '本次会话 {total}',
        'pill.sessionPartial': '本次会话 {total}+（{count} 个未计价）',
        'pill.peak': '峰时',
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
        'panel.windowNote': '历史未全部加载：总额按完整日志的 token 用量与 {model} 的价格计算。',
        'panel.note': '价格：{source}',
        'panel.pricesBuiltin': 'DeepSeek 价格页，美元/百万 token，峰谷价',
        'panel.peak': '峰时价：工作日 01:00-04:00 与 06:00-10:00 UTC（中国节假日未计入）。',
        'panel.offPeak': '谷时价：峰时窗口之外，为峰时价的一半。',
      },
    }

    DICTIONARIES.ru = {
      'entry.label': 'Стоимость запросов',
      'pill.head': '~{at}',
      'pill.request': 'за запрос {total}',
      'pill.requestPartial': 'за запрос {total}+ ({count} без цены)',
      'pill.session': 'по сессии {total}',
      'pill.sessionPartial': 'по сессии {total}+ ({count} без цены)',
      'pill.peak': 'пик',
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
      'panel.windowNote': 'Часть истории не загружена: итог посчитан по расходу токенов всей сессии и тарифу {model}.',
      'panel.note': 'Цены: {source}.',
      'panel.pricesBuiltin': 'страница цен DeepSeek, доллары за 1 млн токенов, пик и непик',
      'panel.peak': 'Пиковый тариф: 01:00–04:00 и 06:00–10:00 UTC по будням (праздники КНР не учтены).',
      'panel.offPeak': 'Непиковый тариф: вдвое дешевле, вне пиковых окон по будням.',
    }

    DICTIONARIES.de = {
      'entry.label': 'Anfragekosten',
      'pill.head': '~{at}',
      'pill.request': 'pro Anfrage {total}',
      'pill.requestPartial': 'pro Anfrage {total}+ ({count} ohne Preis)',
      'pill.session': 'Sitzung {total}',
      'pill.sessionPartial': 'Sitzung {total}+ ({count} ohne Preis)',
      'pill.peak': 'Peak',
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
      'panel.windowNote': 'Ein Teil des Verlaufs ist nicht geladen: die Summe nutzt den Token-Verbrauch des gesamten Protokolls und den Preis von {model}.',
      'panel.note': 'Preise: {source}.',
      'panel.pricesBuiltin': 'die DeepSeek-Preisseite, USD je 1 Mio. Token, Peak und Off-Peak',
      'panel.peak': 'Peak-Tarif: 01:00–04:00 und 06:00–10:00 UTC an Werktagen (chinesische Feiertage nicht berücksichtigt).',
      'panel.offPeak': 'Off-Peak-Tarif: halber Peak-Preis außerhalb der Peak-Fenster.',
    }

    DICTIONARIES.es = {
      'entry.label': 'Coste de solicitudes',
      'pill.head': '~{at}',
      'pill.request': 'por solicitud {total}',
      'pill.requestPartial': 'por solicitud {total}+ ({count} sin precio)',
      'pill.session': 'sesión {total}',
      'pill.sessionPartial': 'sesión {total}+ ({count} sin precio)',
      'pill.peak': 'pico',
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
      'panel.windowNote': 'Parte del historial no está cargada: el total usa el consumo de tokens del registro completo y el precio de {model}.',
      'panel.note': 'Precios: {source}.',
      'panel.pricesBuiltin': 'la página de precios de DeepSeek, USD por 1 M de tokens, pico y valle',
      'panel.peak': 'Tarifa pico: 01:00-04:00 y 06:00-10:00 UTC en días laborables (festivos chinos no incluidos).',
      'panel.offPeak': 'Tarifa valle: la mitad del pico, fuera de las ventanas de pico.',
    }

    DICTIONARIES.fr = {
      'entry.label': 'Coût des requêtes',
      'pill.head': '~{at}',
      'pill.request': 'par requête {total}',
      'pill.requestPartial': 'par requête {total}+ ({count} sans prix)',
      'pill.session': 'session {total}',
      'pill.sessionPartial': 'session {total}+ ({count} sans prix)',
      'pill.peak': 'plein',
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
      'panel.windowNote': 'Une partie de l’historique n’est pas chargée : le total utilise la consommation de tokens du journal complet et le tarif de {model}.',
      'panel.note': 'Tarifs : {source}.',
      'panel.pricesBuiltin': 'la page des tarifs DeepSeek, USD par million de tokens, heures pleines et creuses',
      'panel.peak': 'Tarif heures pleines : 01:00-04:00 et 06:00-10:00 UTC en semaine (jours fériés chinois non pris en compte).',
      'panel.offPeak': 'Tarif heures creuses : moitié du plein, hors des fenêtres de pointe.',
    }

    DICTIONARIES.ja = {
      'entry.label': 'リクエスト料金',
      'pill.head': '~{at}',
      'pill.request': '今回のリクエスト {total}',
      'pill.requestPartial': '今回のリクエスト {total}+（{count} 件は価格不明）',
      'pill.session': 'セッション {total}',
      'pill.sessionPartial': 'セッション {total}+（{count} 件は価格不明）',
      'pill.peak': 'ピーク',
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
      'panel.windowNote': '履歴の一部が未読み込みです。合計はログ全体のトークン使用量と {model} の料金で計算しています。',
      'panel.note': '料金：{source}。',
      'panel.pricesBuiltin': 'DeepSeek の料金ページ、100 万トークンあたりの米ドル、ピーク／オフピーク',
      'panel.peak': 'ピーク料金：平日 01:00–04:00 と 06:00–10:00 UTC（中国の祝日は考慮していません）。',
      'panel.offPeak': 'オフピーク料金：ピーク時間外は半額。',
    }

    DICTIONARIES.pt = {
      'entry.label': 'Custo das requisições',
      'pill.head': '~{at}',
      'pill.request': 'por requisição {total}',
      'pill.requestPartial': 'por requisição {total}+ ({count} sem preço)',
      'pill.session': 'sessão {total}',
      'pill.sessionPartial': 'sessão {total}+ ({count} sem preço)',
      'pill.peak': 'pico',
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
      'panel.windowNote': 'Parte do histórico não está carregada: o total usa o consumo de tokens do log completo e o preço de {model}.',
      'panel.note': 'Preços: {source}.',
      'panel.pricesBuiltin': 'a página de preços da DeepSeek, USD por 1 milhão de tokens, pico e fora de pico',
      'panel.peak': 'Tarifa de pico: 01:00-04:00 e 06:00-10:00 UTC em dias úteis (feriados chineses não considerados).',
      'panel.offPeak': 'Tarifa fora de pico: metade do pico, fora das janelas de pico.',
    }

    const NS = 'requestCost2'

    /**
     * Prices in US dollars per one million tokens, from
     * https://api-docs.deepseek.com/quick_start/pricing (read 2026-11-20).
     * DeepSeek bills cache writes at the cache-miss input price and has no
     * separate write tariff. Off-peak is half of peak: peak applies 01:00-04:00
     * and 06:00-10:00 UTC, Monday to Friday, excluding Chinese public holidays.
     */
    const PRICES = {
      'deepseek-flash': {
        peak: { input: 0.3, cacheRead: 0.006, cacheWrite: 0.3, output: 1.2 },
        offPeak: { input: 0.15, cacheRead: 0.003, cacheWrite: 0.15, output: 0.6 },
      },
      'deepseek-v4-pro': {
        peak: { input: 1.32, cacheRead: 0.044, cacheWrite: 1.32, output: 3.96 },
        offPeak: { input: 0.66, cacheRead: 0.022, cacheWrite: 0.66, output: 1.98 },
      },
    }

    /**
     * Currency reference rates: one request to a public converter, cached for
     * six hours. Prices come from the provider page in USD, so the chip shows
     * USD and the panel adds rubles and yuan. A failed load leaves USD only.
     */
    const FX_URL = 'https://open.er-api.com/v6/latest/USD'
    const FX_TTL_MS = 6 * 60 * 60 * 1000
    const fx = { rub: undefined, cny: undefined, updated: 0, fetching: false }
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

    /** Load the reference rates once per TTL; a failure keeps the USD reading. */
    function loadFx() {
      if (fx.fetching) return
      if (fx.rub !== undefined && Date.now() - fx.updated < FX_TTL_MS) return
      if (typeof fetch !== 'function') return
      fx.fetching = true
      const timeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(8000)
        : undefined
      fetch(FX_URL, { cache: 'no-store', credentials: 'omit', signal: timeout })
        .then(response => (response.ok ? response.json() : undefined))
        .then((body) => {
          const rates = body && body.rates
          const rub = rates ? rates.RUB : undefined
          const cny = rates ? rates.CNY : undefined
          // Plausible reference rates only; anything else keeps the old values.
          const ok = value => typeof value === 'number' && Number.isFinite(value) && value > 0.0001 && value < 1000
          if (!ok(rub) || !ok(cny)) return
          fx.rub = rub
          fx.cny = cny
          fx.updated = Date.now()
          fxPublish()
        })
        .catch(() => {})
        .finally(() => { fx.fetching = false })
    }

    /** Subscribe a component to the rates arriving or refreshing. */
    function useFxRates() {
      const [rates, setRates] = React.useState({ rub: fx.rub, cny: fx.cny })
      React.useEffect(() => {
        if (fx.rub !== undefined && Date.now() - fx.updated < FX_TTL_MS) return undefined
        loadFx()
        return fxSubscribe(() => setRates({ rub: fx.rub, cny: fx.cny }))
      }, [])
      return rates
    }

    /** Decimals that keep roughly three significant digits on a currency value. */
    function currencyDigits(value) {
      if (!Number.isFinite(value) || value <= 0) return 2
      if (value >= 10) return 2
      if (value >= 1) return 3
      return Math.min(8, Math.max(2, 2 - Math.floor(Math.log10(value))))
    }

    /** One currency amount in the active language's convention. */
    function formatMoney(value, currency, locale) {
      if (!Number.isFinite(value)) return '—'
      const amount = value > 0 ? value : 0
      const digits = currencyDigits(amount)
      try {
        return new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          currencyDisplay: 'narrowSymbol',
          minimumFractionDigits: 2,
          maximumFractionDigits: digits,
        }).format(amount)
      } catch {
        return currency + ' ' + amount.toFixed(digits)
      }
    }

    /** "1 $ = 91.2 ₽", the reference the chip used. */
    function fxLine(rates, locale) {
      if (rates.rub === undefined) return ''
      try {
        return '1 $ = ' + new Intl.NumberFormat(locale, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 4,
        }).format(rates.rub) + ' ₽'
      } catch {
        return '1 $ = ' + rates.rub.toFixed(2) + ' ₽'
      }
    }

    /* ── pricing ──────────────────────────────────────────────────────── */

    /**
     * Whether one moment falls in DeepSeek's peak window: 01:00-04:00 and
     * 06:00-10:00 UTC, Monday to Friday. Chinese public holidays are not in the
     * built-in calendar, so those days read as peak.
     * @param time - response time in epoch milliseconds.
     * @returns whether the peak tariff applied.
     */
    function isPeak(time) {
      if (!Number.isFinite(time)) return false
      const moment = new Date(time)
      const day = moment.getUTCDay()
      if (day === 0 || day === 6) return false
      const hour = moment.getUTCHours()
      return (hour >= 1 && hour < 4) || (hour >= 6 && hour < 10)
    }

    /**
     * Resolve the tariff of one provider/model route: the exact model id, then
     * `provider/model`. A route with no entry has an unknown price.
     * @param route - provider/model pair.
     * @param time - response time in epoch milliseconds; absent reads off-peak.
     * @returns the four per-million-token prices, or undefined.
     */
    function priceOf(route, time) {
      if (route === null || typeof route !== 'object') return undefined
      const model = route.model
      if (typeof model !== 'string' || model === '') return undefined
      let entry = Object.prototype.hasOwnProperty.call(PRICES, model) ? PRICES[model] : undefined
      if (entry === undefined) {
        const provider = route.provider
        const qualified = typeof provider === 'string' ? provider + '/' + model : undefined
        entry = qualified !== undefined && Object.prototype.hasOwnProperty.call(PRICES, qualified)
          ? PRICES[qualified]
          : undefined
      }
      if (entry === undefined) return undefined
      return isPeak(time) ? entry.peak : entry.offPeak
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
     * @param messages - entries `{ usage, source, time }`, oldest first.
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
        const amount = costOf(buckets, priceOf(message.source, message.time))
        if (amount === undefined) {
          unpriced += 1
          at = { tokens: buckets, time: message.time }
          continue
        }
        cost += amount
        priced += 1
        tokens.input += buckets.input
        tokens.cacheRead += buckets.cacheRead
        tokens.cacheWrite += buckets.cacheWrite
        tokens.output += buckets.output
        at = { cost: amount, tokens: buckets, time: message.time, peak: isPeak(message.time) }
      }
      return {
        at,
        total: { cost, tokens, priced, unpriced },
      }
    }

    /* ── presentation ─────────────────────────────────────────────────── */

    /** Exact integer with thousands groups, like the host's token readings. */
    function formatCount(value) {
      if (!Number.isFinite(value) || value <= 0) return '0'
      return String(Math.round(value)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
    }

    /** The latest request's price, or the unknown-price word when it has no entry. */
    function atText(summary, t, rates, locale) {
      return summary.at.cost === undefined
        ? t('pill.unpriced')
        : withRates(formatMoney(summary.at.cost, 'USD', locale), summary.at.cost, rates, locale)
    }

    /**
     * Chip sub-label for one scope: the Turn's own price or the whole session,
     * each with the ruble reading when the rates are known.
     * @param summary - priced reading.
     * @param t - locale seat.
     * @param rates - reference rates from USD, or empty.
     * @param locale - active language id for number formatting.
     * @param scope - 'request' (this Turn) or 'session' (every Turn).
     * @returns the localized label.
     */
    function labelFor(summary, t, rates, locale, scope) {
      const { priced, unpriced, cost } = summary.total
      if (priced === 0) return atText(summary, t, rates, locale)
      const total = withRates(formatMoney(cost, 'USD', locale), cost, rates, locale)
      const plain = scope === 'session' ? 'pill.session' : 'pill.request'
      const partial = scope === 'session' ? 'pill.sessionPartial' : 'pill.requestPartial'
      return unpriced > 0 ? t(partial, { total, count: unpriced }) : t(plain, { total })
    }

    /** "$0.5 ≈ 46 ₽" once the rate is known; the dollar text alone otherwise. */
    function withRates(text, usd, rates, locale) {
      const rub = formatMoney(usd * (rates.rub === undefined ? NaN : rates.rub), 'RUB', locale)
      return rates.rub === undefined ? text : text + ' ≈ ' + rub
    }

    /** Yuan reading of the same amount, for the panel only. */
    function yuanOf(usd, rates, locale) {
      if (rates.cny === undefined) return ''
      return formatMoney(usd * rates.cny, 'CNY', locale)
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
      '.dshrc2-peak{flex:none;margin-left:6px;padding:0 4px;border:.5px solid var(--dsw-alias-border-l2);',
      'border-radius:4px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;',
      'text-transform:lowercase}',
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

    /**
     * Which tariff the displayed figure used: the newest response's window for a
     * Turn, and the newest response's tariff for the whole-log estimate.
     * @param summary - priced reading.
     * @returns true for peak, false for off-peak, undefined when unknown.
     */
    function tariffOf(summary) {
      if (summary.tariff !== undefined) return summary.tariff
      return summary.at === undefined ? undefined : summary.at.peak
    }

    function CostPanel({ summary, t, rates, locale, scope }) {
      const tokens = summary.total.tokens
      const requests = formatCount(summary.total.priced)
        + (summary.total.unpriced > 0 ? ' (+' + summary.total.unpriced + ')' : '')
      const money = (usd) => h('span', null,
        withRates(formatMoney(usd, 'USD', locale), usd, rates, locale),
        yuanOf(usd, rates, locale) === ''
          ? null
          : h('span', { className: 'dshrc2-sub' }, yuanOf(usd, rates, locale)))
      return h(
        'div',
        { className: 'dshrc2-panel', role: 'dialog', 'aria-label': t('panel.title') },
        h('div', { className: 'dshrc2-head' },
          h('span', null, t('panel.title')),
          h('span', { className: 'dshrc2-total' }, money(summary.total.cost))),
        h('div', { className: 'dshrc2-rule', 'aria-hidden': true }),
        h('dl', { className: 'dshrc2-list' },
          h(Row, {
            label: t('panel.last'),
            value: summary.at.cost === undefined
              ? atText(summary, t)
              : money(summary.at.cost),
          }),
          h(Row, {
            label: t(scope === 'session' ? 'panel.session' : 'panel.total'),
            value: money(summary.total.cost),
          }),
          h(Row, { label: t('panel.lastTokens'), value: formatCount(tokensOf(summary.at)) }),
          h(Row, { label: t('panel.requests'), value: requests }),
          h(Row, { label: t('panel.input'), value: formatCount(tokens.input) }),
          h(Row, { label: t('panel.cacheRead'), value: formatCount(tokens.cacheRead) }),
          h(Row, { label: t('panel.cacheWrite'), value: formatCount(tokens.cacheWrite) }),
          h(Row, { label: t('panel.output'), value: formatCount(tokens.output) })),
        h('p', { className: 'dshrc2-note' }, t('panel.note', { source: t('panel.pricesBuiltin') })),
        tariffOf(summary) === undefined
          ? null
          : h('p', { className: 'dshrc2-note' }, t(tariffOf(summary) ? 'panel.peak' : 'panel.offPeak')),
        summary.total.unpriced > 0
          ? h('p', { className: 'dshrc2-note' }, t('panel.partialNote', { count: summary.total.unpriced }))
          : null,
        summary.partial
          ? h('p', { className: 'dshrc2-note' }, t('panel.windowNote', { model: summary.route === undefined ? '' : summary.route.model }))
          : null,
        h('p', { className: 'dshrc2-note' }, t('panel.estimate')),
        rates.rub === undefined ? null : h('p', { className: 'dshrc2-note' }, fxLine(rates, locale)),
      )
    }

    /* ── component ────────────────────────────────────────────────────── */

    /** The visible pill and its click-open breakdown; renders nothing without a priced response. */

    function CostPill({ summary, t, fxLocale, scope = 'request' }) {
      const rates = useFxRates()
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
      const peak = scope === 'request' && summary.at !== undefined && summary.at.peak === true
      const text = labelFor(summary, t, rates, locale, scope) + (peak ? ' · ' + t('pill.peak') : '')
      const at = atText(summary, t, rates, locale)
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
          peak ? h('span', { className: 'dshrc2-peak', 'aria-hidden': true }, t('pill.peak')) : null,
        ),
        expanded && createPortal(
          h('div', { ref: panelRef, style: { positionAnchor: anchor } }, h(CostPanel, { summary, t, rates, locale, scope })),
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
        const entries = []
        for (const match of context.matches) {
          const event = match.event
          if (event.type !== 'assistant/message' || event.data === null || typeof event.data !== 'object') continue
          entries.push({ usage: event.data.usage, source: routeOf(event.data), time: event.time })
        }
        const summary = summarize(entries)
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
      start: () => ({ entries: [] }),
      update: (context, match) => {
        const event = match.event
        // Only a settled response extends the running accounting; every other
        // match keeps the State reference so nothing downstream re-renders.
        if (event.type !== 'assistant/message' || event.data === null || typeof event.data !== 'object') {
          return context.state
        }
        return {
          entries: [...context.state.entries, {
            usage: event.data.usage,
            source: routeOf(event.data),
            time: event.time,
          }],
        }
      },
      publication: (match) => (match.event.type === 'turn/end' ? 'immediate' : 'none'),
      buildViewNode: (context) => {
        const summary = summarize(context.state.entries)
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
          data: { summary, routes: routesOf(context.state.entries), seq: last.event.seq },
        }
      },
    }

    /**
     * Distinct provider/model routes among the collected responses.
     * @param entries - priced entries `{ usage, source, time }`, oldest first.
     * @returns one entry per distinct route.
     */
    function routesOf(entries) {
      const seen = new Map()
      for (const entry of entries) {
        const route = entry.source
        if (route === null || typeof route !== 'object' || typeof route.model !== 'string') continue
        const key = String(route.provider) + '\u0000' + route.model
        if (!seen.has(key)) seen.set(key, { provider: route.provider, model: route.model })
      }
      return [...seen.values()]
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
     * Chat row view: the Turn's own price, and — for the session kind — the
     * whole-log total. This component takes no hooks so the scope branch can
     * choose a different component without breaking hook order.
     */
    function RequestCostRow(props) {
      const data = props.node && props.node.data
      if (data === undefined || data.summary === undefined) return null
      if (props.node.kind === SESSION_KIND) {
        return h(SessionCostRow, { data, t: props.t, fxLocale: props.fxLocale, useProjection: props.useProjection })
      }
      return h('div', {
        className: 'dshrc2-row',
        'data-request-cost-row': String(data.seq),
        'data-request-cost-scope': 'request',
      }, h(CostPill, { summary: data.summary, t: props.t, fxLocale: props.fxLocale, scope: 'request' }))
    }

    /**
     * Session chip. The durable `tokenUsage` projection covers the complete log
     * even when the Chat window is partial, so the total is stable while the
     * reader pages history; the window only supplies the route and the count.
     */
    function SessionCostRow({ data, t, fxLocale, useProjection }) {
      // Same call shape either way, so the hook order never depends on the seat.
      const read = typeof useProjection === 'function' ? useProjection : () => undefined
      const usage = read('tokenUsage')
      const summary = React.useMemo(() => sessionSummary(data, usage), [data, usage])
      return h('div', {
        className: 'dshrc2-row dshrc2-rowSession',
        'data-request-cost-row': String(data.seq),
        'data-request-cost-scope': 'session',
        'data-request-cost-partial': summary.partial ? 'true' : undefined,
      }, h(CostPill, { summary, t, fxLocale, scope: 'session' }))
    }

    /**
     * Price the whole log from the durable bucket totals.
     * @param data - session node payload (window summary and the routes it saw).
     * @param usage - `tokenUsage` projection of the complete log, when served.
     * @returns a summary whose total covers the complete log when it can be
     * priced, else the window total, with a `partial` marker.
     */
    function sessionSummary(data, usage) {
      const windowSummary = data.summary
      const route = data.routes !== undefined && data.routes.length === 1 ? data.routes[0] : undefined
      if (usage === undefined || route === undefined) {
        return { at: windowSummary.at, total: windowSummary.total, partial: false, tariff: windowSummary.at === undefined ? undefined : windowSummary.at.peak }
      }
      const price = priceOf(route, windowSummary.at === undefined ? undefined : windowSummary.at.time)
      if (price === undefined) {
        return { at: windowSummary.at, total: windowSummary.total, partial: false }
      }
      const buckets = {
        input: usage.uncachedInputTokens | 0,
        cacheRead: usage.cacheReadTokens | 0,
        cacheWrite: usage.cacheWriteTokens | 0,
        output: usage.outputTokens | 0,
      }
      const cost = costOf(buckets, price)
      if (cost === undefined) {
        return { at: windowSummary.at, total: windowSummary.total, partial: false }
      }
      // The window may hold only part of the log; the markers say so.
      const loaded = windowSummary.total.tokens
      const partial = loaded.input !== buckets.input
        || loaded.cacheRead !== buckets.cacheRead
        || loaded.cacheWrite !== buckets.cacheWrite
        || loaded.output !== buckets.output
      return {
        at: windowSummary.at,
        total: {
          cost,
          tokens: buckets,
          priced: windowSummary.total.priced,
          unpriced: windowSummary.total.unpriced,
        },
        partial,
        route,
        tariff: windowSummary.at === undefined ? undefined : windowSummary.at.peak,
      }
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
