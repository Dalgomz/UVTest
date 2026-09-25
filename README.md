

Docker 

cd backend
docker compose up -d --build

# Entrar al contenedor:
docker compose exec backend sh

# Opción A: generar milano.db desde Overture (una sola vez, cuando quieras)
python import_overture.py

# Opción B: copiar tu propio milano.db desde el host (sin entrar al contenedor)
docker cp ./map_data/milano.db urbview-backend:/app/map_data/milano.db

# Migrar cuando quieras (no es automático):
python manage.py migrate