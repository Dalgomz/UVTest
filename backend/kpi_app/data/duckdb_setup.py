
from contextlib import contextmanager
from pathlib import Path
import duckdb
from config import settings 

OVERTURE_CATEGORIES = [
  "address",
  "place",
  "building",
  "land",
  "land_use",
  "water",
  "infrastructure",
]
BASE_BBOX = settings.BASE_BBOX
MAP_NAME = settings.MAP_NAME
DB_FOLDER = settings.DB_FOLDER

@contextmanager
def get_db_connection():

  output_path = Path(settings.BASE_DIR) / DB_FOLDER
  duck_connection = duckdb.connect(f"{output_path}/{MAP_NAME}.db")

  try:
    duck_connection.execute("LOAD spatial;")
    yield duck_connection

  finally:
      duck_connection.close()

