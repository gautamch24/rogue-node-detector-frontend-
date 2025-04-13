// Node data type definitions
export interface GPUPricing {
    type: string;
    price: number | null;
  }
  
  export interface GPUInfo {
    model: string;
    VRAM: string;
    socket: string;
    pricing: GPUPricing[];
    agent: string;
    isRogue?: boolean;
    reasonOfRogue?: string;
  }
  
  export interface NodeData {
    trustworthyScore: number;
    gpus: GPUInfo[];
  }
  
  export interface NodeDataMap {
    [key: string]: NodeData;
  }
  
  // Node data
  export const NODE_DATA: NodeDataMap = {
    "prime intellect": {
      "trustworthyScore": 7.5,
      "gpus": [
        {
          "model": "H200",
          "VRAM": "141 GB",
          "socket": "SXM5",
          "pricing": [
            { "type": "Community", "price": null },
            { "type": "Secure", "price": 3.45 }
          ],
          "agent": "Claude"
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.25 },
            { "type": "Secure", "price": 5.00 }
          ],
          "agent": "LLM"
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.75 },
            { "type": "Secure", "price": 3.20 }
          ],
          "agent": "GPT-4"
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.80 },
            { "type": "Secure", "price": 5.50 }
          ],
          "agent": "Bard"
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 1.95 },
            { "type": "Secure", "price": 2.30 }
          ],
          "agent": "Custom LLM"
        }
      ]
    },
    "robinhood": {
      "trustworthyScore": 8.0,
      "gpus": [
        {
          "model": "H200",
          "VRAM": "141 GB",
          "socket": "SXM5",
          "pricing": [
            { "type": "Community", "price": null },
            { "type": "Secure", "price": 3.45 }
          ],
          "agent": "GPT-4"
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.30 },
            { "type": "Secure", "price": 5.10 }
          ],
          "agent": "Claude"
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.80 },
            { "type": "Secure", "price": 3.25 }
          ],
          "agent": "LLM"
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.90 },
            { "type": "Secure", "price": 5.55 }
          ],
          "agent": "Bard"
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.00 },
            { "type": "Secure", "price": 2.35 }
          ],
          "agent": "Custom LLM"
        }
      ]
    },
    "stake": {
      "trustworthyScore": 6.8,
      "gpus": [
        {
          "model": "H200",
          "VRAM": "141 GB",
          "socket": "SXM5",
          "pricing": [
            { "type": "Community", "price": null },
            { "type": "Secure", "price": 3.45 }
          ],
          "agent": "LLM"
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.20 },
            { "type": "Secure", "price": 5.05 }
          ],
          "agent": "GPT-4"
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.70 },
            { "type": "Secure", "price": 3.15 }
          ],
          "agent": "Claude"
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.85 },
            { "type": "Secure", "price": 5.45 }
          ],
          "agent": "Bard"
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 1.90 },
            { "type": "Secure", "price": 2.25 }
          ],
          "agent": "Custom LLM"
        }
      ]
    },
    "nvidia": {
      "trustworthyScore": 9.0,
      "gpus": [
        {
          "model": "H200",
          "VRAM": "141 GB",
          "socket": "SXM5",
          "pricing": [
            { "type": "Community", "price": null },
            { "type": "Secure", "price": 3.45 }
          ],
          "agent": "Bard"
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.35 },
            { "type": "Secure", "price": 5.15 }
          ],
          "agent": "GPT-4"
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.85 },
            { "type": "Secure", "price": 3.30 }
          ],
          "agent": "Claude"
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 5.00 },
            { "type": "Secure", "price": 5.65 }
          ],
          "agent": "LLM"
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.05 },
            { "type": "Secure", "price": 2.40 }
          ],
          "agent": "Custom LLM"
        }
      ]
    },
    "conibase": {
      "trustworthyScore": 5.5,
      "gpus": [
        {
          "model": "H200",
          "VRAM": "141 GB",
          "socket": "SXM5",
          "pricing": [
            { "type": "Community", "price": null },
            { "type": "Secure", "price": 3.45 }
          ],
          "agent": "Custom LLM"
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.15 },
            { "type": "Secure", "price": 4.95 }
          ],
          "agent": "Claude"
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.65 },
            { "type": "Secure", "price": 3.05 }
          ],
          "agent": "GPT-4"
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.75 },
            { "type": "Secure", "price": 5.40 }
          ],
          "agent": "LLM"
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 1.85 },
            { "type": "Secure", "price": 2.20 }
          ],
          "agent": "Bard"
        }
      ]
    }
  };

// API service to fetch node data
export async function fetchNodeData(): Promise<NodeDataMap | null> {
  try {
    const response = await fetch('http://localhost:3001/api/provider-gpus/detailed');
    if (!response.ok) {
      console.error('Failed to fetch node data:', response.statusText);
      return null;
    }
    const data = await response.json();
    return data as NodeDataMap;
  } catch (error) {
    console.error('Error fetching node data:', error);
    return null;
  }
}

// Store for current node data that can be updated
let currentNodeData: NodeDataMap = { ...NODE_DATA };

// Function to get the current node data
export function getCurrentNodeData(): NodeDataMap {
  return currentNodeData;
}

// Function to update node data
export function updateNodeData(newData: NodeDataMap | null): void {
  if (newData) {
    currentNodeData = newData;
  }
}

// Function to start polling for node data updates
let pollingInterval: NodeJS.Timeout | null = null;

export function startNodeDataPolling(intervalMs: number = 5000): void {
  // Clear any existing interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
  
  // Set up polling
  pollingInterval = setInterval(async () => {
    const newData = await fetchNodeData();
    updateNodeData(newData);
  }, intervalMs);
}

export function stopNodeDataPolling(): void {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
}