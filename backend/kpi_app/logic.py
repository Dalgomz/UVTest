
from kpi_app.data.duckdb_setup import get_db_connection
from kpi_app.data import kpi_repository as repo
from kpi_app.data.kpi_dto import KPI_dto

def generate_area_kpis(polygon_coords):
  with get_db_connection() as duck_conn:
    kpi_dto = KPI_dto()
    kpi_dto.area_km2 = repo.get_poly_area(duck_conn, polygon_coords)
    kpi_dto.add_kpi(repo.commerce_residence_ratio(duck_conn, polygon_coords))
    kpi_dto.add_kpi(repo.public_transport_coverage(duck_conn, polygon_coords))
    kpi_dto.add_kpi(repo.land_coverage(duck_conn, polygon_coords, kpi_dto.area_km2))
    kpi_dto.add_kpi(repo.amenities_distribution(duck_conn, polygon_coords))
    # kpi_dto.add_kpi(repo.street_intersection_density(duck_conn, polygon_coords, kpi_dto.area_km2))
    # kpi_dto.add_kpi(repo.health_care_avg_distance(duck_conn, polygon_coords))
    return kpi_dto