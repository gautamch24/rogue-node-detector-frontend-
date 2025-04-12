import { create } from "zustand"
import type { Node } from "./types"

interface NodeStore {
  nodes: Node[]
  activeNode: Node | null
  setNodes: (nodes: Node[]) => void
  setActiveNode: (node: Node) => void
}

export const useNodeStore = create<NodeStore>((set) => ({
  nodes: [],
  activeNode: null,
  setNodes: (nodes) => set({ nodes }),
  setActiveNode: (node) => set({ activeNode: node }),
}))
