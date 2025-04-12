// Generate a random position on a sphere
function randomSpherePoint() {
  const u = Math.random()
  const v = Math.random()
  const theta = 2 * Math.PI * u
  const phi = Math.acos(2 * v - 1)

  return {
    x: Math.sin(phi) * Math.cos(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(phi),
  }
}

// Generate a random IP address
function randomIP() {
  return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`
}

// Generate a random location
function randomLocation() {
  const locations = [
    "New York, USA",
    "London, UK",
    "Tokyo, Japan",
    "Sydney, Australia",
    "Berlin, Germany",
    "Paris, France",
    "Singapore",
    "Mumbai, India",
    "São Paulo, Brazil",
    "Toronto, Canada",
    "Amsterdam, Netherlands",
    "Seoul, South Korea",
    "Stockholm, Sweden",
    "Dubai, UAE",
    "Johannesburg, South Africa",
  ]

  return locations[Math.floor(Math.random() * locations.length)]
}

// Generate random nodes
export function generateRandomNodes(count) {
  const nodes = []

  for (let i = 0; i < count; i++) {
    const position = randomSpherePoint()
    const isRogue = i === Math.floor(Math.random() * count) // One random node is rogue

    const node = {
      id: `NODE-${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      status: isRogue ? "rogue" : "normal",
      position,
      location: randomLocation(),
      lastUpdated: new Date().toISOString(),
      specs: {
        cpu: ["Intel Xeon E5-2680", "AMD EPYC 7742", "Intel Xeon Platinum 8280", "AMD EPYC 7763"][
          Math.floor(Math.random() * 4)
        ],
        memory: `${Math.pow(2, Math.floor(Math.random() * 3) + 5)}GB DDR4`,
        storage: `${Math.pow(2, Math.floor(Math.random() * 2) + 1)}TB NVMe SSD`,
        ip: randomIP(),
      },
      network: {
        bandwidth: Math.floor(Math.random() * 80) + 20,
        packetLoss: `${(Math.random() * 0.5).toFixed(2)}%`,
        latency: `${Math.floor(Math.random() * 50) + 10}ms`,
        peers: Math.floor(Math.random() * 20) + 5,
      },
    }

    if (isRogue) {
      node.detectedAt = new Date().toISOString()
      node.threat = {
        type: ["Data Exfiltration", "Malware", "Unauthorized Access", "DDoS Source"][Math.floor(Math.random() * 4)],
        severity: ["Critical", "High", "Medium"][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 30) + 70,
      }
    }

    nodes.push(node)
  }

  return nodes
}
