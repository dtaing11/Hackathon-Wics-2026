export function buildBaseModelStyle(cameraHeading: number): any {
  return {
    modelId: ['get', 'modelId'],
    modelType: 'common-3d',
    // Keep the chat-pin GLB uniformly scaled so it does not stretch.
    modelScale: [2.8, 2.8, 2.8],
    // Rotate only around the vertical axis so the model keeps facing the camera.
    modelRotation: [0, 0, cameraHeading + 90],
    modelTranslation: [0, 0, 0],
    modelOpacity: 0.95,
    modelCastShadows: true,
    modelReceiveShadows: true,
    modelColorMixIntensity: 0.7,
    modelColor: [
      'case',
      ['boolean', ['get', 'isBad'], false],
      '#ef4444',
      '#22c55e',
    ],
  };
}

export function buildSelectedModelStyle(cameraHeading: number): any {
  return {
    modelId: ['get', 'modelId'],
    modelType: 'common-3d',
    modelScale: [3.3, 3.3, 3.3],
    modelRotation: [0, 0, cameraHeading + 180],
    modelTranslation: [0, 0, 1],
    modelOpacity: 1,
    modelColorMixIntensity: 1,
    modelColor: '#f59e0b',
  };
}

export function buildPlayerModelStyle(): any {
  return {
    modelId: ['get', 'modelId'],
    modelType: 'common-3d',
    modelScale: [1.8, 1.8, 1.8],
    modelRotation: [0, 0, ['get', 'heading']],
    modelTranslation: [0, 0, 0.5],
    modelOpacity: 1,
    modelColorMixIntensity: 0.15,
    modelColor: '#0f172a',
    modelCastShadows: true,
    modelReceiveShadows: true,
  };
}

export const poleHitAreaStyle = {
  circleRadius: 18,
  circleOpacity: 0.01,
  circleStrokeOpacity: 0,
};

export const prettySkyStyle: any = {
  skyType: 'gradient',
  skyGradientCenter: [0, 0],
  skyGradientRadius: 90,
  skyGradient: [
    'interpolate',
    ['linear'],
    ['sky-radial-progress'],
    0.75,
    '#009cff',
    0.88,
    '#009cff',
    1,
    '#009cff',
  ],
  skyOpacity: 0.9,
};

export const daytimeFogStyle: any = {
  range: [1.2, 7],
  color: '#fdfbf7',
  highColor: '#d9effd',
  spaceColor: '#e0f2fe',
  horizonBlend: 0.07,
  starIntensity: 0,
  verticalRange: [150, 360],
};

export const buildingExtrusionStyle: any = {
  fillExtrusionColor: '#cbd5e1',
  fillExtrusionOpacity: 0.55,
  fillExtrusionHeight: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['coalesce', ['get', 'height'], 0],
  ],
  fillExtrusionBase: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['coalesce', ['get', 'min_height'], 0],
  ],
};


