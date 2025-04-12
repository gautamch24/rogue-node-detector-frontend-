import { create } from "zustand"

const useNodeStore = create((set) => ({
  nodes: [],
  activeNode: null,
  setNodes: (nodes) => set({ nodes }),
  setActiveNode: (node) => set({ activeNode: node }),
}))

export { useNodeStore }
