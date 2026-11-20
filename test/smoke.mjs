// Offline smoke test for the request-cost client half: evaluates the bundle
// registration in a fake browser shell, applies the plugin to a fake client
// context, then drives the Conversation Definition it registers the way the
// engine does and renders the resulting Chat row against synthetic Turns.
import { readFileSync } from 'node:fs'
import vm from 'node:vm'

const source = readFileSync(new URL('../client.js', import.meta.url), 'utf8')

let registration
let factory

const React = {
  createElement: (type, props, ...children) => ({
    type,
    props,
    children: children.filter(child => child !== false && child != null),
  }),
  useState: initial => [initial, () => {}],
  useRef: () => ({ current: null }),
  useMemo: fn => fn(),
  useEffect: () => {},
  useId: () => ':r0:',
  memo: component => component,
}
const modules = {
  react: React,
  'react-dom': { createPortal: node => node },
}

const sandbox = {
  console,
  JSON,
  Math,
  Object,
  Array,
  Number,
  String,
  document: {
    getElementById: () => null,
    createElement: () => ({ remove() {} }),
    head: { appendChild() {} },
    addEventListener() {},
    removeEventListener() {},
  },
}
sandbox.globalThis = sandbox
sandbox.window = sandbox
sandbox.window.__ModuleLoader__ = {
  load(entry) {
    registration = entry
    factory = entry.factory
  },
}

function expect(actual, wanted) {
  if (actual !== wanted) throw new Error(`expected ${wanted}, got ${actual}`)
}

vm.createContext(sandbox)
vm.runInContext(source, sandbox)
expect(registration?.id, '@local/dsh-request-cost')
const plugin = factory(name => {
  if (!(name in modules)) throw new Error('unexpected require(' + name + ')')
  return modules[name]
})
if (typeof plugin?.apply !== 'function') throw new Error('factory did not return a plugin')

