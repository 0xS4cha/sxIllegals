import { useCallback, useEffect, useState } from 'react'
import { INITIAL_MOCK_GROUPS, INITIAL_MOCK_STATS, INITIAL_MOCK_TERRITORIES } from '../data/mockAdminData'
import type {
  AdminStats,
  CreateGroupPayload,
  GroupItem,
  TerritoryItem,
  UpdateGroupPayload,
} from '../types/admin'

import { useNuiEvent } from './useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/nui'

export function useAdminData() {
  const [groups, setGroups] = useState<GroupItem[]>(INITIAL_MOCK_GROUPS)
  const [territories, setTerritories] = useState<TerritoryItem[]>(INITIAL_MOCK_TERRITORIES)
  const [stats, setStats] = useState<AdminStats>(INITIAL_MOCK_STATS)
  const [loading, setLoading] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<GroupItem | null>(null)
  const [selectedTerritory, setSelectedTerritory] = useState<TerritoryItem | null>(null)

  // Listen to live NUI sync events from server
  useNuiEvent<GroupItem[]>('setGroupsData', (data) => {
    if (Array.isArray(data)) setGroups(data)
  })

  useNuiEvent<TerritoryItem[]>('setTerritoriesData', (data) => {
    if (Array.isArray(data)) setTerritories(data)
  })

  useNuiEvent<AdminStats>('setStatsData', (data) => {
    if (data) setStats(data)
  })

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      if (isEnvBrowser()) {
        // Retain mock data in browser
        setLoading(false)
        return
      }

      const groupsRes = await fetchNui<GroupItem[]>('getAdminGroups')
      if (groupsRes) setGroups(groupsRes)

      const territoriesRes = await fetchNui<TerritoryItem[]>('getAdminTerritories')
      if (territoriesRes) setTerritories(territoriesRes)

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

  // Admin Actions
  const toggleOfficialGroup = useCallback(async (id: number) => {
    setGroups((prev) =>
      prev.map((g) => (g.id === id ? { ...g, is_official: !g.is_official } : g)),
    )
    setSelectedGroup((prev) => (prev?.id === id ? { ...prev, is_official: !prev.is_official } : prev))

    if (!isEnvBrowser()) {
      await fetchNui('toggleGroupOfficial', { groupId: id })
    }
  }, [])

  const deleteGroup = useCallback(async (id: number) => {
    setGroups((prev) => prev.filter((g) => g.id !== id))
    if (selectedGroup?.id === id) setSelectedGroup(null)

    if (!isEnvBrowser()) {
      await fetchNui('deleteGroup', { groupId: id })
    }
  }, [selectedGroup])

  const createGroup = useCallback(async (payload: CreateGroupPayload) => {
    const newId = Date.now()
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

  return {
    groups,
    territories,
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
  }
}
