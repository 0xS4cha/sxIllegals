import { useState } from 'react'
import { Edit3, UserPlus } from 'lucide-react'
import { Button, Field, Input, Modal } from '../../../components/ui'
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={UserPlus}
      title={t('group_invite_title')}
      width="max-w-md"
      footer={
        <>
          <Button onClick={onClose}>{t('btn_cancel')}</Button>
          <Button variant="primary" type="submit" form="invite-member-form">
            {t('group_invite_submit')}
          </Button>
        </>
      }
    >
      <form id="invite-member-form" onSubmit={handleSubmit}>
        <Field label={t('group_invite_label')} hint={t('group_invite_hint')}>
          <Input
            type="text"
            required
            placeholder="Ex: 42"
            inputMode="numeric"
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
          />
        </Field>
      </form>
    </Modal>
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Edit3}
      title={t('group_devise_title')}
      width="max-w-md"
      footer={
        <>
          <Button onClick={onClose}>{t('btn_cancel')}</Button>
          <Button variant="primary" type="submit" form="edit-devise-form">
            {t('btn_save')}
          </Button>
        </>
      }
    >
      <form id="edit-devise-form" onSubmit={handleSubmit}>
        <Field label={t('group_devise_label')}>
          <Input
            type="text"
            required
            value={devise}
            onChange={(e) => setDevise(e.target.value)}
            placeholder={t('group_devise_placeholder')}
          />
        </Field>
      </form>
    </Modal>
  )
}
