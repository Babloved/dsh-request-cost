# dsh-request-cost

Плагин для [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): показывает в чате, сколько стоил каждый ответ модели — в долларах по тарифам DeepSeek, плюс рубли и юани по онлайн-курсу.

![Чип стоимости под ответом](docs/preview.svg)

## Что он делает

Под каждым завершённым ответом появляются две строки:

```
$ ~$0.000472 ≈ 0,043 ₽ · за запрос $0.000472 ≈ 0,043 ₽
$ по сессии $0.0123 ≈ 1,13 ₽
```

- **за запрос** — цена этого ответа: ведущее число — последняя модель-ответ, рядом сумма по ходу (у хода может быть несколько обращений к модели). Если ответ тарифицирован по пиковому тарифу, рядом стоит метка «пик»;
- **по сессии** — итог по всей сессии; он берётся из общего расхода токенов журнала, поэтому не меняется, пока вы подгружаете старые страницы истории;
- по клику на любую строку открывается разбивка: токены входа без кеша, чтение кеша, запись кеша, вывод, число тарифицированных ответов и курс.

Считается по токенам, которые сообщает провайдер, — тем же полям (`inputTokens`, `cacheReadTokens`, `cacheWriteTokens`, `outputTokens`), что и у штатного счётчика Harness.

## Тарифы

Взяты со страницы [DeepSeek API — Models & Pricing](https://api-docs.deepseek.com/quick_start/pricing), доллары США за 1 млн токенов. У DeepSeek два тарифа: пиковый и непиковый (половина пикового).

| Модель | Вход, кеш-промах | Вход, кеш-попадание | Вывод |
|---|---|---|---|
| `deepseek-flash` — пик | $0.30 | $0.006 | $1.20 |
| `deepseek-flash` — непик | $0.15 | $0.003 | $0.60 |
| `deepseek-v4-pro` — пик | $1.32 | $0.044 | $3.96 |
| `deepseek-v4-pro` — непик | $0.66 | $0.022 | $1.98 |

Пик — 01:00–04:00 и 06:00–10:00 UTC по будням; остальное время непиковое. Праздники КНР в плагине не учитываются, такие дни считаются по пиковому тарифу. Запись в кеш DeepSeek отдельно не тарифицирует, поэтому считается по цене кеш-промаха.

Модели вне списка показываются как «цена неизвестна», а не как бесплатные. Стоимость — оценка, а не счёт: точное списание считает платформа.

## Что читает и куда ходит

- читает только журнал сессии, который и так лежит на диске, и ничего в сессию не пишет;
- host-часть плагина пустая: нет сервисов, инструментов, секций промпта и слушателей;
- в браузере уходит один необязательный запрос — за справочными курсами USD→RUB и USD→CNY на `open.er-api.com/v6/latest/USD` (кеш 6 часов, `credentials: omit`). Ни цены, ни промпты, ни токены наружу не отправляются;
- нет `eval`, `Function`, `innerHTML`, `dangerouslySetInnerHTML`; стили — на токенах темы.

## Установка

Плагин — локальный бандл Harness. Скопируйте каталог и установите его в свой профиль:

```bash
git clone https://github.com/Babloved/dsh-request-cost.git ~/dsh-plugins/dsh-request-cost
dsh plugin --profile <профиль> add ~/dsh-plugins/dsh-request-cost
```

Затем включите бандл в **Настройки → Плагины** (или `plugin_manager` с `set_bundle`) и обновите страницу.

Требуется `pnpm` в `PATH` и, для установки прямо из Git, `git`.

## Разработка

```
client.js         клиентская половина: определение строки чата, чип, панель
index.js          host-половина (пустая: export function apply() {})
cordis.patch.yml  вставка строки плагина в профиль
locale/*.json     заголовок и описание плагина (en, ru, zh)
docs/             изображение для страницы плагина
test/smoke.mjs    офлайн-тест: eval бандла, определение, оба чипа
```

```bash
node test/smoke.mjs
```

## English

A DeepSeek Harness plugin that shows what each answer cost: a chip under every completed answer (per request) and a second chip with the whole-session total. Prices come from the DeepSeek pricing page in USD, with the peak and off-peak tariffs, and are converted to rubles and yuan at the current online rate. The session total uses the log-wide token usage, so it does not change while older history pages load. It only reads the session log; the single optional network request is the reference rates from `open.er-api.com` (cached for six hours). Any model outside the price table reads as price unknown, never free.

## Лицензия

MIT — см. [LICENSE](LICENSE).
