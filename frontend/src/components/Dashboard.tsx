import PanelKPI from './KPIPanel';

type DashboardProps = {
  areaSize: number | null; 
  kpiList: Kpi[];
}

export default function Dashboard({
  kpiList = [],
  areaSize = null,
} : DashboardProps) {
  return (<div className='flex flex-col'>
    <div>
    Selection: {areaSize?.toFixed(2) ?? "-"} km²
    </div>
    { kpiList.map((kpi) => (
      <PanelKPI key={kpi.key} kpiData={kpi}></PanelKPI>
    )) }
  </div>)
}