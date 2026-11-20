# dsh-request-cost

Плагин для [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness): показывает в чате, сколько стоил каждый ответ модели — в юанях и в рублях по онлайн-курсу.

![Чип стоимости под ответом](docs/preview.svg)

## Что он делает

Под каждым завершённым ответом появляются две строки:

```
$ ~¥0.000472 ≈ 0,0058 ₽ · за запрос ¥0.000472 ≈ 0,0058 ₽
$ по сессии ¥0.0123 ≈ 0,152 ₽
```

- **за запрос** — цена этого ответа: ведущее число — последняя модель-ответ, рядом сумма по ходу (у хода может быть несколько обращений к модели);
- **по сессии** — итог по всей сессии; он берётся из общего расхода токенов журнала, поэтому не меняется, пока вы подгружаете старые страницы истории;
- по клику на любую строку открывается разбивка: токены входа без кеша, чтение кеша, запись кеша, вывод, число тарифицированных ответов и курс.

Считается по токенам, которые сообщает провайдер, — тем же полям (`inputTokens`, `cacheReadTokens`, `cacheWriteTokens`, `outputTokens`), что и у штатного счётчика Harness.

## Тарифы

Встроены, юань за 1 млн токенов (со страницы цен DeepSeek):

| Модель | Вход | Чтение кеша | Запись кеша | Вывод |
|---|---|---|---|---|
| `deepseek-flash` | 1 | 0.02 | 1 | 2 |
| `deepseek-v4-pro` | 3 | 0.06 | 3 | 6 |

Модели вне списка показываются как «цена неизвестна», а не как бесплатные. Стоимость — оценка, а не счёт: точное списание считает платформа.

## Что читает и куда ходит

- читает только журнал сессии, который и так лежит на диске, и ничего в сессию не пишет;
- host-часть плагина пустая: нет сервисов, инструментов, секций промпта и слушателей;
- в браузере уходит один необязательный запрос — за справочным курсом на `open.er-api.com/v6/latest/CNY` (кеш 6 часов, `credentials: omit`). Ни цены, ни промпты, ни токены наружу не отправляются;
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

A DeepSeek Harness plugin that shows what each answer cost, in yuan and in rubles at the current online rate: a chip under every completed answer (per request) and a running total for the session. It only reads the session log; the single optional network request is the reference rate from `open.er-api.com` (cached for six hours). Prices are built in for `deepseek-flash` and `deepseek-v4-pro`; any other model reads as price unknown, never free.

## Лицензия

MIT — см. [LICENSE](LICENSE).
