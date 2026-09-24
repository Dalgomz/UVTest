import { useState, useEffect, use } from 'react'
import MapViewer from '@/components/MapViewer'
import Dashboard from '@/components/Dashboard'
import '@/App.css'
import api from '@/api';
import PenIcon from '@/assets/pen.svg?react';

import { MAP_BBOX, MAP_PADDING } from '@/config/mapConfig'

function App() {
  const [resetSignal, setResetSignal] = useState<number>(0);
  const [kpiData, setKpiData] = useState<ResponseKPI | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lockDrawing, setLockDrawing] = useState<boolean>(false);
  const [selectionArea, setSelectionArea] = useState<Coords[]>([]);

  function updateSelection(newSelection: Coords[]) {
    setSelectionArea(newSelection);
  }

  function clearSelection() {
    setSelectionArea([]);
    setIsDrawing(false);
    setResetSignal((resetSignal + 1) % 3);
  }

  async function fetchKpis() {
    setLockDrawing(true);
    try {
      const response = await api.getKpi(selectionArea);
      setKpiData(response);
    } catch (e) {
      console.error(e);
    }
    setLockDrawing(false);
  }

  useEffect(() => {
    fetchKpis();
  }, [selectionArea])
  
  return (
    <>
      <section id="dashboard-container">
        <div style={{gap: "8px"}} className="flex button-header" >
          <button 
            className="col" 
            disabled={lockDrawing || selectionArea.length === 0 && !isDrawing} 
            onClick={clearSelection}
          >
            Clear selection
          </button>
          <button
            className={`col ${isDrawing && 'drawing'}`}
            disabled={lockDrawing}
            onClick={() => setIsDrawing(!isDrawing) }
          >
            <PenIcon width="1rem" height="1rem" />
            {isDrawing ? "Drawing..." : "Draw area" }
          </button>
        </div>
        <div style={{flexGrow: 1}}>
          <Dashboard
            kpiData={kpiData}
            loading={lockDrawing}
          />
        </div>
      </section>
      <section id="map-container">
        <MapViewer
          className="fill-container"
          bounds={MAP_BBOX}
          boundsPadding={MAP_PADDING}
          lockToBounds
          enableDrawing={isDrawing}
          selectionCallback={updateSelection}
          stopDrawModeCallback={() => setIsDrawing(false)}
          resetSignal={resetSignal}
        />
      </section>
    </>
  )
}

export default App
