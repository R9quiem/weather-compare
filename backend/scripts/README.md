# Перенос SQLite → PostgreSQL

Запускать команды из корня проекта в активированном виртуальном окружении.
Настройки PostgreSQL берутся из корневого `.env`. Скрипты не выводят пароль.
Предварительно установите зависимости: `python -m pip install -e "backend[dev]"`.

## Порядок выполнения

```powershell
python backend/scripts/migrate_sqlite_to_postgres.py snapshot --source backend/data/app.db --output backend/data/migration_20261002/sqlite_snapshot.db
python backend/scripts/migrate_sqlite_to_postgres.py migrate --source backend/data/migration_20261002/sqlite_snapshot.db --output backend/data/migration_20261002/migration_verification.json
python backend/scripts/migrate_sqlite_to_postgres.py verify --source backend/data/migration_20261002/sqlite_snapshot.db --output backend/data/migration_20261002/post_commit_verification.json
```

`migrate` отказывается изменять непустые целевые таблицы. Повторно после успешного
переноса запускайте `verify`, а не `migrate`. Снимок также не перезаписывается.
На время переноса остановите загрузчики и запись приложения в обе базы.

Скрипт использует SQLite Backup API для согласованного снимка, проверяет целостность
и внешние ключи SQLite. Загружает четыре таблицы через COPY с исходными ID,
настраивает следующий ID города, затем сравнивает число и SHA-256 всех строк
по первичному ключу (все колонки, точные float через hex, NULL и строки).
COPY, изменение счётчика и проверка выполняются в одной транзакции PostgreSQL.
При исключении перенос откатывается. Режим verify повторяет полное сравнение
после фиксации. Данные и отчёты в backend/data игнорируются Git.

## Перенос в Docker

Задайте `DB_PASSWORD` в `.env`, оставьте `SEED_DATABASE_ON_STARTUP=false`.
Поместите исходную SQLite-базу в `backend/data/app.db`. Остановите backend
и другие загрузчики перед снимком. PostgreSQL в Compose использует отдельный
volume и не импортирует файл SQLite автоматически.

```powershell
docker compose stop backend
docker compose up -d postgres
docker compose run --rm --build backend python scripts/migrate_sqlite_to_postgres.py snapshot --source /app/data/app.db --output /app/data/migration_20261003/sqlite_snapshot.db
docker compose run --rm backend python scripts/migrate_sqlite_to_postgres.py migrate --source /app/data/migration_20261003/sqlite_snapshot.db --output /app/data/migration_20261003/migration_verification.json
docker compose run --rm backend python scripts/migrate_sqlite_to_postgres.py verify --source /app/data/migration_20261003/sqlite_snapshot.db --output /app/data/migration_20261003/post_commit_verification.json
docker compose up --build -d
```

Для нового переноса выбирайте новый каталог снимка. Проверки snapshot и verify
не заменяют резервное копирование PostgreSQL после запуска приложения.
