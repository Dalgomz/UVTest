from django.db import migrations
from kpi_app.data.duckdb_setup import get_db_connection
from kpi_app.data.place_category_mapper import TABLE_NAME, create_place_taxonomy_mapper

def create_place_taxonomy_table(apps, schema_editor):
  with get_db_connection() as duck_conn:
    create_place_taxonomy_mapper(duck_conn)

def drop_table(apps, schema_editor):
  with get_db_connection() as duck_conn:
    duck_conn.execute(f"DROP TABLE IF EXISTS {TABLE_NAME}")
    
class Migration(migrations.Migration):
    dependencies = []
    operations = [migrations.RunPython(create_place_taxonomy_table, drop_table)]
