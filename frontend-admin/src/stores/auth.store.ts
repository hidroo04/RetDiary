import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Dosen, LoginResponse } from '@/types/auth.types'

interface AuthState {
  token: string | null
  dosen: Dosen | null
  setAuth: (data: LoginResponse) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      dosen: null,

      setAuth: (data) =>
        set({
          token: data.access_token,
          dosen: data.dosen,
        }),

      logout: () => set({ token: null, dosen: null }),
    }),
    {
      name: 'retdiary-auth-session',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
