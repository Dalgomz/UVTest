import { useState, useEffect, use } from 'react'
import MapViewer from '@/components/MapViewer'
import Dashboard from '@/components/Dashboard'
import '@/App.css'
import api from '@/api';
import { MAP_BBOX, MAP_PADDING } from '@/config/mapConfig'

function App() {
  const [areaSize, setAreaSize] = useState<number>(0);
  const [kpiList, setKpiList] = useState<Kpi[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [selectionArea, setSelectionArea] = useState<Coords[]>([]);

  function updateSelection(newSelection: Coords[]) {
    setSelectionArea(newSelection);
    if (isDrawing) return;
    fetchKpis();
  }

  function clearSelection() {
    setSelectionArea([]);
    setIsDrawing(true);
    setIsDrawing(false);
    fetchKpis();
  }

  function lockDrawing() {}
  function unlockDrawing() {}

  async function fetchKpis() {
    lockDrawing();
    try {
      const response = await api.getKpi(selectionArea);
      setAreaSize(response.area.km2);
    } catch (e) {
      console.error(e);
    }
    unlockDrawing();
  }

  useEffect(() => {}, [selectionArea, isDrawing]);

  useEffect(() => { fetchKpis() }, []);
  
  return (
    <>
      <section id="dashboard-container">
        <div>
          {selectionArea.map((s) => (<><div>{s[0]}<br/>{s[1]}.</div></>))}
        </div>
        <div>
          <button onClick={() => clearSelection() }>
            Clear selection
          </button>
        </div>
        <div>
          <button onClick={() => setIsDrawing(!isDrawing) }>
            {isDrawing ? "Disable" : "Enable" } drawing
          </button>
        </div>
        <Dashboard
          kpiList={kpiList}
          areaSize={areaSize}
        />
      </section>
      <section id="map-container">
        <MapViewer
          className="fill-container"
          bounds={MAP_BBOX}
          boundsPadding={MAP_PADDING}
          lockToBounds
          enableDrawing={isDrawing}
          onMapClick={(longLat) => console.log(longLat)}
          selectionCallback={updateSelection}
          stopDrawModeCallback={() => setIsDrawing(false)}
        />
      </section>
    </>
  )
}

export default App
