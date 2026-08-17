# Weather Compare

Веб-приложение для изучения климата городов и наглядного сравнения погодных показателей на основе многолетних исторических данных.

<p>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="40" height="40" alt="React" title="React">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg" width="40" height="40" alt="Python" title="Python">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original.svg" width="40" height="40" alt="SQLite" title="SQLite">
</p>

## Что умеет приложение

### Раздел "Климат города"

После выбора города пользователь может изучить как меняется его климат в течение года. Для каждого календарного дня используются усреднённые значения, рассчитанные по историческим данным с 1995 по 2025 год. Информация представлена в виде различных графиков и сводок:

На странице представлены:

- температура воздуха: средняя, минимальная и максимальная;
- ощущаемая температура;
- количество осадков;
- относительная влажность воздуха;
- средняя скорость ветра;
- роза ветров (преобладающие направления ветра, средняя скорость ветра для каждого направления);

Также тут находятся краткие сводки для каждого показателя и более подробная сводка для выбранного.

### Раздел "Сравнение городов"

После выбора двух городов пользователь может сравнить, как меняется их климат в течение года. Для каждого календарного дня используются усреднённые значения, рассчитанные по историческим данным с 1995 по 2025 год. Информация представлена на общих графиках и в сводках.

На странице можно сравнить:

- среднюю температуру воздуха;
- количество осадков;
- относительную влажность воздуха;
- среднюю скорость ветра;
- розы ветров с преобладающими направлениями и средней скоростью для каждого направления;
- облачность с разделением на ясную, переменную и пасмурную погоду.

Для выбранного показателя приложение также рассчитывает разницу между городами и определяет, в каком из них значение выше. Краткая сводка помогает увидеть основное отличие, не анализируя график вручную.

### Возможности интерфейса

- русский и английский языки (в будущем больше);
- светлая, тёмная и системная темы;
- выбор единиц измерения:
  - температура: °C или °F;
  - осадки: мм или дюймы;
  - ветер: км/ч, м/с или mph;
- сохранение языка, темы и единиц измерения в `localStorage`;
- собственные страницы «Скоро будет» и 404;

## Города

В стартовый набор входят:

- Владивосток;
- Тверь;
- Санкт-Петербург;
- Москва;
- Ростов-на-Дону;
- Екатеринбург;
- Токио;
- Нью-Йорк;
- Лондон;
- Мадрид;
- Марсель;
- Париж.

Список и координаты городов задаются в `backend/app/utils/config.py`.

## Источник и обработка данных

