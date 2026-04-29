import { create } from 'zustand'

const usePointStore = create((set) => ({
  /** Lịch sử điểm gần đây để hiện toast notification */
  recent: [],  // [{ action, points, label, timestamp }]

  push(entry) {
    set(s => ({
      recent: [{ ...entry, timestamp: Date.now() }, ...s.recent].slice(0, 20),
    }))
  },

  clear: () => set({ recent: [] }),
}))

export default usePointStore
