import duckdb
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)

def download_map_data(map_name, bbox):
    output_path = Path() / "map_data"
    output_path.mkdir(parents=True, exist_ok=True)
    west, south, east, north = bbox

    BASE = "s3://overturemaps-us-west-2/release/2026-08-19.0"
    categories_paths = {
        "address": f"{BASE}/theme=addresses/type=address/*",
        "place": f"{BASE}/theme=places/type=place/*",
        "building": f"{BASE}/theme=buildings/type=building/*",
        "land": f"{BASE}/theme=base/type=land/*",
        "land_usage": f"{BASE}/theme=base/type=land_use/*",
        "water": f"{BASE}/theme=base/type=water/*",
        "infrastructure": f"{BASE}/theme=base/type=infrastructure/*",
    }

    with duckdb.connect(f"{output_path}/{map_name}.db") as duck_con:
        duck_con.execute("PRAGMA enable_progress_bar;")
        duck_con.execute("INSTALL spatial")
        duck_con.execute("LOAD spatial")
        duck_con.execute("INSTALL httpfs")
        duck_con.execute("LOAD httpfs")
        duck_con.execute("SET s3_region='us-west-2'")

        for category in categories_paths:
            logging.info(f"Downloading {map_name}'s {category} data")
            duck_con.execute(f"""
                CREATE OR REPLACE TABLE {category} AS
                SELECT *
                FROM read_parquet(
                    '{categories_paths[category]}',
                    filename=true,
                    hive_partitioning=true
                )
                WHERE
                    bbox.xmin < {east}
                    AND bbox.xmax > {west}
                    AND bbox.ymin < {north}
                    AND bbox.ymax > {south}
            """)
            logging.info(f"Done")

        duck_con.close()

    logging.info(f" Map: {map_name} - data download completed")
    
if __name__ == "__main__":
    # w, s, e, n
    # download_map_data("milano", (9.194334, 45.471917, 9.218495, 45.487082))

    output_path = Path() / "map_data"
    with duckdb.connect(f"{Path()}/map_data/milano.db") as connection:
        connection.sql("SELECT COUNT(*) FROM building").show()