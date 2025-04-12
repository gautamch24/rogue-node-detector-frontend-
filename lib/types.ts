export interface Position {
  x: number
  y: number
  z: number
}

export interface Threat {
  type: string
  severity: string
  confidence: number
}

export interface Specs {
  cpu: string
  memory: string
  storage: string
  ip: string
}

export interface Network {
  bandwidth: number
  packetLoss: string
  latency: string
  peers: number
}

export interface Node {
  id: string
  status: "normal" | "rogue"
  position: Position
  location: string
  lastUpdated: string
  detectedAt?: string
  threat?: Threat
  specs?: Specs
  network?: Network
}
