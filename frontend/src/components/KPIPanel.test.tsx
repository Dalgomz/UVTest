import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PanelKPI from './KPIPanel'

describe('PanelKPI', () => {
  it('converts decimal values to percentages', () => {
    render(
      <PanelKPI
        kpiData={{
          key: 'green_area',
          label: 'Green area',
          value: 0.425,
          unit: '%',
          band: 'good',
          definition: 'Percentage of green area',
        }}
      />
    )

    expect(screen.getByText('42.5')).toBeInTheDocument()
    expect(screen.getByText('%')).toBeInTheDocument()
  })

  it('shows a fallback when the KPI has no data', () => {
    render(
      <PanelKPI
        kpiData={{
          key: 'population',
          label: 'Population',
          value: [],
          unit: 'people',
          band: 'good',
          definition: 'Population in the selected area',
        }}
      />
    )

    expect(screen.getByText('> Unknown')).toBeInTheDocument()
    expect(screen.getByText('No data found for this KPI')).toBeInTheDocument()
  })
})
