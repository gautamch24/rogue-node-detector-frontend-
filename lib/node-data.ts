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
    isRogue: boolean;
    userTrusted?: boolean;
    rogueDetails?: {
      detectedAt: string;
      threat: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
      suspiciousActivity: string;
      recommendedAction: string;
    };
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
          "agent": "Claude",
          "isRogue": false
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.25 },
            { "type": "Secure", "price": 5.00 }
          ],
          "agent": "LLM",
          "isRogue": false
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.75 },
            { "type": "Secure", "price": 3.20 }
          ],
          "agent": "GPT-4",
          "isRogue": false
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.80 },
            { "type": "Secure", "price": 5.50 }
          ],
          "agent": "Bard",
          "isRogue": false
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 1.95 },
            { "type": "Secure", "price": 2.30 }
          ],
          "agent": "Custom LLM",
          "isRogue": false
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
          "agent": "GPT-4",
          "isRogue": false
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.30 },
            { "type": "Secure", "price": 5.10 }
          ],
          "agent": "Claude",
          "isRogue": false
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.80 },
            { "type": "Secure", "price": 3.25 }
          ],
          "agent": "LLM",
          "isRogue": false
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.90 },
            { "type": "Secure", "price": 5.55 }
          ],
          "agent": "Bard",
          "isRogue": false
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.00 },
            { "type": "Secure", "price": 2.35 }
          ],
          "agent": "Custom LLM",
          "isRogue": false
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
          "agent": "LLM",
          "isRogue": false
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.20 },
            { "type": "Secure", "price": 5.05 }
          ],
          "agent": "GPT-4",
          "isRogue": false
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.70 },
            { "type": "Secure", "price": 3.15 }
          ],
          "agent": "Claude",
          "isRogue": false
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.85 },
            { "type": "Secure", "price": 5.45 }
          ],
          "agent": "Bard",
          "isRogue": false
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 1.90 },
            { "type": "Secure", "price": 2.25 }
          ],
          "agent": "Custom LLM",
          "isRogue": false
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
          "agent": "Bard",
          "isRogue": true
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.35 },
            { "type": "Secure", "price": 5.15 }
          ],
          "agent": "GPT-4",
          "isRogue": false
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.85 },
            { "type": "Secure", "price": 3.30 }
          ],
          "agent": "Claude",
          "isRogue": true
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 5.00 },
            { "type": "Secure", "price": 5.65 }
          ],
          "agent": "LLM",
          "isRogue": false
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.05 },
            { "type": "Secure", "price": 2.40 }
          ],
          "agent": "Custom LLM",
          "isRogue": false
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
          "agent": "Custom LLM",
          "isRogue": false
        },
        {
          "model": "H100",
          "VRAM": "80 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 4.15 },
            { "type": "Secure", "price": 4.95 }
          ],
          "agent": "Claude",
          "isRogue": false
        },
        {
          "model": "V100",
          "VRAM": "32 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 2.65 },
            { "type": "Secure", "price": 3.05 }
          ],
          "agent": "GPT-4",
          "isRogue": false
        },
        {
          "model": "A100",
          "VRAM": "40 GB",
          "socket": "SXM4",
          "pricing": [
            { "type": "Community", "price": 4.75 },
            { "type": "Secure", "price": 5.40 }
          ],
          "agent": "LLM",
          "isRogue": true
        },
        {
          "model": "T100",
          "VRAM": "16 GB",
          "socket": "PCIe",
          "pricing": [
            { "type": "Community", "price": 1.85 },
            { "type": "Secure", "price": 2.20 }
          ],
          "agent": "Bard",
          "isRogue": true
        }
      ]
    }
  };