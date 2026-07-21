import { useCallback, useEffect, useState } from 'react'
import { INITIAL_MOCK_GROUP_DETAIL } from '../data/mockGroupData'
import type { GroupDetail, GroupMemberDetail } from '../types/group'

import { useNuiEvent } from './useNuiEvent'
import { fetchNui } from '../utils/fetchNui'
import { isEnvBrowser } from '../utils/nui'

export function useGroupData() {
  const [group, setGroup] = useState<GroupDetail>(INITIAL_MOCK_GROUP_DETAIL)
  const [loading, setLoading] = useState(false)

  useNuiEvent<GroupDetail>('setMyGroupData', (data) => {
    if (data && data.name) setGroup(data)
  })

  const refreshGroupData = useCallback(async () => {
    setLoading(true)
    try {
      if (isEnvBrowser()) {
        setLoading(false)
        return
      }

      const res = await fetchNui<GroupDetail>('getMyGroupData')
      if (res && res.name) setGroup(res)
    } catch (err) {
      console.error('Failed to fetch player group data via NUI:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refreshGroupData()
  }, [refreshGroupData])

  // Member Actions
  const promoteMember = useCallback(async (identifier: string) => {
    setGroup((prev) => {
      const updatedMembers = prev.members.map((m) => {
        if (m.identifier === identifier) {
          const nextLevel = Math.min(5, m.rankLevel + 1)
          const matchedRank = prev.ranks.find((r) => r.level === nextLevel)
          return {
            ...m,
            rankLevel: nextLevel,
            rank: matchedRank ? matchedRank.name : m.rank,
          }
        }
        return m
      })
      return { ...prev, members: updatedMembers }
    })

    if (!isEnvBrowser()) {
      await fetchNui('promoteGroupMember', { identifier })
    }
  }, [])

  const demoteMember = useCallback(async (identifier: string) => {
    setGroup((prev) => {
      const updatedMembers = prev.members.map((m) => {
        if (m.identifier === identifier) {
          const nextLevel = Math.max(1, m.rankLevel - 1)
          const matchedRank = prev.ranks.find((r) => r.level === nextLevel)
          return {
            ...m,
            rankLevel: nextLevel,
            rank: matchedRank ? matchedRank.name : m.rank,
          }
        }
        return m
      })
      return { ...prev, members: updatedMembers }
    })

    if (!isEnvBrowser()) {
      await fetchNui('demoteGroupMember', { identifier })
    }
  }, [])

  const kickMember = useCallback(async (identifier: string) => {
    setGroup((prev) => ({
      ...prev,
      members: prev.members.filter((m) => m.identifier !== identifier),
    }))

    if (!isEnvBrowser()) {
      await fetchNui('kickGroupMember', { identifier })
    }
  }, [])

  const inviteMember = useCallback(async (targetId: string) => {
    const newMember: GroupMemberDetail = {
      identifier: `license:invited_${Date.now()}`,
      name: `Joueur #${targetId}`,
      rank: 'Prospect',
      rankLevel: 1,
      isOnline: true,
      joinedAt: new Date().toISOString().split('T')[0],
      contributions: 0,
    }

    setGroup((prev) => ({
      ...prev,
      members: [...prev.members, newMember],
    }))

    if (!isEnvBrowser()) {
      await fetchNui('invitePlayerToGroup', { targetId })
    }
  }, [])

  const updateDevise = useCallback(async (newDevise: string) => {
    setGroup((prev) => ({ ...prev, devise: newDevise }))

    if (!isEnvBrowser()) {
      await fetchNui('updateGroupDevise', { devise: newDevise })
    }
  }, [])

  const updateRankName = useCallback(async (rankId: number, newName: string) => {
    setGroup((prev) => ({
      ...prev,
      ranks: prev.ranks.map((r) => (r.id === rankId ? { ...r, name: newName } : r)),
    }))

    if (!isEnvBrowser()) {
      await fetchNui('renameGroupRank', { rankId, newName })
    }
  }, [])

  return {
    group,
    loading,
    refreshGroupData,
    promoteMember,
    demoteMember,
    kickMember,
    inviteMember,
    updateDevise,
    updateRankName,
  }
}
