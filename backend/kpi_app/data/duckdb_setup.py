
from contextlib import contextmanager
from pathlib import Path
import duckdb
from config import settings 

# Add to ENV ->
OVERTURE_CATEGORIES = [
  "address",
  "place",
  "building",
  "land",
  "land_use",
  "water",
  "infrastructure",
]
BASE_BBOX = [9.194334, 45.471917, 9.218495, 45.487082]
MAP_NAME = 'milano'
DB_FOLDER = 'map_data'
# <- END OF Add to ENV

@contextmanager
def get_db_connection():

  output_path = Path(settings.BASE_DIR) / DB_FOLDER
  duck_connection = duckdb.connect(f"{output_path}/{MAP_NAME}.db")

  try:
    # duck_connection.execute("INSTALL spatial;")
    duck_connection.execute("LOAD spatial;")
    yield duck_connection

  finally:
      duck_connection.close()

