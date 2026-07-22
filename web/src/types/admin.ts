export type AdminCategory = 'overview' | 'groups' | 'territories' | 'statistics' | 'laboratories'

export interface GroupMember {
  identifier: string
  name: string
  rank: string
  isLeader?: boolean
  joinedAt?: string
}

export interface GroupRank {
  name: string
  level: number
}

export interface GroupItem {
  id: string | number
  name: string
  devise: string
  rgb: { r: number; g: number; b: number }
  is_official: boolean
  slots: number
  membersCount: number
  leaderName: string
  influenceTotal: number
  territoriesCount: number
  createdAt: string
  members?: GroupMember[]
  ranks?: GroupRank[]
}

export interface TerritoryInfluence {
  groupId: string | number
  groupName: string
  points: number
  percentage: number
  color: string
}

export interface TerritoryItem {
  id: string
  label: string
  totalInfluence: number
  attackState: number // 0: peaceful, 1: under attack, 2: contested
  coords: { x: number; y: number; z: number }
  minZ: number
  maxZ: number
  startDate: string
  controlledBy?: {
    id: number
    name: string
    color: string
  }
  influences: TerritoryInfluence[]
}

export interface TimeSeriesPoint {
  label: string
  sales: number
  influence: number
  production: number
}

export interface ActivityBreakdown {
  label: string
  category: 'coke' | 'meth' | 'weed' | 'sales' | 'missions'
  percentage: number
  value: number
  color: string
}

export interface ActivityLog {
  id: string
  timestamp: string
  title: string
  description: string
  type: 'group' | 'territory' | 'lab' | 'system'
  severity: 'info' | 'warning' | 'critical'
}

export interface AdminStats {
  totalGroups: number
  officialGroups: number
  unofficialGroups: number
  totalTerritories: number
  contestedTerritories: number
  totalDrugSales24h: number
  activeLabsCount: number
  timeSeriesData: TimeSeriesPoint[]
  activityBreakdown: ActivityBreakdown[]
  recentActivities: ActivityLog[]
}

export interface CreateGroupPayload {
  name: string
  devise: string
  rgb: { r: number; g: number; b: number }
  is_official: boolean
  slots: number
}

export interface UpdateGroupPayload {
  id: string | number
  name?: string
  devise?: string
  is_official?: boolean
  slots?: number
}

export interface CreateTerritoryPayload {
  label: string
  minZ: number
  maxZ: number
  coords: { x: number; y: number; z: number }[]
}

export interface LaboratoryItem {
  id: string | number
  label: string
  type: 'coke' | 'meth' | 'weed'
  level: number
  coords: { x: number; y: number; z: number }
  territoryName: string
  productionPercentage: number
  productionStatus: string
}

export interface CreateLaboratoryPayload {
  label: string
  type: 'coke' | 'meth' | 'weed'
  coords: { x: number; y: number; z: number }
}
