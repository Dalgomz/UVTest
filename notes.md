# Notes about the KPIs

| Amenities distribution ||
|-|-|
| measures | The percentage distribution of amenities within an area |
| computed by | Computed using a set of custom taxonomies: $$\frac{\sum single~category}{\sum places} * 100$$ |
| thresholds | High presence of professional services (>15%) → administrative zone; high presence of entertainment and accommodation (>25%) → tourism zone; relatively balanced amenities → well-supplied zone |
| Where they came from | Thresholds pending, created by meon the on the allocation of amenities into specific taxonomies. For example, a high percentage of restaurants and professional services may indicate an office or administrative zone |
--------------

| Commerce-residence ratio ||
|-|-|
| measures | The ratio of commercial places to residential buildings within the same area |
| computed by | Computed as: $$\frac{\sum commerce~places}{\sum residential~buildings}$$ |
| thresholds | 0.1 - typical of sparse areas - 0.25 - typical of residential zones 0.5 - typical of urban areas - 1.0 - typical of central/commercial zones |
| Where they came from | Based on a 2019 Applied Energy paper by Hachem & Grewal, for a the reference value of 0.25 adjusted by the data observed in Milan, as it seemed like a lower bound |
--------------

| Average healthcare distance ||
|-|-|
| measures | The average shortest distance from residential buildings to their nearest healthcare amenity |
| computed by | Computed by matching residential buildings to their nearest healthcare facility, while excluding categories such as pharmacies |
| thresholds | good coverage - 250m - ideal coverage – 500m - minimal recommended coverage - 1km - poor coverage |
| Where they came from | Based on studies concerning appropriate walking distances to healthcare services, including accessibility within approximately 15 minutes of walking (approx 600m)|
--------------

| Land usage ||
|-|-|
| measures | The percentage of area occupied by buildings, green zones, and water bodies |
| computed by | Measuring the area occupied by buildings, green zones, parks, and water bodies relative to the total area |
| thresholds | |
| Building coverage | low - 20% - moderate - 40% - high/compact - 70% |
| Greens and Water coverage | very low - 5% - low - 13% - moderate - 20% - high – 30% - very high  |
| Where they came from | References from studies and datasets concerning urban land use and green infrastructure in the EU, including the EEA, the values are hand fitted |
--------------

| Street intersection density ||
|-|-|
| measures | The density of road intersections within an area |
| computed by | Computed by identifying Overture transportation connectors associated with road segments and identifying connectors that represent branching road junctions |
| thresholds | in intersections/km²: low - 50 – moderate - 100 - high – 200 - very high |
| Where they came from | Based on a IPEN health research studying the relationship between street intersection density and walking frequency |
--------------

| Transport Access Coverage ||
|-|-|
| measures | The percentage of the area located within 100, 250, and 500 meters of public transport stations or stops |
| computed by | Computing the union of the areas covered by buffers around public transport stations and stops, and comparing the resulting covered area with the total area |
| thresholds | Coverage at 500 m: poor coverage - 20% low coverage – 50% - good/ideal – 80% - very high coverage |
| Where they came from | Based on studies and guidelines concerning typical walking distances to public transport, including approximately 400 m as a common target distance and 600 m as a maximum walking distance in urban transport studies |
