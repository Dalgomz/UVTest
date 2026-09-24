import { useState, useEffect, use } from 'react'
import MapViewer from '@/components/MapViewer'
import Dashboard from '@/components/Dashboard'
import '@/App.css'
import api from '@/api';
import PenIcon from '@/assets/pen.svg?react';

import { MAP_BBOX, MAP_PADDING } from '@/config/mapConfig'

function App() {
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

  useEffect(() => { fetchKpis() }, []);
  useEffect(() => {
    if (isDrawing) return;
    fetchKpis();
  }, [isDrawing, selectionArea])
  
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
        <Dashboard
          kpiData={kpiData}
          loading={lockDrawing}
        />
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
        />
      </section>
    </>
  )
}

export default App
