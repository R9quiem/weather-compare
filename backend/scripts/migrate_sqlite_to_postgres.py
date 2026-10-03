"""Copy a consistent SQLite snapshot to an empty PostgreSQL schema and verify every row."""

import argparse
import hashlib
import json
import sqlite3
from contextlib import closing
from pathlib import Path

from psycopg import sql
from psycopg.rows import tuple_row

from app.db import init_db_postgres as ddl
from app.db.connection import create_connection

TABLES = {
    "cities": ("id",),
    "hourly_weather": ("city_id", "observed_at"),
    "daily_averages_weather": ("city_id", "observed_date"),
    "wind_rose": ("city_id", "direction"),
}
DDLS = [
    ddl.CREATE_CITIES_TABLE,
    ddl.CREATE_HOURLY_WEATHER_TABLE,
    ddl.CREATE_DAILY_AVERAGES_WEATHER_TABLE,
    ddl.CREATE_WIND_ROSE_TABLE,
]


def source_connection(path):
    return sqlite3.connect(Path(path).resolve().as_uri() + "?mode=ro", uri=True)


def columns(source, table):
    return [row[1] for row in source.execute(f'PRAGMA table_info("{table}")')]


def signature(rows):
    digest = hashlib.sha256()
    count = 0
    for row in rows:
        # Preserve exact floating point values, NULLs, text and integer types.
        normalized = [v.hex() if isinstance(v, float) else v for v in row]
        digest.update(
            (json.dumps(normalized, ensure_ascii=False, separators=(",", ":")) + "\n").encode()
        )
        count += 1
    return {"rows": count, "sha256": digest.hexdigest()}


def verify(source, target):
    report = {}
    for table, keys in TABLES.items():
        names = columns(source, table)
        query = sql.SQL("SELECT {} FROM {} ORDER BY {}").format(
            sql.SQL(",").join(map(sql.Identifier, names)),
            sql.Identifier(table),
            sql.SQL(",").join(map(sql.Identifier, keys)),
        )
        source_sql = (
            "SELECT "
            + ",".join('"' + n + '"' for n in names)
            + ' FROM "'
            + table
            + '" ORDER BY '
            + ",".join('"' + k + '"' for k in keys)
        )
        expected = signature(source.execute(source_sql))
        with target.cursor(name="verify_" + table, row_factory=tuple_row) as cursor:
            cursor.execute(query)
            actual = signature(cursor)
        if expected != actual:
            raise RuntimeError(f"Full row verification failed: {table}: {expected} != {actual}")
        report[table] = actual
        print(f"Verified {table}: {actual['rows']} rows", flush=True)
    return report


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["snapshot", "migrate", "verify"])
    parser.add_argument("--source", required=True, type=Path)
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    if args.action == "snapshot":
        if args.output.exists():
            raise RuntimeError("Snapshot destination already exists")
        with (
            closing(source_connection(args.source)) as source,
            closing(sqlite3.connect(args.output)) as backup,
        ):
            source.backup(backup)
            assert backup.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
            assert not backup.execute("PRAGMA foreign_key_check").fetchall()
        print("Consistent SQLite backup created; integrity and foreign keys OK")
        return
    with closing(source_connection(args.source)) as source, create_connection() as target:
        source.execute("BEGIN")
        target.execute("SET search_path TO public")
        target.execute("SET lock_timeout = '10s'")
        if args.action == "migrate":
            for statement in DDLS:
                target.execute(statement)
            for table in TABLES:
                target.execute(
                    sql.SQL("LOCK TABLE {} IN ACCESS EXCLUSIVE MODE").format(sql.Identifier(table))
                )
                if target.execute(
                    sql.SQL("SELECT EXISTS(SELECT 1 FROM {}) AS populated").format(
                        sql.Identifier(table)
                    )
                ).fetchone()["populated"]:
                    raise RuntimeError(f"Refusing to modify nonempty table: {table}")
            for table in TABLES:
                names = columns(source, table)
                with (
                    target.cursor() as cursor,
                    cursor.copy(
                        sql.SQL("COPY {} ({}) FROM STDIN").format(
                            sql.Identifier(table), sql.SQL(",").join(map(sql.Identifier, names))
                        )
                    ) as copy,
                ):
                    query = (
                        "SELECT " + ",".join('"' + n + '"' for n in names) + ' FROM "' + table + '"'
                    )
                    count = 0
                    for row in source.execute(query):
                        copy.write_row(row)
                        count += 1
                print(f"Copied {table}: {count} rows", flush=True)
            maximum = target.execute("SELECT COALESCE(MAX(id), 0) AS n FROM cities").fetchone()["n"]
            # Transactional restart, unlike setval(), rolls back if validation fails.
            target.execute(
                sql.SQL("ALTER TABLE cities ALTER COLUMN id RESTART WITH {}").format(
                    sql.Literal(maximum + 1)
                )
            )
        else:
            for table in TABLES:
                target.execute(sql.SQL("LOCK TABLE {} IN SHARE MODE").format(sql.Identifier(table)))
        report = verify(source, target)
    args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print("Committed successfully; report saved", flush=True)


if __name__ == "__main__":
    main()