export const gamifiedMapStyle: any = {
  version: 8,
  name: 'Gamified Minimal',
  sources: {
    composite: {
      url: 'mapbox://mapbox.mapbox-streets-v8',
      type: 'vector',
    },
  },
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    // ═══════════════════════════════════════════════════════════════
    // BACKGROUND - Deep slate base matching your UI
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#1e293b', // slate-800
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // LANDUSE - Soft, game-like colored zones
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'park'],
      paint: {
        'fill-color': '#166534', // green-800
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'landuse-grass',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'grass'],
      paint: {
        'fill-color': '#15803d', // green-700
        'fill-opacity': 0.4,
      },
    },
    {
      id: 'landuse-wood',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'wood'],
      paint: {
        'fill-color': '#14532d', // green-900
        'fill-opacity': 0.5,
      },
    },
    {
      id: 'landuse-pitch',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'pitch'],
      paint: {
        'fill-color': '#16a34a', // green-600
        'fill-opacity': 0.35,
      },
    },
    {
      id: 'landuse-cemetery',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'cemetery'],
      paint: {
        'fill-color': '#334155', // slate-700
        'fill-opacity': 0.4,
      },
    },
    {
      id: 'landuse-hospital',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'hospital'],
      paint: {
        'fill-color': '#be185d', // pink-700
        'fill-opacity': 0.25,
      },
    },
    {
      id: 'landuse-school',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'school'],
      paint: {
        'fill-color': '#c2410c', // orange-700
        'fill-opacity': 0.25,
      },
    },
    {
      id: 'landuse-commercial',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'commercial_area'],
      paint: {
        'fill-color': '#475569', // slate-600
        'fill-opacity': 0.3,
      },
    },
    {
      id: 'landuse-industrial',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'industrial'],
      paint: {
        'fill-color': '#64748b', // slate-500
        'fill-opacity': 0.25,
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // WATER - Clean, calm water with subtle glow effect
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'water',
      type: 'fill',
      source: 'composite',
      'source-layer': 'water',
      paint: {
        'fill-color': '#0c4a6e', // sky-900
        'fill-opacity': 0.85,
      },
    },
    {
      id: 'water-glow',
      type: 'line',
      source: 'composite',
      'source-layer': 'water',
      paint: {
        'line-color': '#0ea5e9', // sky-500
        'line-width': 1.5,
        'line-opacity': 0.4,
        'line-blur': 3,
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // WATERWAY - Rivers and streams
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'waterway',
      type: 'line',
      source: 'composite',
      'source-layer': 'waterway',
      paint: {
        'line-color': '#0284c7', // sky-600
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 1, 16, 4],
        'line-opacity': 0.7,
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // BUILDINGS - Stylized 3D-ready buildings (flat fill for 2D)
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'building',
      type: 'fill',
      source: 'composite',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-color': '#334155', // slate-700
        'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.7],
      },
    },
    {
      id: 'building-outline',
      type: 'line',
      source: 'composite',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'line-color': '#475569', // slate-600
        'line-width': 0.8,
        'line-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 0.5],
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // ROADS - Clean, game-like road hierarchy
    // ═══════════════════════════════════════════════════════════════

    // Tunnels (underneath)
    {
      id: 'tunnel-path',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['path', 'pedestrian']]],
      ],
      paint: {
        'line-color': '#475569',
        'line-width': 2,
        'line-opacity': 0.4,
        'line-dasharray': [2, 2],
      },
    },
    {
      id: 'tunnel-minor',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service']]],
      ],
      paint: {
        'line-color': '#475569',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 18, 10],
        'line-opacity': 0.5,
      },
    },
    {
      id: 'tunnel-major',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary']]],
      ],
      paint: {
        'line-color': '#64748b',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2, 18, 16],
        'line-opacity': 0.5,
      },
    },

    // Paths & Pedestrian - dotted/dashed subtle paths
    {
      id: 'road-path',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['==', ['get', 'class'], 'path'],
      ],
      paint: {
        'line-color': '#64748b', // slate-500
        'line-width': 1.5,
        'line-opacity': 0.6,
        'line-dasharray': [2, 2],
      },
    },
    {
      id: 'road-pedestrian',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['==', ['get', 'class'], 'pedestrian'],
      ],
      paint: {
        'line-color': '#94a3b8', // slate-400
        'line-width': 2,
        'line-opacity': 0.5,
      },
    },

    // Minor Roads - service, residential, etc.
    {
      id: 'road-minor-case',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service']]],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#1e293b', // slate-800
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 18, 14],
        'line-opacity': 0.9,
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service']]],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#475569', // slate-600
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 18, 10],
        'line-opacity': 0.9,
      },
    },

    // Major Roads - primary, secondary, tertiary
    {
      id: 'road-major-case',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary']]],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#0f172a', // slate-900
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 4, 18, 22],
        'line-opacity': 1,
      },
    },
    {
      id: 'road-major',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary']]],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#64748b', // slate-500
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 2.5, 18, 16],
        'line-opacity': 1,
      },
    },

    // Highways & Motorways - bold, prominent
    {
      id: 'road-motorway-case',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#0f172a', // slate-900
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 3, 18, 28],
        'line-opacity': 1,
      },
    },
    {
      id: 'road-motorway',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['!=', ['get', 'structure'], 'tunnel'],
        ['in', ['get', 'class'], ['literal', ['motorway', 'trunk']]],
      ],
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#94a3b8', // slate-400
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 2, 18, 20],
        'line-opacity': 1,
      },
    },

    // Bridges (on top)
    {
      id: 'bridge-minor-case',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'bridge'],
        ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service']]],
      ],
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#0f172a',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 4, 18, 16],
        'line-opacity': 1,
      },
    },
    {
      id: 'bridge-minor',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'bridge'],
        ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service']]],
      ],
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#475569',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 18, 10],
        'line-opacity': 1,
      },
    },
    {
      id: 'bridge-major-case',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'bridge'],
        ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'motorway', 'trunk']]],
      ],
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#0f172a',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 5, 18, 30],
        'line-opacity': 1,
      },
    },
    {
      id: 'bridge-major',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: [
        'all',
        ['==', ['get', 'structure'], 'bridge'],
        ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'motorway', 'trunk']]],
      ],
      layout: {
        'line-cap': 'butt',
        'line-join': 'round',
      },
      paint: {
        'line-color': '#94a3b8',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 18, 20],
        'line-opacity': 1,
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // RAILWAYS - Subtle track lines
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'railway',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: ['==', ['get', 'class'], 'major_rail'],
      paint: {
        'line-color': '#64748b',
        'line-width': 2,
        'line-opacity': 0.5,
        'line-dasharray': [3, 3],
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // ADMIN BOUNDARIES - Subtle border lines
    // ═══════════════════════════════════════════════════════════════
    {
      id: 'admin-boundary',
      type: 'line',
      source: 'composite',
      'source-layer': 'admin',
      filter: ['>=', ['get', 'admin_level'], 2],
      paint: {
        'line-color': '#475569',
        'line-width': 1,
        'line-opacity': 0.3,
        'line-dasharray': [4, 4],
      },
    },

    // ═══════════════════════════════════════════════════════════════
    // NO TEXT LAYERS - Intentionally omitted for clean, minimal look
    // ═══════════════════════════════════════════════════════════════
  ],
};

