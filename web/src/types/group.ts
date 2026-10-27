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

export type GroupPermissionKey = 'canInvite' | 'canKick' | 'canPromote' | 'canEditDevise' | 'canManageRanks'

export type GroupPermissions = Record<GroupPermissionKey, boolean>

export const GROUP_PERMISSION_KEYS: GroupPermissionKey[] = ['canInvite', 'canKick', 'canPromote', 'canEditDevise', 'canManageRanks']

export interface GroupRankDetail {
  id: number
  name: string
  level: number
  permissions: GroupPermissions
}

export interface GroupActivity {
  id: string
  timestamp: string
  actor: string
  title: string
  description: string
  type: 'member' | 'rank' | 'territory' | 'influence' | 'lab' | 'alert'
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
  id: string | number
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
    grade: number
    isLeader: boolean
    canManage: boolean
    permissions: GroupPermissions
  }
  members: GroupMemberDetail[]
  ranks: GroupRankDetail[]
  activities: GroupActivity[]
  salesHistory: GroupSalesPoint[]
  topContributors: MemberContribution[]
}

export interface GroupInvitation {
  groupId: string
  groupName: string
  rgb: { r: number; g: number; b: number }
  inviter: string
  expiresIn: number
}

export interface GroupCreationSettings {
  enabled: boolean
  price: number
  minLength: number
  maxLength: number
}

export interface CreateGroupPayload {
  name: string
  devise: string
  rgb: { r: number; g: number; b: number }
}

export interface GroupActionResult {
  ok: boolean
  error?: string
  group?: GroupDetail | null
  invitations?: GroupInvitation[]
  creation?: GroupCreationSettings
}
