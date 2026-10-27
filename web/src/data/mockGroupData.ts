import type { GroupDetail, GroupStats } from '../types/group'

export const INITIAL_MOCK_GROUP_DETAIL: GroupDetail = {
  id: 1,
  name: 'Ballas',
  devise: 'Purple till we die',
  rgb: { r: 147, g: 51, b: 234 },
  is_official: true,
  slots: 15,
  influenceTotal: 1850,
  leaderName: 'Marcus "Kilo" Vance',
  myRole: {
    rank: 'Boss',
    level: 5,
    grade: 0,
    isLeader: true,
    canManage: true,
    permissions: { canInvite: true, canKick: true, canPromote: true, canEditDevise: true, canManageRanks: true },
  },
  members: [
    {
      identifier: 'license:1001',
      name: 'Marcus Vance',
      rank: 'Boss',
      rankLevel: 5,
      isOnline: true,
      isLeader: true,
      joinedAt: '2026-01-12',
      contributions: 64500,
    },
    {
      identifier: 'license:1002',
      name: 'Tyrone King',
      rank: 'Underboss',
      rankLevel: 4,
      isOnline: true,
      joinedAt: '2026-01-14',
      contributions: 48200,
    },
    {
      identifier: 'license:1003',
      name: 'Darnell Carter',
      rank: 'Captain',
      rankLevel: 3,
      isOnline: false,
      joinedAt: '2026-01-20',
      contributions: 31000,
    },
    {
      identifier: 'license:1004',
      name: 'Malik Reed',
      rank: 'Soldier',
      rankLevel: 2,
      isOnline: true,
      joinedAt: '2026-02-01',
      contributions: 19400,
    },
    {
      identifier: 'license:1005',
      name: 'Lamar Davis',
      rank: 'Prospect',
      rankLevel: 1,
      isOnline: false,
      joinedAt: '2026-02-15',
      contributions: 8500,
    },
    {
      identifier: 'license:1006',
      name: 'Treyvon Smith',
      rank: 'Soldier',
      rankLevel: 2,
      isOnline: true,
      joinedAt: '2026-02-18',
      contributions: 12900,
    },
  ],
  ranks: [
    {
      id: 5,
      name: 'Boss',
      level: 5,
      permissions: {
        canInvite: true,
        canKick: true,
        canPromote: true,
        canEditDevise: true,
        canManageRanks: true,
      },
    },
    {
      id: 4,
      name: 'Underboss',
      level: 4,
      permissions: {
        canInvite: true,
        canKick: true,
        canPromote: true,
        canEditDevise: true,
        canManageRanks: true,
      },
    },
    {
      id: 3,
      name: 'Captain',
      level: 3,
      permissions: {
        canInvite: true,
        canKick: false,
        canPromote: false,
        canEditDevise: false,
        canManageRanks: true,
      },
    },
    {
      id: 2,
      name: 'Soldier',
      level: 2,
      permissions: {
        canInvite: false,
        canKick: false,
        canPromote: false,
        canEditDevise: false,
        canManageRanks: true,
      },
    },
    {
      id: 1,
      name: 'Prospect',
      level: 1,
      permissions: {
        canInvite: false,
        canKick: false,
        canPromote: false,
        canEditDevise: false,
        canManageRanks: false,
      },
    },
  ],
  activities: [
    {
      id: 'gact-1',
      timestamp: '10 min ago',
      actor: 'Marcus Vance',
      title: 'Cocaine sold',
      description: '45 bags sold in Rancho.',
      type: 'lab',
    },
    {
      id: 'gact-2',
      timestamp: '45 min ago',
      actor: 'Marcus Vance',
      title: 'Promotion',
      description: 'Tyrone King was promoted to Underboss.',
      type: 'rank',
    },
    {
      id: 'gact-3',
      timestamp: '2 h ago',
      actor: 'Malik Reed',
      title: 'Influence gained',
      description: 'Mission completed in the south (+150 influence).',
      type: 'influence',
    },
    {
      id: 'gact-4',
      timestamp: '5 h ago',
      actor: 'Tyrone King',
      title: 'New member',
      description: 'Treyvon Smith joined the group as Soldier.',
      type: 'member',
    },
  ],
}

const today = new Date()

export const INITIAL_MOCK_GROUP_STATS: GroupStats = {
  days: [18500, 24200, 0, 28900, 45600, 62400, 51200].map((sales, i) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - i))
    return {
      date: date.toISOString().slice(0, 10),
      sales,
      units: Math.round(sales / 450),
      production: Math.round(sales / 2000),
      influence: Math.round(sales / 120),
    }
  }),
  totals: { sales: 230800, units: 512, production: 115, influence: 1923 },
  contributors: [
    { name: 'Marcus Vance', amount: 640, percentage: 33 },
    { name: 'Tyrone King', amount: 482, percentage: 25 },
    { name: 'Darnell Carter', amount: 310, percentage: 16 },
    { name: 'Malik Reed', amount: 194, percentage: 10 },
    { name: 'Lamar Davis', amount: 85, percentage: 4 },
  ],
}
