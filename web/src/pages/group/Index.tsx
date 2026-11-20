import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { motion, AnimatePresence } from 'motion/react'
import {
  AlertCircle,
  BarChart3,
  LayoutDashboard,
  ShieldHalf,
  Users,
  X,
} from 'lucide-react'

import { useGroupData } from '../../hooks/useGroupData'
import { useTranslation } from '../../hooks/useTranslation'
import type { GroupCategory } from '../../types/group'
import { EditDeviseModal, InviteMemberModal } from './components/GroupModals'
import { CreateGroupForm } from './components/CreateGroupForm'
import { NoGroupView } from './components/NoGroupView'
import { GroupMembersView } from './components/GroupMembersView'
import { GroupOverviewView } from './components/GroupOverviewView'
import { GroupRangsView } from './components/GroupRangsView'
import { GroupSidebar } from './components/GroupSidebar'
import { GroupStatsView } from './components/GroupStatsView'

export function GroupPanel() {
  const [activeCategory, setActiveCategory] = useState<GroupCategory>('overview')
  const [collapsedSidebar, setCollapsedSidebar] = useState(false)
  const [isEditDeviseModalOpen, setIsEditDeviseModalOpen] = useState(false)
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const { t } = useTranslation()

  const {
    group,
    invitations,
    creation,
    stats,
    statsLoading,
    loadStats,
    loading,
    error,
    clearError,
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
  } = useGroupData()

  if (!group) {
    return (
      <NoGroupView
        loading={loading}
        error={error}
        invitations={invitations}
        onRefresh={refreshGroupData}
        onRespond={respondInvitation}
        runAction={runAction}
      >
        {creation?.enabled && <CreateGroupForm settings={creation} onCreate={createGroup} />}
      </NoGroupView>
    )
  }

  const categoryHeaders: Record<GroupCategory, { title: string; subtitle: string; icon: typeof LayoutDashboard }> = {
    overview: {
      title: t('group_header_overview'),
      subtitle: t('group_header_overview_sub', { name: group.name }),
      icon: LayoutDashboard,
    },
    members: {
      title: t('group_header_members'),
      subtitle: t('group_header_members_sub', { count: group.members.length, slots: group.slots }),
      icon: Users,
    },
    ranks: {
      title: t('group_header_ranks'),
      subtitle: t('group_header_ranks_sub'),
      icon: ShieldHalf,
    },
    stats: {
      title: t('group_header_stats'),
      subtitle: t('group_header_stats_sub', { name: group.name }),
      icon: BarChart3,
    },
  }

  const currentHeader = categoryHeaders[activeCategory]

  return (
    <div className="flex h-full w-full overflow-hidden">
      <GroupSidebar
        group={group}
        activeCategory={activeCategory}
        onSelectCategory={setActiveCategory}
        collapsed={collapsedSidebar}
        onToggleCollapse={() => setCollapsedSidebar((prev) => !prev)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <PageHeader
          title={currentHeader.title}
          subtitle={currentHeader.subtitle}
          icon={currentHeader.icon}
          refreshLabel={t('btn_refresh')}
          loading={loading}
          onRefresh={() => {
                void refreshGroupData()
                if (activeCategory === 'stats') void loadStats()
              }}
        />

        {error && (
          <div className="flex items-center justify-between gap-3 border-l border-help-line bg-help-danger px-6 py-2 text-[15px] font-semibold uppercase tracking-wide text-help-panel">
            <span className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {t(`group_error_${error}`)}
            </span>
            <button type="button" onClick={clearError} className="text-help-panel/70 hover:text-help-panel">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <main className="flex-1 overflow-auto border-l border-help-line p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeCategory === 'overview' && (
                <GroupOverviewView
                  group={group}
                  onSelectCategory={setActiveCategory}
                  onOpenEditDeviseModal={() => setIsEditDeviseModalOpen(true)}
                />
              )}

              {activeCategory === 'members' && (
                <GroupMembersView
                  group={group}
                  onPromote={promoteMember}
                  onDemote={demoteMember}
                  onKick={kickMember}
                  onLeave={leaveGroup}
                  onOpenInviteModal={() => setIsInviteModalOpen(true)}
                />
              )}

              {activeCategory === 'ranks' && (
                <GroupRangsView
                  group={group}
                  onRenameRank={updateRankName}
                  onUpdatePermissions={updateRankPermissions}
                />
              )}

              {activeCategory === 'stats' && (
                <GroupStatsView group={group} stats={stats} loading={statsLoading} onLoad={loadStats} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={(targetId) => void inviteMember(targetId)}
      />

      <EditDeviseModal
        isOpen={isEditDeviseModalOpen}
        currentDevise={group.devise}
        onClose={() => setIsEditDeviseModalOpen(false)}
        onSave={updateDevise}
      />
    </div>
  )
}
