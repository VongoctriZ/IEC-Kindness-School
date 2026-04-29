import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user:    null,   // Firebase Auth user object
  profile: null,   // Firestore users/{uid} document
  loading: true,

  setUser:    (user)    => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  clear:      ()        => set({ user: null, profile: null, loading: false }),
}))

export default useAuthStore
