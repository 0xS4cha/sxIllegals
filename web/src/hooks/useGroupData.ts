import { useCallback, useEffect, useState } from 'react'
import { INITIAL_MOCK_GROUP_DETAIL, INITIAL_MOCK_GROUP_STATS } from '../data/mockGroupData'
import type { CreateGroupPayload, GroupActionResult, GroupCreationSettings, GroupDetail, GroupInvitation, GroupPermissions, GroupStats } from '../types/group'

import { useNuiEvent } from './useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/nui'

export function useGroupData() {
  const [group, setGroup] = useState<GroupDetail | null>(isEnvBrowser() ? INITIAL_MOCK_GROUP_DETAIL : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invitations, setInvitations] = useState<GroupInvitation[]>([])
  const [creation, setCreation] = useState<GroupCreationSettings | null>(null)
  const [stats, setStats] = useState<GroupStats | null>(isEnvBrowser() ? INITIAL_MOCK_GROUP_STATS : null)
  const [statsLoading, setStatsLoading] = useState(false)

  useNuiEvent<GroupDetail | null>('setMyGroupData', (data) => {
    setGroup(data && data.name ? data : null)
  })

  const refreshGroupData = useCallback(async () => {
    if (isEnvBrowser()) return

    setLoading(true)
    try {
      const res = await fetchNui<GroupActionResult>('getMyGroupData')
      setGroup(res?.group ?? null)
      setInvitations(res?.invitations ?? [])
      setCreation(res?.creation ?? null)
    } catch (err) {
      console.error('Failed to fetch player group data via NUI:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshGroupData()
  }, [refreshGroupData])

  const loadStats = useCallback(async () => {
    if (isEnvBrowser()) return

    setStatsLoading(true)
    try {
      const res = await fetchNui<GroupActionResult>('getMyGroupStats')
      setStats(res?.stats ?? null)
    } catch (err) {
      console.error('Failed to fetch group statistics via NUI:', err)
    } finally {
      setStatsLoading(false)
    }
  }, [])

  const runAction = useCallback(async (event: string, data: unknown, mockUpdate?: (prev: GroupDetail) => GroupDetail | null) => {
    setError(null)

    if (isEnvBrowser()) {
      if (mockUpdate) setGroup((prev) => (prev ? mockUpdate(prev) : prev))
      return true
    }

    try {
      const res = await fetchNui<GroupActionResult>(event, data)
      setGroup(res?.group ?? null)
      setInvitations(res?.invitations ?? [])
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'unknown')
      await refreshGroupData()
      return false
    }
  }, [refreshGroupData])

  const promoteMember = useCallback((identifier: string) => runAction('promoteGroupMember', { identifier }), [runAction])

  const demoteMember = useCallback((identifier: string) => runAction('demoteGroupMember', { identifier }), [runAction])

  const kickMember = useCallback((identifier: string) =>
    runAction('kickGroupMember', { identifier }, (prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.identifier !== identifier),
    })), [runAction])

  const leaveGroup = useCallback(() => runAction('leaveGroup', {}, () => null), [runAction])

  const updateDevise = useCallback((devise: string) =>
    runAction('updateGroupDevise', { devise }, (prev) => ({ ...prev, devise })), [runAction])

  const updateRankName = useCallback((rankId: number, newName: string) =>
    runAction('renameGroupRank', { rankId, newName }, (prev) => ({
      ...prev,
      ranks: prev.ranks.map((r) => (r.id === rankId ? { ...r, name: newName } : r)),
    })), [runAction])

  const inviteMember = useCallback((targetId: string) => runAction('invitePlayerToGroup', { targetId }), [runAction])

  const createGroup = useCallback((payload: CreateGroupPayload) => runAction('createPlayerGroup', payload), [runAction])

  const respondInvitation = useCallback((groupId: string, accept: boolean) =>
    runAction('respondGroupInvitation', { groupId, accept }), [runAction])

  const updateRankPermissions = useCallback((rankId: number, permissions: GroupPermissions) =>
    runAction('setGroupRankPermissions', { rankId, permissions }, (prev) => ({
      ...prev,
      ranks: prev.ranks.map((r) => (r.id === rankId ? { ...r, permissions } : r)),
    })), [runAction])

  return {
    group,
    invitations,
    creation,
    stats,
    statsLoading,
    loadStats,
    loading,
    error,
    clearError: () => setError(null),
    refreshGroupData,
    runAction,
    promoteMember,
    demoteMember,
    kickMember,
    leaveGroup,
    inviteMember,
    respondInvitation,
    createGroup,
    updateDevise,
    updateRankName,
    updateRankPermissions,
  }
}
