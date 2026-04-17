import { create } from 'zustand'

interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (_accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

const demoUser: AuthUser = {
  accountNo: 'demo',
  email: 'leadflow@borg.demo',
  role: ['admin'],
  exp: Number.MAX_SAFE_INTEGER,
}

export const useAuthStore = create<AuthState>()((set) => ({
  auth: {
    user: demoUser,
    setUser: (user) =>
      set((state) => ({
        ...state,
        auth: { ...state.auth, user },
      })),
    accessToken: 'demo-access-token',
    setAccessToken: () => undefined,
    resetAccessToken: () => undefined,
    reset: () =>
      set((state) => ({
        ...state,
        auth: { ...state.auth, user: demoUser, accessToken: 'demo-access-token' },
      })),
  },
}))
