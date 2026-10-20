import { useCallback, useEffect, useState } from 'react'
import { INITIAL_MOCK_GROUPS, INITIAL_MOCK_STATS, INITIAL_MOCK_TERRITORIES } from '../data/mockAdminData'
import type {
  AdminStats,
  CreateGroupPayload,
  GroupItem,
  TerritoryItem,
  UpdateGroupPayload,
  CreateTerritoryPayload,
  LaboratoryItem,
  CreateLaboratoryPayload,
} from '../types/admin'

import { useNuiEvent } from './useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/nui'

const INITIAL_MOCK_LABS: LaboratoryItem[] = [
  { id: 1, label: 'Labo Rancho meth', type: 'meth', level: 1, coords: { x: 300, y: -1500, z: 29.5 }, territoryName: 'Rancho Central', productionPercentage: 45, productionStatus: 'Synthèse en cours (1/2)' },
  { id: 2, label: 'Labo Davis coke', type: 'coke', level: 2, coords: { x: -80, y: -1600, z: 30.2 }, territoryName: 'Davis Street', productionPercentage: 0, productionStatus: 'En attente de matière première' },
  { id: 3, label: 'Labo Chamberlain weed', type: 'weed', level: 1, coords: { x: -200, y: -1400, z: 31.0 }, territoryName: 'Chamberlain Hills', productionPercentage: 80, productionStatus: 'Prêt à récolter (4/6)' }
]

const EMPTY_STATS: AdminStats = {
  totalGroups: 0,
  officialGroups: 0,
  unofficialGroups: 0,
  totalTerritories: 0,
  contestedTerritories: 0,
  totalDrugSales24h: 0,
  activeLabsCount: 0,
  timeSeriesData: [],
  activityBreakdown: [],
  recentActivities: []
}

