import shapely
from duckdb import DuckDBPyConnection

from kpi_app.data.kpi_dto import KPI
from kpi_app.data.duckdb_setup import BASE_BBOX

def get_poly_area(duck_conn: DuckDBPyConnection, polygon_coords=[]):
  poly = parse_selection_shape(polygon_coords)
  area_m2 = duck_conn.execute(f"SELECT ST_Area_Spheroid(ST_GeomFromText(?))", [poly.wkt]).fetchone()[0]
  return area_m2 / 1000000

def gen_polygon_condition(polygon_coords, geometry_field='geometry'):
  if len(polygon_coords) < 3:
    return None
  
  polygon_shape = shapely.Polygon(polygon_coords)

  condition = f"ST_Intersects({geometry_field}, ST_GeomFromText('{polygon_shape.wkt}'))"
  return condition

def parse_selection_shape(polygon_coords):
  if len(polygon_coords) < 3:
    W, S, E, N = BASE_BBOX
    return shapely.box(W, S, E, N)
  else:
    return shapely.Polygon(polygon_coords)

def commerce_residence_ratio(duck_conn: DuckDBPyConnection, polygon_coords=[]) -> KPI:
  kpi_object = KPI(
    key="commerce_residence_ratio",
    label="Commerce-to-residential ratio", 
    unit="commercial places per residential building",
    definition="This measures the of commercial places in relation to the residential buildings in the area "
  )

  commerce_categories = ','.join(f"'{c}'" for c in [
    'Food & Drinks', 
    'Shopping',
    "Personal Services",
    "Accommodation",
    "Culture & Entertainment",
    "Sports",
  ])

  polygon_filter = gen_polygon_condition(polygon_coords)

  query = f"""
    WITH commerce as (SELECT
      COUNT(*) AS commerce_count
    FROM place p
      LEFT JOIN place_category_taxonomy t
      ON p.categories.primary = t.place_category
    WHERE
      t.kpi_category IN ({commerce_categories})
      { "AND "+ polygon_filter if polygon_filter is not None else "" }
    ),
    
    residential AS (
      SELECT COUNT(*) AS residential_count
      FROM building
      WHERE
        subtype = 'residential'
      { "AND "+ polygon_filter if polygon_filter is not None else "" }
    )

    SELECT
      commerce_count * 1.0 / NULLIF(residential_count, 0) AS commerce_per_residential_building
    FROM commerce, residential;
  """

  try:
    kpi_object.value = duck_conn.execute(query).fetchone()[0]
    kpi_object.band = "No band set"
    return kpi_object
  except:
    raise

def public_transport_coverage(duck_conn: DuckDBPyConnection, polygon_coords=[]) -> KPI:
  kpi_object = KPI(
    key="transport_accessibility_coverage",
    label="Public transport coverage", 
    unit=["% at 100m", "% at 250m", "% at 500m"],
    definition="This measures the coverage % of transport network access stepped by distance"
  )

  polygon_shape = parse_selection_shape(polygon_coords)
  c = polygon_shape.centroid
  local_crs = f"+proj=aeqd +lat_0={c.y} +lon_0={c.x} +datum=WGS84 +units=m +no_defs"

  transport_classes = ','.join(f"'{c}'" for c in [
    "stop_position",
    "platform",
    "bus_stop",
    "subway_station",
    "bus_station",
    "railway_station",
  ])

  query = f"""
    WITH selection AS (
      SELECT ST_Transform(ST_GeomFromText('{polygon_shape.wkt}'), 'OGC:CRS84', '{local_crs}') AS geometry
    ),

    transit AS (
      SELECT
        i.geometry AS geometry
      FROM infrastructure i
      WHERE i.subtype = 'transit'
      AND i.class IN ({transport_classes})
    ),

    radius AS (
      SELECT
        ST_Union_Agg(ST_Buffer(geometry, 100)) AS buffer_100,
        ST_Union_Agg(ST_Buffer(geometry, 250)) AS buffer_250,
        ST_Union_Agg(ST_Buffer(geometry, 500)) AS buffer_500
      FROM transit
    )

    SELECT
      ST_Area(ST_Intersection(s.geometry, r.buffer_100)) / ST_Area(s.geometry) AS coverage_100m,

      ST_Area(ST_Intersection(s.geometry, r.buffer_250)) / ST_Area(s.geometry) AS coverage_250m,

      ST_Area(ST_Intersection(s.geometry, r.buffer_500)) / ST_Area(s.geometry) AS coverage_500m

    FROM radius r
    CROSS JOIN selection s;
  """

  try:
    kpi_object.value = duck_conn.execute(query).fetchone()
    kpi_object.band = "No band set"
    return kpi_object
  except:
    raise


