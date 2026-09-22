
echo "Checking / Installing overture CLI"
pip show overturemaps > /dev/null 2>&1 || pip install overturemaps

overturemaps download --bbox=9.194334,45.471917,9.218495,45.487082 -f geojson --type=transportation -o milano_transportation.geojson
overturemaps download --bbox=9.194334,45.471917,9.218495,45.487082 -f geojson --type=place -o milano_place.geojson
overturemaps download --bbox=9.194334,45.471917,9.218495,45.487082 -f geojson --type=building -o milano_building.geojson
overturemaps download --bbox=9.194334,45.471917,9.218495,45.487082 -f geojson --type=land,land_use -o milano_infrastructure.geojson
overturemaps download --bbox=9.194334,45.471917,9.218495,45.487082 -f geojson --type=infrastructure -o milano_infrastructure.geojson