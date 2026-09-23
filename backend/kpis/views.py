from django.http import JsonResponse, HttpResponse

def health(request):
  return HttpResponse(status=200)

def kpi_from_polygon(request, polygon):
  # Set status
  # Filter n Query DB
  # Scan data
  # Build KPIs
  kpis = {}
  return JsonResponse(kpis)