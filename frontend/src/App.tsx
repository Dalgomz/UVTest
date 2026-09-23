import { useState } from 'react'
import MapViewer from './components/MapViewer'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [kpiList, setKpiList] = useState<Kpi[]>([])
  const [selectionArea, setSelectionArea] = useState<Coords[]>([]);

  function updateSelection(newSelection: Coords[]) {
    setSelectionArea(newSelection);
  }

  function calcAreaSize(): number {
    return selectionArea.length;
  }

  return (
    <>
      <section id="dashboard-container">
        <button onClick={() => setKpiList((prev) => [...prev, {} as Kpi]) }>
          Add KPI
        </button>
        <Dashboard
          kpiList={kpiList}
          areaSize={calcAreaSize()}
        />
      </section>
      <section id="map-container">
        <MapViewer
          className="fill-container"
          bounds={[9.194334, 45.471917, 9.218495, 45.487082]}
          boundsPadding={0.25}
          lockToBounds
          onMapClick={(longLat: Coords) => console.log(longLat)}
          selectionCallback={updateSelection}
        />
      </section>
    </>
  )
}

export default App