def health_care_avg_distance(duck_conn: DuckDBPyConnection, polygon_coords=[], area_km2=None):
  kpi_object = KPI(
    key="health_care_avg_distance",
    label="Nearest health services average distance", 
    unit="m",
    definition="The averge distance between residential blocks and their nearesh health service"
  )

  categories_filter = ','.join(f"'{c}'" for c in [
    "hospital",
    "clinic",
    "medical_center",
    "health_center",
    "medical_clinic",
    "specialist_clinic",
    "emergency_room",
    "urgent_care"
  ])
  polygon_filter = gen_polygon_condition(polygon_coords)
  c = parse_selection_shape(polygon_coords).centroid
  local_crs = f"+proj=aeqd +lat_0={c.y} +lon_0={c.x} +datum=WGS84 +units=m +no_defs"

  query = f"""
    WITH residential AS (
      SELECT
        id,
        ST_Transform(geometry, 'OGC:CRS84', '{local_crs}') AS geometry
      FROM building
      WHERE
        subtype = 'residential'
        { "AND " + polygon_filter if polygon_filter is not None else "" }
    ),

    healthcare AS (
      SELECT ST_Transform(geometry, 'OGC:CRS84', '{local_crs}') AS geometry
      FROM place
      WHERE categories.primary IN ({categories_filter})
    ),

    nearest_healthcare AS (
      SELECT
        r.id,
        MIN(ST_Distance(r.geometry, h.geometry)) AS nearest_distance_m
      FROM residential r
      CROSS JOIN healthcare h
      GROUP BY r.id
    )

    SELECT AVG(nearest_distance_m) AS average_distance_to_healthcare_m
    FROM nearest_healthcare;
  """

  try:
    kpi_object.value = duck_conn.execute(query).fetchone()[0]
    kpi_object.band = "No band set"
    return kpi_object
  except:
    raise

def land_coverage(duck_conn: DuckDBPyConnection, polygon_coords=[], total_area=None):
  kpi_object = KPI(
    key="land_coverage",
    label="Area usage & coverage", 
    unit=["% on Buildings", "% on Green zones", "% on Water bodies"],
    definition="This measures how much of an area is beign used by buildings, green zones, and water bodies"
  )

  land_categories = ','.join(f"'{c}'" for c in [
    "park",
    "garden",
    "flowerbed",
    "grass",
    "pitch",
    "playground",
    "dog_park",
    "protected_landscape_seascape"
  ])
  water_categories = ','.join(f"'{c}'" for c in [
    "reflecting_pool",
    "pond",
    "canal",
    "stream",
    "basin",
    "lake",
    "river"
  ])
  
  polygon_filter = gen_polygon_condition(polygon_coords)
  polygon_shape = parse_selection_shape(polygon_coords)

  query = f"""
    WITH building_area AS (
      SELECT
        COALESCE(SUM(ST_Area_Spheroid(geometry)), 0) AS area_m2
      FROM building
      { "WHERE "+ polygon_filter if polygon_filter is not None else "" }
    ),

    green_area AS (
      SELECT
        COALESCE(
          ST_Area_Spheroid(
            ST_Union_Agg(
              ST_Intersection(
                geometry,
                ST_GeomFromText('{polygon_shape.wkt}')
              )
            )
          ),
          0
        ) AS area_m2
      FROM land_use
      WHERE class IN ({land_categories})
      { "AND "+ polygon_filter if polygon_filter is not None else "" }
    ),

    water_area AS (
      SELECT
        COALESCE(
          ST_Area_Spheroid(
            ST_Union_Agg(
              ST_Intersection(
                geometry, 
                ST_GeomFromText('{polygon_shape.wkt}')
              )
            )
          ),
          0
        ) AS area_m2
      FROM water
      WHERE class IN ({water_categories})
      { "AND "+ polygon_filter if polygon_filter is not None else "" }
    )

    SELECT
      building_area.area_m2 / 1000000 AS built_area_m2,
      green_area.area_m2 / 1000000 AS green_area_m2,
      water_area.area_m2 / 1000000 AS water_area_m2

    FROM building_area
    CROSS JOIN green_area
    CROSS JOIN water_area;
  """

  try:
    area_data = duck_conn.execute(query).fetchone()
    kpi_object.value = [a/total_area for a in area_data]
    kpi_object.band = "No band set"
    return kpi_object
  except:
    raise

