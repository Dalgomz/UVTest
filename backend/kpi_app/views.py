import logging

from django.http import JsonResponse, HttpResponse
from rest_framework.decorators import api_view
from kpi_app.logic import generate_area_kpis
from kpi_app.data.kpi_dto import KPI_dto
import json

@api_view(["GET"])
def health(request):
  return HttpResponse(status=200)

@api_view(["POST"])
def kpi_from_polygon(request):
  try:
    polygon = json.loads(request.body)
  except:
    polygon = []
    logging.warning("Could not load polygon, using whole area")

  if not polygon:
    polygon = []

  kpis: KPI_dto = generate_area_kpis(polygon)
  
  return JsonResponse(kpis.to_dict())