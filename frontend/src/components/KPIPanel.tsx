type PanelKPIProps = {
  kpiData: Kpi;
};

export default function PanelKPI({ kpiData }: PanelKPIProps) {
  return (<div>
    KPI PANEL
    key: "{kpiData.key}"
  </div>)
}