/**
 * 3D Building Extrusion Style for use with FillExtrusionLayer
 * Matches your existing buildingExtrusionStyle but with gamified colors
 */
export const gamifiedBuildingExtrusion: any = {
  fillExtrusionColor: [
    'interpolate',
    ['linear'],
    ['get', 'height'],
    0, '#f8fafc',
    20, '#e2e8f0',
    50, '#cbd5e1',
  ],
  fillExtrusionOpacity: 0.75,
  fillExtrusionHeight: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['coalesce', ['get', 'height'], 5],
  ],
  fillExtrusionBase: [
    'interpolate',
    ['linear'],
    ['zoom'],
    15,
    0,
    15.05,
    ['coalesce', ['get', 'min_height'], 0],
  ],
};

/**
 * Alternative lighter theme (day mode) - same minimal style
 */
export const gamifiedMapStyleLight: any = {
  version: 8,
  name: 'Gamified Light',
  sources: {
    composite: {
      url: 'mapbox://mapbox.mapbox-streets-v8',
      type: 'vector',
    },
  },
  glyphs: 'mapbox://fonts/mapbox/{fontstack}/{range}.pbf',
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: {
        'background-color': '#bfe0c7',
      },
    },
    {
      id: 'landuse-park',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'park'],
      paint: {
        'fill-color': '#55c271',
        'fill-opacity': 0.58,
      },
    },
    {
      id: 'landuse-grass',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'grass'],
      paint: {
        'fill-color': '#7ddc74',
        'fill-opacity': 0.64,
      },
    },
    {
      id: 'landuse-wood',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'wood'],
      paint: {
        'fill-color': '#3fa95d',
        'fill-opacity': 0.52,
      },
    },
    {
      id: 'landuse-pitch',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'pitch'],
      paint: {
        'fill-color': '#34b85d',
        'fill-opacity': 0.48,
      },
    },
    {
      id: 'landuse-cemetery',
      type: 'fill',
      source: 'composite',
      'source-layer': 'landuse',
      filter: ['==', ['get', 'class'], 'cemetery'],
      paint: {
        'fill-color': 'hsl(120, 85%, 44%)',
        'fill-opacity': 0.34,
      },
    },
    {
      id: 'water',
      type: 'fill',
      source: 'composite',
      'source-layer': 'water',
      paint: {
        'fill-color': '#6ec5f4',
        'fill-opacity': 0.88,
      },
    },
    {
      id: 'water-outline',
      type: 'line',
      source: 'composite',
      'source-layer': 'water',
      paint: {
        'line-color': '#4da9e6',
        'line-width': 1.2,
        'line-opacity': 0.4,
      },
    },
    {
      id: 'building',
      type: 'fill',
      source: 'composite',
      'source-layer': 'building',
      minzoom: 14,
      paint: {
        'fill-color': '#dbe7ef',
        'fill-opacity': 0.35,
      },
    },
    {
      id: 'road-minor',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: ['in', ['get', 'class'], ['literal', ['street', 'street_limited', 'service']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#86847f',
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 2, 18, 10],
      },
    },
    {
      id: 'road-major',
      type: 'line',
      source: 'composite',
      'source-layer': 'road',
      filter: ['in', ['get', 'class'], ['literal', ['primary', 'secondary', 'tertiary', 'motorway', 'trunk']]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': '#66625e',
        'line-width': ['interpolate', ['linear'], ['zoom'], 10, 3, 18, 18],
      },
    },
  ],
};
