import { useEffect, useState } from 'react';
import PanelKPI from './KPIPanel';
import SpinnerIcon from '@/assets/spinner.svg?react';

type DashboardProps = {
  kpiData?: ResponseKPI | null;
  loading: boolean;
}

export default function Dashboard({
  kpiData = null,
  loading = false,
} : DashboardProps) {
  const [area, setArea] = useState();

  useEffect(() => {}, [kpiData])
  return (<>
    <div style={{position: "relative"}} className='flex flex-col'>
      { loading && 
        <div
          style={{height: "100%", width: "100%", opacity: "70%", backgroundColor:"#F6F4EE", position: "absolute" }}
          className="flex justify-center align-center"
        >
          <SpinnerIcon width={60} height={60} className="spinner"/>
        </div>
      }
      <div className="flex flex-col">
        <div>
        Selection: {kpiData?.area.km2.toFixed(2) ?? "-"} km²
        </div>
        { kpiData?.kpis.map((kpi) => (
          <PanelKPI key={kpi.key} kpiData={kpi}></PanelKPI>
        )) }
      </div>
    </div>
  </>)
}