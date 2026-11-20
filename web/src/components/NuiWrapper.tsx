import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useEscapeKey } from '../hooks/useEscapeKey'
import { fetchNui } from '../utils/fetchNui'

interface NuiWrapperProps {
  visible: boolean
  children: ReactNode
}

export function NuiWrapper({ visible, children }: NuiWrapperProps) {
  const handleClose = () => {
    void fetchNui('close')
  }

  useEscapeKey(handleClose, visible)

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/55 p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="flex h-[min(90vh,760px)] w-[min(94vw,1180px)] flex-col overflow-hidden bg-[#131522]/85 font-help shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