const dictionaries = []
const effects = []
const registrations = []
const chatRows = []
const definitions = []
const factories = []
const ctx = {
  effect: (fn, label) => { effects.push(label); return fn() },
  locale: {
    register: (ns, id, dict) => { dictionaries.push([ns, id, dict]); return () => {} },
    bind: () => (key, params) => {
      const dict = dictionaries.find(([, id]) => id === 'ru')[2]
      return (dict[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => String(params?.[name] ?? ''))
    },
  },
  get: name => (name === 'uiConversation' ? { events: { register: definition => { definitions.push(definition); return () => {} } } } : undefined),
  uiConversation: { events: { register: definition => { definitions.push(definition); return () => {} } } },
  slots: {
    inject: (key, fn) => { expect(key, 'conversation.chat.node'); fn() },
    register: (options, component) => { registrations.push({ options, component }); if (options.name === 'conversation.chat.node') chatRows.push({ options, component }); return () => {} },
    registerFactory: (options, component) => { factories.push({ options, component }); return () => {} },
  },
}

plugin.apply(ctx)
expect(dictionaries.length, 8)
expect(registrations.length, 2)
expect(registrations.map(r => r.options.key).sort().join(','), 'request-cost,request-cost-total')
expect(registrations[0].options.locale, 'requestCost2')
expect(definitions.length, 2)
expect(definitions.map(d => d.kind).sort().join(','), 'request-cost,request-cost-total')
expect(chatRows.length, 2)
// Every dictionary carries the same key set as the English baseline.
const base = Object.keys(dictionaries.find(([, id]) => id === 'en')[2]).sort().join(',')
for (const [ns, id, dict] of dictionaries) {
  expect(ns, 'requestCost2')
  expect(Object.keys(dict).sort().join(','), base)
}

const Row = chatRows[0].component
const definition = definitions.find(d => d.kind === 'request-cost')
const sessionDefinition = definitions.find(d => d.kind === 'request-cost-total')
const t = ctx.locale.bind('requestCost2')

const flash = { provider: 'deepseek-official', model: 'deepseek-flash' }
// 1200 x ¥1 + 150 x ¥2 per million = ¥0.0015 per response.
const flashMessage = () => ({
  type: 'assistant/message',
  data: {
    turn: 1,
    step: 1,
    message: { id: 'm1', role: 'assistant', content: [], source: { kind: 'model', ...flash } },
    usage: { inputTokens: 1200, cacheReadTokens: 0, outputTokens: 150 },
  },
})
const unknownMessage = {
  type: 'assistant/message',
  data: {
    turn: 1,
    step: 1,
    message: { id: 'm2', role: 'assistant', content: [], source: { kind: 'model', provider: 'x', model: 'other' } },
    usage: { inputTokens: 5, outputTokens: 5 },
  },
}

/** Run the Conversation Definition the way the engine does for one Turn. */
function rowFor(events) {
  // Matches carry the engine's resolved Location; the row must borrow it.
  const turn = { turn: events[0]?.data?.turn ?? 0, status: 'closed', steps: [], data: { get: () => undefined } }
  const matches = events.map((event, index) => ({
    event: { ...event, seq: index + 1 },
    role: index === 0 ? 'start' : 'update',
    location: event.type === 'assistant/message'
      ? { kind: 'step', turn, step: { turn: turn.turn, step: 1, status: 'closed', data: { get: () => undefined } } }
      : { kind: 'turn', turn },
  }))
  const start = matches.find(match => definition.match(match.event)?.role === 'start')
  if (start === undefined) return null
  const state = definition.start({ key: 'turn', matches, start }, start)
  const context = { key: 'turn', id: 'turn', start, matches, state }
  const node = definition.buildViewNode(context)
  return node === null ? null : Row({ node, t })
}

/**
 * The pill element of a rendered Chat row, or null. The row wraps
 * `React.createElement(CostPill, ...)` in a div, so the chain is unwrapped the
 * way a renderer would.
 */
function pillOf(rendered) {
  let node = rendered
  for (let depth = 0; depth < 4; depth += 1) {
    if (node === null || node === undefined) return null
    if (node.type === 'button') return node
    if (node.type === 'span' || node.type === 'div') node = node.children[0]
    else if (typeof node.type === 'function') node = node.type(node.props)
    else return null
  }
  return null
}

/** Assert that a surface shows no pill at all. */
function expectEmpty(rendered, label) {
  if (pillOf(rendered) !== null) throw new Error(`${label} should render nothing`)
}

// 1. No Turn means no row.
expectEmpty(rowFor([]), 'row without a turn')
// 2. A model without a price renders no row: unknown is not free.
expectEmpty(rowFor([{ type: 'turn/start', data: { turn: 1 } }, unknownMessage, { type: 'turn/end', data: { turn: 1 } }]), 'row with an unpriced model')

// 3. A priced Turn shows the chip with its price.
const turnRow = pillOf(rowFor([{ type: 'turn/start', data: { turn: 1 } }, flashMessage(), { type: 'turn/end', data: { turn: 1 } }]))
expect(turnRow?.type, 'button')
expect(turnRow.children[1].children[0], '~¥0.001500')
console.log('chip:', turnRow.children[1].children[0], '·', turnRow.children[2].children[0])

// 4. A Turn that billed two responses sums both.
const twoRow = pillOf(rowFor([
  { type: 'turn/start', data: { turn: 2 } },
  flashMessage(),
  flashMessage(),
  { type: 'turn/end', data: { turn: 2 } },
]))
expect(twoRow.children[2].children[0], 'за запрос ¥0.003000')

// 5. A Turn that also hit an unpriced model reports it instead of hiding it.
const mixedRow = pillOf(rowFor([
  { type: 'turn/start', data: { turn: 3 } },
  flashMessage(),
  unknownMessage,
  { type: 'turn/end', data: { turn: 3 } },
]))
if (!mixedRow.children[2].children[0].includes('без цены')) throw new Error('mixed label lost the unpriced count')
console.log('mixed:', mixedRow.children[2].children[0])

// 6. The newest response is unpriced: the head says so instead of a number.
const newestRow = pillOf(rowFor([
  { type: 'turn/start', data: { turn: 4 } },
  flashMessage(),
  unknownMessage,
  { type: 'turn/end', data: { turn: 4 } },
]))
if (!newestRow.children[1].children[0].includes('цена неизвестна')) throw new Error('newest unpriced response not flagged')
console.log('newest:', newestRow.children[1].children[0])

// 7. The session Definition accumulates every Turn into one running total.
let sessionState = sessionDefinition.start({ key: 'session', matches: [], start: { event: { type: 'turn/start' }, role: 'start', location: { kind: 'turn', turn: { turn: 1 } } } })
const sessionMatches = []
for (const turnNumber of [1, 2]) {
  const turn = { turn: turnNumber, status: 'closed', steps: [], data: { get: () => undefined } }
  const events = [
    { type: 'turn/start', seq: turnNumber * 10, data: { turn: turnNumber } },
    { ...flashMessage(), seq: turnNumber * 10 + 1 },
    { type: 'turn/end', seq: turnNumber * 10 + 2, data: { turn: turnNumber } },
  ]
  for (const event of events) {
    const match = { event, role: event.type === 'turn/start' ? 'start' : 'update', location: { kind: 'turn', turn } }
    sessionMatches.push(match)
    sessionState = sessionDefinition.update({ key: 'session', id: 'session', start: sessionMatches[0], matches: sessionMatches, state: sessionState }, match)
  }
}
const sessionView = sessionDefinition.buildViewNode({
  key: 'session', id: 'session', start: sessionMatches[0], matches: sessionMatches, state: sessionState,
})
const sessionRow = Row({ node: sessionView, t })
const sessionPill = sessionRow.children[0].type(sessionRow.children[0].props)
const sessionChip = sessionPill.children[0]
expect(sessionChip?.type, 'button')
// The session chip has no leading figure: icon, then the labelled total.
expect(sessionChip.children.length, 2)
const sessionLabel = sessionChip.children[1].children[0]
if (!sessionLabel.includes('по сессии')) throw new Error('session chip lost its label: ' + sessionLabel)
console.log('session chip:', sessionLabel)

console.log('effects:', effects.length, 'owned; dictionaries:', dictionaries.length)
console.log('OK')
