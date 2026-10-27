import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Edit3, UserPlus, X } from 'lucide-react'
import { useTranslation } from '../../../hooks/useTranslation'

interface InviteMemberModalProps {
  isOpen: boolean
  onClose: () => void
  onInvite: (targetId: string) => void
}

export function InviteMemberModal({ isOpen, onClose, onInvite }: InviteMemberModalProps) {
  const { t } = useTranslation()
  const [targetId, setTargetId] = useState('')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!targetId.trim()) return
    onInvite(targetId.trim())
    setTargetId('')
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-zinc-200" />
              <h3 className="text-base font-bold text-zinc-100">{t('group_invite_title')}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {t('group_invite_label')}
              </label>
              <input
                type="text"
                required
                placeholder="Ex: 42" inputMode="numeric"
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
              />
              <p className="text-[11px] text-zinc-500">
                {t('group_invite_hint')}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
              >
                {t('btn_cancel')}
              </button>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition"
              >
                {t('group_invite_submit')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

interface EditDeviseModalProps {
  isOpen: boolean
  currentDevise: string
  onClose: () => void
  onSave: (devise: string) => void
}

export function EditDeviseModal({
  isOpen,
  currentDevise,
  onClose,
  onSave,
}: EditDeviseModalProps) {
  const { t } = useTranslation()
  const [devise, setDevise] = useState(currentDevise)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(devise.trim())
    onClose()
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-zinc-200" />
              <h3 className="text-base font-bold text-zinc-100">{t('group_devise_title')}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                {t('group_devise_label')}
              </label>
              <input
                type="text"
                required
                value={devise}
                onChange={(e) => setDevise(e.target.value)}
                placeholder={t('group_devise_placeholder')}
                className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:border-zinc-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-800 px-4 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition"
              >
                {t('btn_cancel')}
              </button>
              <button
                type="submit"
                className="rounded-lg border border-zinc-700 bg-zinc-100 px-4 py-2 text-xs font-semibold text-zinc-900 hover:bg-white transition"
              >
                {t('btn_save')}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
