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

export type BuiltinPermissionKey = 'canInvite' | 'canKick' | 'canPromote' | 'canEditDevise' | 'canManageRanks'

export type GroupPermissionKey = BuiltinPermissionKey | (string & {})

export type GroupPermissions = Record<BuiltinPermissionKey, boolean> & Record<string, boolean | undefined>

export const GROUP_PERMISSION_KEYS: BuiltinPermissionKey[] = ['canInvite', 'canKick', 'canPromote', 'canEditDevise', 'canManageRanks']

export interface GroupPermissionDefinition {
  key: GroupPermissionKey
  label?: string
  resource?: string
}

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

export interface GroupStatsDay {
  date: string
  sales: number
  units: number
  production: number
  influence: number
}

export interface MemberContribution {
  name: string
  amount: number
  percentage: number
}

export interface GroupStats {
  days: GroupStatsDay[]
  totals: Omit<GroupStatsDay, 'date'>
  contributors: MemberContribution[]
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
  permissionDefinitions?: GroupPermissionDefinition[]
  activities: GroupActivity[]
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
  stats?: GroupStats
}
