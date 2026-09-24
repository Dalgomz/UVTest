type PanelKPIProps = {
  kpiData: Kpi;
};

export default function PanelKPI({ kpiData }: PanelKPIProps) {

  function formatValueUnits(value: number, index: number, unit: string|string[]): string {
    const target = Array.isArray(unit) ? unit[index] : unit;
    const displayValue = target.includes('%') ? value * 100 : value;
    return displayValue.toFixed(1);
  } 

  return (<div className="kpi-panel">
    <div className="panel-label">{kpiData.label}</div>
    <div className="panel-band">{'> '}{kpiData.band}</div>
    <p className="panel-def">- {kpiData.definition}</p>
    { kpiData.key !== 'amenities_distribution' && Array.isArray(kpiData.value) && (
      kpiData.value.map((k, i) => (
        <div key={i}>
          <span className="panel-value">{formatValueUnits(k, i, kpiData.unit)}</span>{' '}
          <span className="panel-uom">{Array.isArray(kpiData.unit) ? kpiData.unit[i]: kpiData.unit}</span>
        </div>
      ))
    )}
    { kpiData.key !== 'amenities_distribution' && !Array.isArray(kpiData.value) && (
      <>
        <span className="panel-value">{formatValueUnits(kpiData.value, 0, kpiData.unit)}</span>{' '}
        <span className="panel-uom">{kpiData.unit}</span>
      </>
    )}
    { kpiData.key === 'amenities_distribution' && Array.isArray(kpiData.value) && (
      kpiData.value.map((k: any, i) => (
        <div key={i}>
          <span className="panel-small-value">{k[0]} - {formatValueUnits(k[1], 0, kpiData.unit)}</span>{' '}
          <span className="panel-uom">{kpiData.unit}</span>
        </div>
      ))
    )}
    
  </div>)
}