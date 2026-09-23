import { useState } from 'react'
import MapViewer from './components/MapViewer'
import Dashboard from './components/Dashboard'
import './App.css'

function App() {
  const [kpiList, setKpiList] = useState<Kpi[]>([])
  const [isDrawing, setIsDrawing] = useState<boolean>(false)
  const [selectionArea, setSelectionArea] = useState<Coords[]>([]);

  function updateSelection(newSelection: Coords[]) {
    setSelectionArea(newSelection);
    console.log(newSelection);
  }

  function calcAreaSize(): number {
    return selectionArea.length;
  }

  return (
    <>
      <section id="dashboard-container">
        <div>
          <button onClick={() => setKpiList((prev) => [...prev, {} as Kpi]) }>
            Add KPI
          </button>
        </div>
        <div>
          <button onClick={() => setIsDrawing(!isDrawing) }>
            {isDrawing ? "Disable" : "Enable" } drawing
          </button>
        </div>
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
          enableDrawing={isDrawing}
          onMapClick={(longLat) => console.log(longLat)}
          selectionCallback={updateSelection}
          stopDrawModeCallback={() => setIsDrawing(false)}
          // Add stop drawing callback
        />
      </section>
    </>
  )
}

export default App
