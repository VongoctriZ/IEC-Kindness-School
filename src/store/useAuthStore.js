import { create } from 'zustand'

const useAuthStore = create((set) => ({
  user:            null,
  profile:         null,
  loading:         true,
  needsOnboarding: false,

  setUser:            (user)            => set({ user }),
  setProfile:         (profile)         => set({ profile }),
  setLoading:         (loading)         => set({ loading }),
  setNeedsOnboarding: (needsOnboarding) => set({ needsOnboarding }),
  clear:              ()                => set({ user: null, profile: null, loading: false, needsOnboarding: false }),
}))

export default useAuthStore
