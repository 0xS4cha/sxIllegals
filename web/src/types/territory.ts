export interface TerritoryCoord {
  x: number
  y: number
}

export interface TerritoryInfluence {
  id: number
  points: number
  name?: string
  rgb?: { r: number; g: number; b: number }
}

export interface Territory {
  id: string
  label: string
  influence: TerritoryInfluence[]
  totalInfluence: number
  coords: TerritoryCoord[]
  minZ: number
  maxZ: number
  date?: number
}
