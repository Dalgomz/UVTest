class KPI():
  def __init__(self, key=None, label=None, value=None, unit=None, band=None, definition=None):
    self.key = key
    self.label = label
    self.value = value
    self.unit = unit
    self.band = band
    self.definition = definition

  def to_dict(self):
    return { 
      "key": self.key,
      "label": self.label,
      "value": self.value,
      "unit": self.unit,
      "band": self.band,
      "definition": self.definition,
    }

class KPI_dto():
  def __init__(
    self,
    area_name: str = "selection",
    area_km2: float = 0,
    kpis: list[KPI] | None = None,
    insights: list[str] | None = None
  ):
    self.area_name = area_name
    self.area_km2 = area_km2
    self.kpis = kpis or []
    self.insights = insights or []

  def add_kpi(self, new_kpi: KPI):
    self.kpis.append(new_kpi)

  def to_dict(self) -> dict:
    return {
      "area": {
        "name": self.area_name,
        "km2": self.area_km2,
      },
      "kpis": [kpi.to_dict() for kpi in self.kpis],
      "insights": self.insights,
    }
  