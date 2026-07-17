import { create } from "zustand"

export type AppView =
  | { type: "login" }
  | { type: "register" }
  | { type: "feed" }
  | { type: "profile" }
  | { type: "user"; userId: string }
  | { type: "search"; query: string }

interface AppState {
  view: AppView
  refreshKey: number
  setView: (view: AppView) => void
  triggerRefresh: () => void
}

export const useAppStore = create<AppState>((set) => ({
  view: { type: "login" },
  refreshKey: 0,
  setView: (view) => set({ view }),
  triggerRefresh: () =>
    set((state) => ({ refreshKey: state.refreshKey + 1 })),
}))