Исторические данные загружаются из [Open-Meteo Historical Weather API](https://open-meteo.com/en/docs/historical-weather-api) с использованием модели ERA5.

Backend получает почасовые значения за период с `1995-01-01` по `2025-12-31`:

После загрузки приложение:

1. группирует почасовые наблюдения по дням;
2. рассчитывает дневные средние, минимумы, максимумы и суммы;
3. объединяет одинаковые календарные дни разных лет;
4. получает климатические данные из 365/366 точек;
5. рассчитывает преобладающее направление ветра через круговое среднее с весом по скорости;
6. формирует восьмисекторную розу ветров;
7. сохраняет исходные и агрегированные данные в SQLite.

При повторном запуске полнота данных проверяется, поэтому уже загруженные наборы не запрашиваются заново.

> На первом запуске backend создаёт базу автоматически и загружает большой объём истории для всех городов. Процесс требует подключения к интернету, может занять продолжительное время и создать локальную базу размером около 300 МБ. Каталог `backend/data/` не добавляется в Git.

## Стек

### Frontend

- **React 19:** основа интерфейса;
- **Vite 8:** запуск и сборка проекта;
- **Recharts:** построение графиков;
- **Radix UI:** базовые компоненты с гибкой кастомизацией;
- **i18next:** локализация интерфейса на русский и английский языки.

### Backend

- **Python 3.12:** серверная логика и обработка погодных данных;
- **FastAPI:** создание REST API;
- **SQLite:** хранение данных.

## Архитектура

Backend разделён на несколько слоёв:

- `clients`: работа с Open-Meteo, повторные запросы и обработка rate limit;
- `db`: подключение, создание таблиц, миграции и наполнение базы;
- `repositories`: SQL-запросы и преобразование строк базы в модели;
- `services`: агрегация, климатические расчёты и бизнес-логика;
- `api/routes`: HTTP-эндпоинты FastAPI.

На frontend страницы собираются из переиспользуемых dashboard-карточек и специализированных графиков. Получение климатических данных вынесено в hook `useDailyWeather`, форматирование единиц находится в отдельном context, а локализация и тема подключены на уровне приложения.

## API

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/health` | Проверка состояния API |
| `GET` | `/cities` | Список доступных городов |
| `GET` | `/weather/hourly/{city_id}` | Почасовые исторические данные города |
| `GET` | `/weather/daily_averages/{city_id}` | Климатический год, роза ветров и распределение облачности |

После запуска интерактивная документация доступна по адресу `/docs` на backend или `/api/docs` при запуске через Docker.

## Запуск в Docker

Для запуска потребуются Docker Engine и Docker Compose. В Docker Desktop они устанавливаются вместе.

Клонируйте репозиторий и создайте локальный файл с настройками:

```bash
git clone https://github.com/R9quiem/weather-compare.git
cd weather-compare
cp .env.example .env
```

В Windows PowerShell последнюю команду нужно заменить на:

```powershell
Copy-Item .env.example .env
```

Если готовая база уже есть, поместите её в `backend/data/app.db` и установите в `.env`:

```dotenv
SEED_DATABASE_ON_STARTUP=false
```

Если базы нет, оставьте значение `true`. При первом запуске backend создаст её и загрузит исторические данные, поэтому потребуется интернет, а запуск займёт продолжительное время.

Соберите и запустите приложение:

```bash
docker compose up --build -d
```

После запуска доступны:

- приложение: [http://localhost:8080](http://localhost:8080);
- Swagger UI: [http://localhost:8080/api/docs](http://localhost:8080/api/docs);
- проверка API: [http://localhost:8080/api/health](http://localhost:8080/api/health).

Порт можно изменить через `APP_PORT` в `.env`. Посмотреть логи и остановить приложение можно командами:

```bash
docker compose logs -f
docker compose down
```

Папка `backend/data` подключается к backend-контейнеру как постоянное хранилище. База не попадает внутрь Docker-образа и сохраняется после пересборки или удаления контейнера.

## Локальный запуск

### Требования

- Python 3.12+;
- Node.js 20.19+ или 22.12+;
- npm 10+;
- интернет для первой загрузки исторических данных.

### Установка

Клонируйте репозиторий:

```bash
git clone https://github.com/R9quiem/weather-compare.git
cd weather-compare
```

Создайте локальный файл с переменными окружения:

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

В `.env` задаются адрес backend для frontend, разрешённые CORS-источники, путь к базе данных и автоматическое заполнение базы при запуске.

Создайте виртуальное окружение Python и установите backend-зависимости:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -e "backend[dev]"
```

macOS/Linux:

```bash
source .venv/bin/activate
python -m pip install -e "backend[dev]"
```

Установите frontend-зависимости:

```bash
cd frontend
npm ci
cd ..
```

Запустите frontend и backend одной командой из корня проекта:

```bash
node start.mjs
```

После запуска:

- frontend: [http://localhost:5173](http://localhost:5173);
- backend: [http://127.0.0.1:8000](http://127.0.0.1:8000);
- Swagger UI: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

Сервисы также можно запустить отдельно:

```bash
# Терминал 1
cd backend
python -m uvicorn app.main_api:app --reload

# Терминал 2
cd frontend
npm run dev
```

## Проверки

Backend:

```bash
cd backend
python -m ruff check .
python -m ruff format --check .
python -m pytest
```

Frontend:

```bash
cd frontend
npm run lint
npm run format:check
npm run build
```

## Структура проекта

```text
weather-compare/
├── compose.yaml             # Combined Docker launch
├── backend/
│   ├── Dockerfile           # Backend image
│   ├── app/
│   │   ├── api/             # FastAPI routes
│   │   ├── clients/         # Open-Meteo client
│   │   ├── db/              # SQLite initialization and seeding
│   │   ├── models/          # Data models
│   │   ├── repositories/    # Database queries
│   │   ├── services/        # Analysis and business logic
│   │   └── main_api.py      # FastAPI application
│   ├── data/                # Local generated database (gitignored)
│   ├── tests/               # Backend tests
│   └── pyproject.toml       # Python dependencies and project settings
├── frontend/
│   ├── Dockerfile           # Frontend build and Nginx image
│   ├── nginx.conf           # Static files, SPA fallback and API proxy
│   └── src/
│       ├── api/             # Requests to backend
│       ├── app/             # Layout and routing
│       ├── components/      # UI, controls and charts
│       ├── hooks/           # Data fetching hooks
│       ├── locales/         # Russian and English translations
│       ├── pages/           # Application pages
│       ├── theme/           # Theme state
│       └── units/           # Unit conversion and formatting
├── notebooks/               # Experiments and data exploration
└── start.mjs                # Combined development launcher
```
