import psycopg

from app.models.city import City, CreateCity


class CityRepository:
    def __init__(self, connection: psycopg.Connection[dict]) -> None:
        self.connection = connection

    def create(self, data: CreateCity) -> City:
        cursor = self.connection.execute(
            """
            INSERT INTO cities (
                slug,
                name,
                country_code,
                latitude,
                longitude
            )
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (name, country_code) DO NOTHING
            RETURNING id
            """,
            (
                data.slug,
                data.name,
                data.country_code,
                data.latitude,
                data.longitude,
            ),
        )

        row = cursor.fetchone()
        if row is None:
            city = self.get_by_name_and_country(data.name, data.country_code)
        else:
            city = self.get_by_id(row["id"])

        if city is None:
            raise RuntimeError("Created or existing city could not be read from database")

        return city

    def get_by_id(self, city_id: int) -> City | None:
        cursor = self.connection.execute(
            """
            SELECT
                id,
                slug,
                name,
                country_code,
                latitude,
                longitude
            FROM cities
            WHERE id = %s
            """,
            (city_id,),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return self._row_to_city(row)

    def get_by_name_and_country(
        self,
        name: str,
        country_code: str,
    ) -> City | None:
        cursor = self.connection.execute(
            """
            SELECT
                id,
                slug,
                name,
                country_code,
                latitude,
                longitude
            FROM cities
            WHERE name = %s
              AND country_code = %s
            """,
            (
                name,
                country_code,
            ),
        )

        row = cursor.fetchone()

        if row is None:
            return None

        return self._row_to_city(row)

    def get_all(self) -> list[City]:
        cursor = self.connection.execute(
            """
            SELECT
                id,
                slug,
                name,
                country_code,
                latitude,
                longitude
            FROM cities
            ORDER BY country_code, name
            """
        )

        rows = cursor.fetchall()

        return [self._row_to_city(row) for row in rows]

    def update_slug(self, city_id: int, slug: str) -> City:
        self.connection.execute(
            "UPDATE cities SET slug = %s WHERE id = %s",
            (slug, city_id),
        )

        city = self.get_by_id(city_id)
        if city is None:
            raise RuntimeError("Updated city could not be read from database")

        return city

    def delete_by_id(self, city_id: int) -> bool:
        cursor = self.connection.execute(
            """
            DELETE FROM cities
            WHERE id = %s
            """,
            (city_id,),
        )

        return cursor.rowcount > 0

    @staticmethod
    def _row_to_city(row: dict) -> City:
        return City(
            id=row["id"],
            slug=row["slug"],
            name=row["name"],
            country_code=row["country_code"],
            latitude=row["latitude"],
            longitude=row["longitude"],
        )