def amenities_distribution(duck_conn: DuckDBPyConnection, polygon_coords=[]):
  kpi_object = KPI(
    key="amenities_distribution",
    label="Amenities distribution", 
    unit="%",
    definition="This measures the amenities distribution in percentages of the area"
  )

  polygon_filter = gen_polygon_condition(polygon_coords)

  query = f"""
    SELECT
        t.kpi_category AS category,
        COUNT(*) / SUM(COUNT(*)) OVER () AS percentage
    FROM 
      place p
      LEFT JOIN place_category_taxonomy t
          ON p.categories.primary = t.place_category
    WHERE 
      category IS NOT NULL
      { "AND " + polygon_filter if polygon_filter is not None else "" }
    GROUP BY t.kpi_category
    ORDER BY percentage DESC;
  """
  
  try:
    kpi_object.value = duck_conn.execute(query).fetchall()
    kpi_object.band = "No band set"
    return kpi_object
  except:
    raise

def street_intersection_density(duck_conn: DuckDBPyConnection, polygon_coords=[], area_km2=None):
  kpi_object = KPI(
    key="street_intersection_density",
    label="Street Intersection density", 
    unit="/km2",
    definition="Density of streets' road intersections per km 2"
  )

  main_road_classes = ','.join(f"'{c}'" for c in [
    "residential",
    "tertiary",
    "secondary",
    "primary",
    "service",
  ])
  restricted_classes = ','.join(f"'{c}'" for c in [
    "parking_aisle",
    "driveway",
  ])

  connector_filter = gen_polygon_condition(polygon_coords, geometry_field='c.geometry')

  query = f"""
    WITH road_connector_positions AS (
      SELECT
        c.connector_id,
        c.at,
        s.id AS segment_id
      FROM 
        segment s, UNNEST(s.connectors) AS u(c)
      WHERE 
        s.subtype = 'road'
        AND s.class IN ({main_road_classes})
        AND (
          s.subclass IS NULL
          OR s.subclass NOT IN ({restricted_classes})
        )
    ),
    road_intersection_ids AS (
      SELECT connector_id
      FROM road_connector_positions
      GROUP BY connector_id
      HAVING (
        COUNT(DISTINCT CASE WHEN "at" = 0.0 THEN segment_id END) >= 2
        AND
        COUNT(DISTINCT CASE WHEN "at" = 1.0 THEN segment_id END) >= 1
      )
      OR (
        COUNT(DISTINCT CASE WHEN "at" = 1.0 THEN segment_id END) >= 2
        AND
        COUNT(DISTINCT CASE WHEN "at" = 0.0 THEN segment_id END) >= 1
      )
    ),
    road_intersections AS (
      SELECT
        c.geometry
      FROM connector c
      INNER JOIN road_intersection_ids r
        ON c.id = r.connector_id
      { "WHERE " + connector_filter if connector_filter is not None else "" }
    )

    SELECT COUNT(*) AS intersection_count
    FROM road_intersections;
  """
  
  try:
    crosses = duck_conn.execute(query).fetchone()
    kpi_object.value = crosses[0] / area_km2 
    kpi_object.band = "No band set"
    return kpi_object
  except:
    raise
