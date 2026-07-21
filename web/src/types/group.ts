export type GroupCategory = 'overview' | 'members' | 'ranks' | 'stats'

export interface GroupMemberDetail {
  identifier: string
  name: string
  rank: string
  rankLevel: number
  isOnline: boolean
  isLeader?: boolean
  joinedAt: string
  contributions: number
}

export interface GroupRankDetail {
  id: number
  name: string
  level: number
  permissions: {
    canInvite: boolean
    canKick: boolean
    canPromote: boolean
    canEditDevise: boolean
    canAccessVault: boolean
  }
}

export interface GroupActivity {
  id: string
  timestamp: string
  actor: string
  title: string
  description: string
  type: 'member' | 'rank' | 'vault' | 'influence'
}

export interface GroupSalesPoint {
  label: string
  sales: number
  units: number
}

export interface MemberContribution {
  name: string
  amount: number
  percentage: number
}

export interface GroupDetail {
  id: number
  name: string
  devise: string
  rgb: { r: number; g: number; b: number }
  is_official: boolean
  slots: number
  influenceTotal: number
  leaderName: string
  myRole: {
    rank: string
    level: number
    isLeader: boolean
    canManage: boolean
  }
  members: GroupMemberDetail[]
  ranks: GroupRankDetail[]
  activities: GroupActivity[]
  salesHistory: GroupSalesPoint[]
  topContributors: MemberContribution[]
}
