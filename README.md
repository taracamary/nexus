# Nexus

Одностраничный лендинг AI-event (саммит / конференция) по макету Figma.

- Дизайн: [Figma][figma-design]
- Community template: [Nexus — AI Event Landing Page][figma-community]

Стек: **Vite 8 + HTML (PostHTML includes) + SCSS (BEM) + Vanilla JS**.  
Цель репозитория — коммерческий portfolio-уровень vanilla frontend, без React/Next и без HTML в JavaScript.

[figma-design]: https://www.figma.com/design/u1mzhiqwlXQ3pA5rRPdpAZ/Nexus--AI-Event-Landing-Page--Community---Copy-?node-id=27-135&t=a6PUY96hbzthofGh-1
[figma-community]: https://www.figma.com/community/file/1478691706512852488

---

## Быстрый старт

```bash
npm install
npm run dev
```

Проверка перед commit:

```bash
npm run check
```

Отдельные команды:

| Script            | Назначение                         |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Dev-server                         |
| `npm run build`   | Production-сборка в `dist/`        |
| `npm run preview` | Превью `dist/`                     |
| `npm run lint`    | ESLint + Stylelint + html-validate |
| `npm run format`  | Prettier write                     |
| `npm run check`   | `format:check` + `lint` + `build`  |

---

## Source of Truth

Архитектурные правила считаются утверждёнными. Без явной причины их не пересматривать.

1. **HTML не хранится в JS** (не template strings, не `innerHTML` для секций).
2. **HTML собирается на build-time** через PostHTML + `posthtml-include`.
3. **Секция = папка** `src/sections/<name>/`:
   - `<name>.html` — разметка
   - `_<name>.scss` — стили секции
   - `<name>.js` — только если реально нужно поведение
4. **Shared-стили** только в `src/styles/base/`, `layout/`, `tools/`.
5. **Section SCSS** лежит рядом с секцией (colocation).
6. **`components/`** создаётся только после **второго** подтверждённого reuse одного UI-паттерна.
7. **YAGNI:** не создавать файлы, папки и абстракции «на будущее».

---

## Структура

```text
nexus/
├── index.html                 # document shell + <main> + includes
├── vite.config.js             # Vite + PostHTML include plugin
├── src/
│   ├── main.js                # entrypoint (сейчас только импорт SCSS)
│   ├── assets/fonts/syne/     # self-host Syne woff2 (400 / 500 / 700)
│   ├── sections/
│   │   └── hero/
│   │       ├── hero.html      # эталон секции (HTML)
│   │       └── _hero.scss     # эталон секции (SCSS)
│   └── styles/
│       ├── main.scss          # порядок @use слоёв и секций
│       ├── base/              # fonts, reset, tokens, typography
│       ├── layout/            # container
│       └── tools/             # rem() и будущие Sass-only helpers
├── public/                    # статика as-is (пока пусто)
└── dist/                      # результат build (gitignored)
```

### Слои SCSS (`main.scss`)

Порядок импортов фиксирован:

1. `tools/functions`
2. `base/fonts`
3. `base/reset`
4. `base/tokens`
5. `base/typography`
6. `layout/container`
7. секции (`sections/...`)

`rem()` из `tools` **не протекает** автоматически в файлы секций: каждый SCSS, которому нужна функция, делает свой `@use "../../styles/tools/functions" as *`.

---

## HTML

- `index.html` — оболочка документа: `<head>`, один `<main>`, `<script type="module" src="/src/main.js">`.
- Секции подключаются **внутри** `<main>`:

```html
<main>
  <include src="sections/hero/hero.html"></include>
  <!-- следующие секции — такими же include -->
</main>
```

- Partial секции содержит **только** `<section>…</section>` (без `<main>`).
- Путь в `src` у `<include>` считается от `src/` (см. `root` в `vite.config.js`).
- В source допускается тег `<include>` (build-time DSL); `html-validate` настроен на него. В `dist/index.html` его уже нет.

**Запрещено:** возвращать разметку секций в JS; класть `<main>` внутрь partial.

---

## SCSS (эталон — Hero)

- **BEM:** `.block`, `.block__element`, опционально `.block--modifier`.
- **Nesting:** максимум один уровень BEM от блока; `@media` внутри блока.
- **Длины:** `rem(32px)` через `tools` (база 16px). Исключения: `0`, осмысленные `1px`, `vw` / unitless где уместно.
- **Logical properties** по умолчанию (`padding-block`, `margin-inline`, `inset-*`, `text-align: start|end`). Физические — только если logical хуже читается (декор, углы градиентов, `rotate`).
- **Цвета:** semantic CSS-переменные из `base/_tokens.scss`, не сырой hex в секциях.
- **Не использовать:** `@extend`, placeholder selectors, mixin-библиотеку «на будущее», utility-классы, Tailwind, CSS Modules.

---

## Токены и typography

**Цвета** (`src/styles/base/_tokens.scss`): raw-палитра + semantic-роли (`--color-background-page`, `--color-text-primary`, `--color-accent-primary`, …).

**Document** (`base/_typography.scss` на `body`):

- `font-family: Syne, system-ui, sans-serif`
- `color` / `background-color` из semantic-токенов
- `line-height: 1.5`
- `font-synthesis: none`

**Шрифт Syne** — только self-host woff2 (`400` / `500` / `700`).  
`font-family` задаётся на `body`; секции наследуют и задают веса точечно.  
Не подключены: Google Fonts, variable font, woff-fallback, preload, metric overrides (отложено до замеров).

---

## Layout

`.container` (`layout/_container.scss`):

```scss
width: min(100% - 2rem, 77.5rem); /* 1240px content @ 16px root */
margin-inline: auto;
```

---

## JavaScript

`src/main.js` — entrypoint Vite. Сейчас только:

```js
import "./styles/main.scss";
```

HTML секций здесь быть не должно.  
`section.js` — только при реальном интерактивном поведении.

---

## Как добавить новую секцию

1. Создать `src/sections/<name>/<name>.html` (корень — `<section class="<name}">`).
2. Добавить в `index.html` внутри `<main>`:
   ```html
   <include src="sections/<name>/<name>.html"></include>
   ```
3. Создать `src/sections/<name>/_<name>.scss` по правилам Hero.
4. Подключить в `src/styles/main.scss`:
   ```scss
   @use "../sections/<name>/<name>";
   ```
5. JS — только если нужен.
6. Прогнать `npm run check`.

`components/` не создавать, пока паттерн не использован второй раз.

---

## Текущий статус

**Готово (фундамент):**

- Vite + PostHTML includes
- Reset, color tokens, container, typography foundation
- Self-host Syne
- Hero как эталон секции (HTML + SCSS)

**Ещё не сделано по макету:** остальные секции (speakers, agenda, tickets и т.д.).

**Сознательно отложено:** preload шрифтов, font metric overrides, typography/spacing token packs, `components/`, section JS без задачи.

---

## Для следующего разработчика / AI-агента

- Не менять SoT и не объединять несколько архитектурных Stage «заодно».
- Не создавать инфраструктуру на будущее.
- Перед архитектурным изменением — сначала последствия; при конфликте с SoT — стоп и вопрос.
- После Stage: кратко что сделано / почему / что не трогали / риски / проверки / Conventional Commit message.
- Эталон секции: `src/sections/hero/`.
