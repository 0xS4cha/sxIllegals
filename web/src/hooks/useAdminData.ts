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

export function useAdminData() {
  const [groups, setGroups] = useState<GroupItem[]>(INITIAL_MOCK_GROUPS)
  const [territories, setTerritories] = useState<TerritoryItem[]>(INITIAL_MOCK_TERRITORIES)
  const [labs, setLabs] = useState<LaboratoryItem[]>(INITIAL_MOCK_LABS)
  const [stats, setStats] = useState<AdminStats>(INITIAL_MOCK_STATS)
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

      const statsRes = await fetchNui<AdminStats>('getAdminStats')
      if (statsRes) setStats(statsRes)
    } catch (err) {
      console.error('Failed to fetch admin data via NUI:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshData()
  }, [refreshData])

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
