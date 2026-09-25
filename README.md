
## For installing backend, using docker:
	Docker
	docker compose up -d --build
	docker compose exec backend sh
	python manage.py migrate
	
### Option A: Import overture
	python import_overture.py

### Option B: Manually import duckDB file
	docker cp ./map_data/milano.db urbview-backend:/app/map_data/milano.db  

## For installing frontend, using node:
	npm install
	npm run build

## Annotations:
backend runs on port :8000
frontend runs on port :5173
maps and db_file names were hardcoded instead of set via ENV for local OS simplicity, but setup via ENV is functional