import { AnimatePresence, motion } from 'motion/react'
import type { LucideIcon } from 'lucide-react'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { PanelFooter, PanelHeader } from './Panel'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  subtitle?: ReactNode
  title?: ReactNode
  watermark?: string
  icon?: LucideIcon
  width?: string
  footer?: ReactNode
  children: ReactNode
}

export function Modal({ isOpen, onClose, subtitle, title, watermark, icon, width = 'max-w-lg', footer, children }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`flex max-h-full w-full ${width} flex-col overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.5)]`}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <PanelHeader
              subtitle={subtitle}
              title={title}
              watermark={watermark}
              icon={icon}
              actions={
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center text-white/60 transition hover:bg-white/10 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              }
            />
            <div className="flex-1 overflow-auto bg-help-glass-solid px-5 py-4">{children}</div>
            {footer && (
              <PanelFooter>
                <span className="flex items-center gap-2">{footer}</span>
              </PanelFooter>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
