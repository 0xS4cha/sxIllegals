import { useCallback, useEffect, useState } from 'react'
import { INITIAL_MOCK_GROUP_DETAIL } from '../data/mockGroupData'
import type { GroupActionResult, GroupDetail, GroupPermissions } from '../types/group'

import { useNuiEvent } from './useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/nui'

export function useGroupData() {
  const [group, setGroup] = useState<GroupDetail | null>(isEnvBrowser() ? INITIAL_MOCK_GROUP_DETAIL : null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useNuiEvent<GroupDetail | null>('setMyGroupData', (data) => {
    setGroup(data && data.name ? data : null)
  })

  const refreshGroupData = useCallback(async () => {
    if (isEnvBrowser()) return

    setLoading(true)
    try {
      const res = await fetchNui<GroupActionResult>('getMyGroupData')
      setGroup(res?.group ?? null)
    } catch (err) {
      console.error('Failed to fetch player group data via NUI:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshGroupData()
  }, [refreshGroupData])

  const runAction = useCallback(async (event: string, data: unknown, mockUpdate?: (prev: GroupDetail) => GroupDetail | null) => {
    setError(null)

    if (isEnvBrowser()) {
      if (mockUpdate) setGroup((prev) => (prev ? mockUpdate(prev) : prev))
      return true
    }

    try {
      const res = await fetchNui<GroupActionResult>(event, data)
      setGroup(res?.group ?? null)
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

  const updateRankPermissions = useCallback((rankId: number, permissions: GroupPermissions) =>
    runAction('setGroupRankPermissions', { rankId, permissions }, (prev) => ({
      ...prev,
      ranks: prev.ranks.map((r) => (r.id === rankId ? { ...r, permissions } : r)),
    })), [runAction])

  return {
    group,
    loading,
    error,
    clearError: () => setError(null),
    refreshGroupData,
    runAction,
    promoteMember,
    demoteMember,
    kickMember,
    leaveGroup,
    updateDevise,
    updateRankName,
    updateRankPermissions,
  }
}
