import { NextResponse } from 'next/server';
import { NODE_DATA, NodeDataMap } from '@/lib/node-data';

// Simulate randomly marking some GPUs as rogue for testing
function getRandomRogueGPUs(): NodeDataMap {
  const nodeData = JSON.parse(JSON.stringify(NODE_DATA)); // Deep copy
  const nodeNames = Object.keys(nodeData);
  
  // Randomly select 1-2 nodes
  const nodeCount = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < nodeCount; i++) {
    const randomNodeIndex = Math.floor(Math.random() * nodeNames.length);
    const nodeName = nodeNames[randomNodeIndex];
    
    if (nodeData[nodeName].gpus && nodeData[nodeName].gpus.length > 0) {
      // Randomly select 1-2 GPUs in this node to mark as rogue
      const gpuCount = Math.min(Math.floor(Math.random() * 2) + 1, nodeData[nodeName].gpus.length);
      
      for (let j = 0; j < gpuCount; j++) {
        const randomGpuIndex = Math.floor(Math.random() * nodeData[nodeName].gpus.length);
        
        // Mark the GPU as rogue with a reason
        nodeData[nodeName].gpus[randomGpuIndex] = {
          ...nodeData[nodeName].gpus[randomGpuIndex],
          isRogue: true,
          reasonOfRogue: getRandomRogueReason()
        };
      }
    }
  }
  
  return nodeData;
}

// Generate a random reason for a GPU being rogue
function getRandomRogueReason(): string {
  const reasons = [
    "Suspicious GPU activity detected",
    "Multiple failed authentication attempts",
    "Inconsistent network traffic patterns",
    "Abnormal resource usage",
    "Unauthorized system modifications",
    "Unexpected downtime patterns",
    "Connection from unauthorized IP addresses",
    "Anomalous API call frequency",
    "Potential DDoS participation detected",
    "Unverified firmware version"
  ];
  
  return reasons[Math.floor(Math.random() * reasons.length)];
}

// API route handler
export async function GET() {
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get node data with some random GPUs marked as rogue
  const rogueGpuData = getRandomRogueGPUs();
  
  return NextResponse.json(rogueGpuData);
}