export function useAdminData() {
  const [groups, setGroups] = useState<GroupItem[]>(isEnvBrowser() ? INITIAL_MOCK_GROUPS : [])
  const [territories, setTerritories] = useState<TerritoryItem[]>(isEnvBrowser() ? INITIAL_MOCK_TERRITORIES : [])
  const [labs, setLabs] = useState<LaboratoryItem[]>(isEnvBrowser() ? INITIAL_MOCK_LABS : [])
  const [stats, setStats] = useState<AdminStats>(isEnvBrowser() ? INITIAL_MOCK_STATS : EMPTY_STATS)
  const [timeFrame, setTimeFrame] = useState<'24h' | '7d' | '30d'>('24h')
  const [loading, setLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryItem | null>(null)

  useNuiEvent<GroupItem[]>('setGroupsData', (data) => {
    if (Array.isArray(data)) setGroups(data)
  })

  useNuiEvent<TerritoryItem[]>('setTerritoriesData', (data) => {
    if (Array.isArray(data)) setTerritories(data)
  })

  useNuiEvent<LaboratoryItem[]>('setLabsData', (data) => {
    if (Array.isArray(data)) setLabs(data)
  })

  useNuiEvent<AdminStats>('setStatsData', (data) => {
    if (data) setStats(data)
  })

  const fetchStats = useCallback(async (tf: '24h' | '7d' | '30d') => {
    if (isEnvBrowser()) {
      const mockSales = tf === '24h' ? 124100 : tf === '7d' ? 842000 : 3240000
      const mockPoints = tf === '24h' ? [
        { label: '00:00', sales: 12400, influence: 450, production: 120 },
        { label: '04:00', sales: 8200,  influence: 320,  production: 90 },
        { label: '08:00', sales: 15600, influence: 580,  production: 210 },
        { label: '12:00', sales: 32800, influence: 890,  production: 340 },
        { label: '16:00', sales: 48500, influence: 1240, production: 480 },
        { label: '20:00', sales: 67000, influence: 1650, production: 620 },
        { label: '23:59', sales: 54100, influence: 1410, production: 530 }
      ] : tf === '7d' ? [
        { label: 'Lun', sales: 45000, influence: 300, production: 100 },
        { label: 'Mar', sales: 52000, influence: 350, production: 110 },
        { label: 'Mer', sales: 48000, influence: 320, production: 105 },
        { label: 'Jeu', sales: 61000, influence: 410, production: 130 },
        { label: 'Ven', sales: 85000, influence: 560, production: 180 },
        { label: 'Sam', sales: 98000, influence: 620, production: 210 },
        { label: 'Dim', sales: 72000, influence: 490, production: 160 }
      ] : [
        { label: 'Sem 1', sales: 650000, influence: 1200, production: 500 },
        { label: 'Sem 2', sales: 810000, influence: 1400, production: 620 },
        { label: 'Sem 3', sales: 780000, influence: 1300, production: 580 },
        { label: 'Sem 4', sales: 1020000, influence: 1900, production: 850 }
      ]
      setStats((prev) => ({
        ...prev,
        totalDrugSales24h: mockSales,
        timeSeriesData: mockPoints
      }))
      return
    }

    try {
      const statsRes = await fetchNui<AdminStats>('getAdminStats', { timeframe: tf })
      if (statsRes) setStats(statsRes)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }, [])

  useEffect(() => {
    void fetchStats(timeFrame)
  }, [timeFrame, fetchStats])

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      if (isEnvBrowser()) {
        setLoading(false)
        return
      }

      const groupsRes = await fetchNui<GroupItem[]>('getAdminGroups')
      if (groupsRes) setGroups(groupsRes)

      const territoriesRes = await fetchNui<TerritoryItem[]>('getAdminTerritories')
      if (territoriesRes) setTerritories(territoriesRes)

      const labsRes = await fetchNui<LaboratoryItem[]>('getAdminLabs')
      if (labsRes) setLabs(labsRes)

      await fetchStats(timeFrame)
    } catch (err) {
      console.error('Failed to fetch admin data via NUI:', err)
    } finally {
      setLoading(false)
    }
  }, [timeFrame, fetchStats])

  useEffect(() => {
    void refreshData()
  }, [])

  const toggleOfficialGroup = useCallback(async (id: string | number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, is_official: !g.is_official } : g)),
    )
    setSelectedGroup((prev) => (prev?.id === id ? { ...prev, is_official: !prev.is_official } : prev))

    if (!isEnvBrowser()) {
      await fetchNui('toggleGroupOfficial', { groupId: id })
    }
  }, [])

  const deleteGroup = useCallback(async (id: string | number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    if (selectedGroup?.id === id) setSelectedGroup(null)

    if (!isEnvBrowser()) {
      await fetchNui('deleteGroup', { groupId: id })
    }
  }, [selectedGroup])

  const createGroup = useCallback(async (payload: CreateGroupPayload) => {
    const newId = 'GRP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase()
    const newGroup: GroupItem = {
      id: newId,
      name: payload.name,
      devise: payload.devise,
      rgb: payload.rgb,
      is_official: payload.is_official,
      slots: payload.slots,
      membersCount: 1,
      leaderName: 'Leader Admin',
      influenceTotal: 0,
      territoriesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      members: [],
      ranks: [],
    }

    setGroups((prev) => [newGroup, ...prev])

    if (!isEnvBrowser()) {
      await fetchNui('createGroup', payload)
    }
  }, [])

  const updateGroup = useCallback(async (payload: UpdateGroupPayload) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === payload.id) {
          return {
            ...g,
            ...(payload.name !== undefined && { name: payload.name }),
            ...(payload.devise !== undefined && { devise: payload.devise }),
            ...(payload.is_official !== undefined && { is_official: payload.is_official }),
            ...(payload.slots !== undefined && { slots: payload.slots }),
          }
        }
        return g
      }),
    )

    if (!isEnvBrowser()) {
      await fetchNui('updateGroup', payload)
    }
  }, [])

  const resetTerritoryInfluence = useCallback(async (territoryId: string) => {
    setTerritories((prev) =>
      prev.map((t) => {
        if (t.id === territoryId) {
          return {
            ...t,
            totalInfluence: 0,
            influences: t.influences.map((inf) => ({ ...inf, points: 0, percentage: 0 })),
          }
        }
        return t
      }),
    )

    if (!isEnvBrowser()) {
      await fetchNui('resetTerritoryInfluence', { territoryId })
    }
  }, [])

  const teleportToTerritory = useCallback(async (coords: { x: number; y: number; z: number }) => {
    if (!isEnvBrowser()) {
      await fetchNui('teleportToCoords', coords)
    }
  }, [])

  const createTerritory = useCallback(async (payload: CreateTerritoryPayload) => {
    if (!isEnvBrowser()) {
      await fetchNui('createTerritory', payload)
      setTimeout(() => {
        void refreshData()
      }, 500)
    } else {
      const newMockTerritory: TerritoryItem = {
        id: 'TER-' + Math.floor(Math.random() * 100 + 10),
        label: payload.label,
        totalInfluence: 0,
        attackState: 0,
        coords: payload.coords[0] || { x: 0, y: 0, z: 0 },
        minZ: payload.minZ,
        maxZ: payload.maxZ,
        startDate: new Date().toISOString().split('T')[0],
        influences: []
      }
      setTerritories((prev) => [...prev, newMockTerritory])
    }
  }, [refreshData])

  const createLaboratory = useCallback(async (payload: CreateLaboratoryPayload) => {
    if (!isEnvBrowser()) {
      await fetchNui('createLaboratory', payload)
      setTimeout(() => {
        void refreshData()
      }, 500)
    } else {
      const newMockLab: LaboratoryItem = {
        id: Date.now(),
        label: payload.label,
        type: payload.type,
        level: 1,
        coords: payload.coords,
        territoryName: 'Rancho Central',
        productionPercentage: 0,
        productionStatus: 'Inactif'
      }
      setLabs((prev) => [newMockLab, ...prev])
    }
  }, [refreshData])

  return {
    groups,
    territories,
    labs,
    stats,
    timeFrame,
    setTimeFrame,
    loading,
    selectedGroup,
    setSelectedGroup,
    selectedTerritory,
    setSelectedTerritory,
    refreshData,
    toggleOfficialGroup,
    deleteGroup,
    createGroup,
    updateGroup,
    resetTerritoryInfluence,
    teleportToTerritory,
    createTerritory,
    createLaboratory,
  }
}
