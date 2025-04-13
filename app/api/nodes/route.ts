import { NextResponse } from 'next/server';
import { NODE_DATA, NodeDataMap } from '@/lib/node-data';

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

// Mock API route that simulates the expected backend format
export async function GET() {
  // Simulate API processing delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Create a deep copy of the node data to avoid mutating the original
  const mockData = JSON.parse(JSON.stringify(NODE_DATA));
  
  // Randomly select 1-2 nodes to contain rogue GPUs
  const nodeNames = Object.keys(mockData);
  const nodeCount = Math.floor(Math.random() * 2) + 1;
  
  for (let i = 0; i < nodeCount; i++) {
    const randomNodeIndex = Math.floor(Math.random() * nodeNames.length);
    const nodeName = nodeNames[randomNodeIndex];
    
    if (mockData[nodeName] && mockData[nodeName].gpus && mockData[nodeName].gpus.length > 0) {
      // Randomly select 1-2 GPUs in this node to mark as rogue
      const gpuCount = Math.min(Math.floor(Math.random() * 2) + 1, mockData[nodeName].gpus.length);
      const selectedGpuIndices = new Set();
      
      for (let j = 0; j < gpuCount; j++) {
        // Make sure we don't select the same GPU twice
        let randomGpuIndex;
        do {
          randomGpuIndex = Math.floor(Math.random() * mockData[nodeName].gpus.length);
        } while (selectedGpuIndices.has(randomGpuIndex));
        
        selectedGpuIndices.add(randomGpuIndex);
        
        // Mark the GPU as rogue with a reason
        mockData[nodeName].gpus[randomGpuIndex] = {
          ...mockData[nodeName].gpus[randomGpuIndex],
          isRogue: true,
          reasonOfRogue: getRandomRogueReason()
        };
      }
    }
  }
  
  // Ensure all other GPUs have isRogue explicitly set to false
  Object.keys(mockData).forEach(nodeName => {
    mockData[nodeName].gpus.forEach((gpu: any) => {
      if (gpu.isRogue !== true) {
        gpu.isRogue = false;
        gpu.reasonOfRogue = "";
      }
    });
  });
  
  console.log('Mock API returning data:', mockData);
  return NextResponse.json(mockData);
}
