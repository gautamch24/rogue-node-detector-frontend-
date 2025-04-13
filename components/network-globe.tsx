"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { NODE_DATA, NodeData, getCurrentNodeData, startNodeDataPolling, stopNodeDataPolling } from "@/lib/node-data"

let GLOBE_INSTANCE_COUNT = 0;
const GLOBE_DEBUG = true; // Enable detailed logging

function debugLog(message: string) {
  if (GLOBE_DEBUG) {
    console.log(`[NetworkGlobe] ${message}`);
  }
}

// Define regions with their coordinates and names
const REGIONS = [
  { name: "North America", lat: 40, lng: -100, color: 0x00ff88 },
  { name: "Europe", lat: 50, lng: 10, color: 0x00ff88 },
  { name: "Asia", lat: 35, lng: 105, color: 0x00ff88 },
  { name: "South America", lat: -15, lng: -55, color: 0x00ff88 },
  { name: "Australia", lat: -25, lng: 135, color: 0x00ff88 }
]

// Generate 5 nodes per region
const generateNodesForRegion = (region: typeof REGIONS[0], count: number) => {
  const nodes = [];
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 20;
    const lngOffset = (Math.random() - 0.5) * 20;
    nodes.push({
      lat: region.lat + latOffset,
      lng: region.lng + lngOffset,
      color: 0x00ff88,
      regionIndex: REGIONS.indexOf(region)
    });
  }
  return nodes;
};

const ALL_NODES = REGIONS.flatMap(region => generateNodesForRegion(region, 5));

export default function NetworkGlobe() {
  const uniqueId = useRef(`globe-${Math.random().toString(36).substr(2, 9)}`);
  
  debugLog(`Component rendered with ID: ${uniqueId.current}, GLOBE_INSTANCE_COUNT: ${GLOBE_INSTANCE_COUNT}`);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<{ name: string; position: THREE.Vector3 } | null>(null);
  const [hoveredNode, setHoveredNode] = useState<{ name: string; data: NodeData; position: THREE.Vector3 } | null>(null);
  const [badNode, setBadNode] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const instanceIdRef = useRef<number | null>(null);
  const [rogueNodes, setRogueNodes] = useState<number[]>([]);

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    debugLog(`useEffect triggered for ID: ${uniqueId.current}, isInitialized: ${isInitialized}, instanceIdRef: ${instanceIdRef.current}, GLOBE_INSTANCE_COUNT: ${GLOBE_INSTANCE_COUNT}`);
    
    // If this component instance already has an ID, don't initialize again
    if (instanceIdRef.current !== null) {
      debugLog(`Instance ${uniqueId.current} already initialized with ID: ${instanceIdRef.current}, skipping initialization`);
      return;
    }
    
    // If container is not available, don't initialize
    if (!containerRef.current) {
      debugLog(`Container not available for ID: ${uniqueId.current}, skipping initialization`);
      return;
    }
    
    // If global instance count is already 1 or more, don't initialize this instance
    if (GLOBE_INSTANCE_COUNT > 0) {
      debugLog(`A NetworkGlobe instance is already running. Count: ${GLOBE_INSTANCE_COUNT}. Preventing duplicate initialization for ID: ${uniqueId.current}`);
      return;
    }
    
    // Increment global counter and assign ID to this instance
    GLOBE_INSTANCE_COUNT++;
    instanceIdRef.current = GLOBE_INSTANCE_COUNT;
    debugLog(`Initializing globe for ID: ${uniqueId.current}, assigned instance #${instanceIdRef.current}, new count: ${GLOBE_INSTANCE_COUNT}`);
    setIsInitialized(true);
    
    // Start polling for node data
    startNodeDataPolling(5000);
    
    // Basic Three.js setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000);
    containerRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Earth
    const earthGeometry = new THREE.SphereGeometry(2, 32, 32);
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a192f,
      emissive: 0x0a192f,
      emissiveIntensity: 0.2,
      shininess: 25,
    });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    scene.add(earth);

    // Grid overlay
    const gridGeometry = new THREE.SphereGeometry(2.01, 32, 32);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(grid);

    // Region markers
    const regionMarkers: THREE.Mesh[] = [];
    const regionMeshes: THREE.Mesh[] = [];
    
    REGIONS.forEach((region, index) => {
      // Create region highlight
      const regionGeometry = new THREE.SphereGeometry(2.03, 32, 32);
      const regionMaterial = new THREE.MeshBasicMaterial({
        color: region.color,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide
      });
      const regionMesh = new THREE.Mesh(regionGeometry, regionMaterial);
      scene.add(regionMesh);
      regionMeshes.push(regionMesh);
      
      // Add region marker
      const markerGeometry = new THREE.SphereGeometry(0.08, 16, 16);
      const markerMaterial = new THREE.MeshPhongMaterial({
        color: region.color,
        emissive: region.color,
        emissiveIntensity: 0.5
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.copy(latLngToVector3(region.lat, region.lng, 2));
      marker.userData = { regionIndex: index };
      scene.add(marker);
      regionMarkers.push(marker);
    });

    // Create custom nodes from NODE_DATA
    const customNodes: THREE.Mesh[] = [];
    const nodeNameMap: Map<THREE.Mesh, string> = new Map();
    
    // Calculate positions for the custom nodes (distribute them around the globe)
    Object.entries(NODE_DATA).forEach(([nodeName, nodeData], index) => {
      // Calculate position on the globe
      const totalNodes = Object.keys(NODE_DATA).length;
      const angle = (index / totalNodes) * Math.PI * 2;
      const randomOffset = Math.random() * 0.4 - 0.2; // Random offset for latitude
      
      // Distribute nodes around the equator with some variations
      const lat = randomOffset * 50; // Latitude: -10 to 10 degrees
      const lng = (angle * 180 / Math.PI) - 180; // Longitude: convert angle to -180 to 180
      
      // Create node marker
      const nodeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      
      // Determine color based on trustworthiness
      const trustScore = nodeData.trustworthyScore;
      let nodeColor;
      if (trustScore >= 8) {
        nodeColor = 0x00ff00; // Green for highly trustworthy
      } else if (trustScore >= 6) {
        nodeColor = 0xffff00; // Yellow for medium trustworthy
      } else {
        nodeColor = 0xff0000; // Red for less trustworthy
      }
      
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.5
      });
      
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      nodeMesh.position.copy(latLngToVector3(lat, lng, 2.05)); // Position slightly above the globe
      nodeMesh.userData = { nodeName };
      scene.add(nodeMesh);
      customNodes.push(nodeMesh);
      nodeNameMap.set(nodeMesh, nodeName);
      
      // Add a label for the node
      const textSprite = createTextSprite(nodeName, {
        fontFace: 'Arial',
        fontSize: 10,
        borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
        backgroundColor: { r: 0, g: 0, b: 0, a: 0.8 },
        textColor: { r: 255, g: 255, b: 255, a: 1.0 }
      });
      textSprite.position.copy(nodeMesh.position.clone().multiplyScalar(1.05));
      scene.add(textSprite);
    });
    
    // Function to create text sprite
    function createTextSprite(text: string, parameters: any) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = 400;
      canvas.height = 200;
      
      context.font = "Bold " + parameters.fontSize + "px " + parameters.fontFace;
      context.fillStyle = "rgba("+parameters.textColor.r+", "+parameters.textColor.g+", "+parameters.textColor.b+", 1.0)";
      context.fillText(text, 10, 20);
      
      const texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: 0.8
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(0.5, 0.25, 1.0);
      
      return sprite;
    }
    
    // Create nodes
    const nodes: THREE.Mesh[] = [];
    ALL_NODES.forEach((node, index) => {
      const nodeGeometry = new THREE.SphereGeometry(0.03, 16, 16);
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.5
      });
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
      nodeMesh.position.copy(latLngToVector3(node.lat, node.lng, 2));
      nodeMesh.userData = { nodeIndex: index, regionIndex: node.regionIndex };
      scene.add(nodeMesh);
      nodes.push(nodeMesh);
    });

    // Create ripple effect
    const createRipple = (position: THREE.Vector3) => {
      const rippleGeometry = new THREE.RingGeometry(0, 0.2, 32);
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      });
      const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
      ripple.position.copy(position);
      ripple.lookAt(new THREE.Vector3(0, 0, 0));
      scene.add(ripple);

      const startTime = Date.now();
      function expandRipple() {
        const elapsed = Date.now() - startTime;
        const duration = 2000;
        
        if (elapsed < duration) {
          const scale = elapsed / duration * 3;
          ripple.scale.set(scale, scale, scale);
          rippleMaterial.opacity = 1 - (elapsed / duration);
          requestAnimationFrame(expandRipple);
        } else {
          scene.remove(ripple);
          rippleGeometry.dispose();
          rippleMaterial.dispose();
        }
      }
      
      expandRipple();
    };

    // Function to update node colors based on current data
    const updateNodeColors = () => {
      const currentData = getCurrentNodeData();
      const newRogueNodes: number[] = [];

      nodes.forEach((node, index) => {
        // Store regionIndex in user data to access it later
        const regionIndex = (node as any).userData?.regionIndex;
        if (regionIndex !== undefined) {
          const nodeKeys = Object.keys(currentData);
          const nodeName = nodeKeys[regionIndex % nodeKeys.length];
          const nodeData = currentData[nodeName];
          
          // Check if any GPU in this node is rogue
          const hasRogueGpu = nodeData?.gpus.some(gpu => gpu.isRogue === true);
          
          if (hasRogueGpu) {
            // Cast to proper material type with color property
            const nodeMaterial = node.material as THREE.MeshPhongMaterial;
            nodeMaterial.color.set(0xff0000); // Red for nodes with rogue GPUs
            newRogueNodes.push(index);
          } else {
            // Cast to proper material type with color property
            const nodeMaterial = node.material as THREE.MeshPhongMaterial;
            nodeMaterial.color.set(0x00ff88); // Default color
          }
        }
      });

      // Update the rogue nodes state
      setRogueNodes(newRogueNodes);
    };

    // Set up an interval to check for updated node data
    const nodeDataCheckInterval = setInterval(() => {
      updateNodeColors();
    }, 500);

    // Simulate bad nodes
    const simulateBadNode = () => {
      if (rogueNodes.length > 0) {
        // Use existing rogue nodes from API data
        const randomRogueIndex = Math.floor(Math.random() * rogueNodes.length);
        const randomNodeIndex = rogueNodes[randomRogueIndex];
        
        const position = nodes[randomNodeIndex].position.clone();
        setBadNode(randomNodeIndex);
        
        // Create ripple effect at rogue node position
        createRipple(position);
        
        setTimeout(() => {
          setBadNode(null);
        }, 2000);
      } else if (nodes.length > 0) {
        // Fallback to random node if no rogue nodes
        const randomIndex = Math.floor(Math.random() * nodes.length);
        const position = nodes[randomIndex].position.clone();
        setBadNode(randomIndex);
        
        // Create ripple effect
        createRipple(position);
        
        setTimeout(() => {
          setBadNode(null);
        }, 2000);
      }
    };

    // Start the simulation
    const nodeInterval = setInterval(simulateBadNode, 5000);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.minDistance = 3;
    controls.maxDistance = 10;
    
    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onMouseMove(event: MouseEvent) {
      // Get mouse position
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Check for intersections
      raycaster.setFromCamera(mouse, camera);
      
      // Reset region highlights
      regionMeshes.forEach(mesh => {
        (mesh.material as THREE.MeshBasicMaterial).opacity = 0;
      });
      
      // Check custom nodes first
      const customNodeIntersects = raycaster.intersectObjects(customNodes);
      if (customNodeIntersects.length > 0) {
        const nodeMesh = customNodeIntersects[0].object as THREE.Mesh;
        const nodeName = nodeNameMap.get(nodeMesh);
        
        if (nodeName && NODE_DATA[nodeName]) {
          // Update tooltip
          const worldPos = new THREE.Vector3();
          nodeMesh.getWorldPosition(worldPos);
          worldPos.project(camera);
          
          const x = (worldPos.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
          const y = (-worldPos.y * 0.5 + 0.5) * containerRef.current!.clientHeight;
          
          setHoveredNode({
            name: nodeName,
            data: NODE_DATA[nodeName],
            position: new THREE.Vector3(x, y, 0)
          });
          
          setHoveredRegion(null); // Clear any region hover
          return;
        }
      }
      
      // Clear node hover if no node is hovered
      setHoveredNode(null);
      
      // If no custom nodes were hit, check normal nodes
      const nodeIntersects = raycaster.intersectObjects(nodes);
      if (nodeIntersects.length > 0) {
        const nodeMesh = nodeIntersects[0].object as THREE.Mesh;
        const regionIndex = nodeMesh.userData.regionIndex;
        
        // Highlight region
        const regionMesh = regionMeshes[regionIndex];
        (regionMesh.material as THREE.MeshBasicMaterial).opacity = 0.2;
        
        // Update tooltip
        const worldPos = new THREE.Vector3();
        nodeMesh.getWorldPosition(worldPos);
        worldPos.project(camera);
        
        const x = (worldPos.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
        const y = (-worldPos.y * 0.5 + 0.5) * containerRef.current!.clientHeight;
        
        setHoveredRegion({
          name: REGIONS[regionIndex].name,
          position: new THREE.Vector3(x, y, 0)
        });
        return;
      }
      
      // If no nodes were hit, check region markers
      const markerIntersects = raycaster.intersectObjects(regionMarkers);
      if (markerIntersects.length > 0) {
        const marker = markerIntersects[0].object as THREE.Mesh;
        const regionIndex = marker.userData.regionIndex;
        
        // Highlight region
        const regionMesh = regionMeshes[regionIndex];
        (regionMesh.material as THREE.MeshBasicMaterial).opacity = 0.2;
        
        // Update tooltip
        const worldPos = new THREE.Vector3();
        marker.getWorldPosition(worldPos);
        worldPos.project(camera);
        
        const x = (worldPos.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
        const y = (-worldPos.y * 0.5 + 0.5) * containerRef.current!.clientHeight;
        
        setHoveredRegion({
          name: REGIONS[regionIndex].name,
          position: new THREE.Vector3(x, y, 0)
        });
        return;
      }
      
      // If no intersections, clear the tooltip
      setHoveredRegion(null);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    
    // Animation loop
    function animate() {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    }
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      // Stop API polling
      stopNodeDataPolling();
      
      // Clear all intervals
      clearInterval(nodeInterval);
      clearInterval(nodeDataCheckInterval);
      
      // Clean up Three.js resources
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
      
      // Remove renderer
      if (containerRef.current && renderer.domElement.parentElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      renderer.dispose();
      
      // Decrement global counter on cleanup
      GLOBE_INSTANCE_COUNT--;
      debugLog(`Cleaned up globe for ID: ${uniqueId.current}, new count: ${GLOBE_INSTANCE_COUNT}`);
      instanceIdRef.current = null;
    };
  }, [isInitialized]);
  
  // Helper function to format price display
  const formatPrice = (price: number | null): string => {
    if (price === null) return 'Free';
    return `$${price.toFixed(2)}/hr`;
  };
  
  return (
    <div 
      id={`globe-container-${uniqueId.current}`}
      className="w-full h-full" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        minHeight: '600px',
      }} 
      ref={containerRef}
    >
      {hoveredRegion && !hoveredNode && (
        <div 
          className="absolute z-10 bg-black/80 border border-[#00ff88] rounded-md p-2 text-xs font-mono pointer-events-none"
          style={{
            left: `${hoveredRegion.position.x}px`,
            top: `${hoveredRegion.position.y + 20}px`,
            transform: 'translate(-50%, 0)',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
            color: '#00ff88'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-[#00ff88]">⚡</span>
            <span>{hoveredRegion.name}</span>
          </div>
        </div>
      )}
      
      {hoveredNode && (
        <div 
          className="absolute z-10 bg-black/90 border border-gray-700 rounded-md p-3 text-xs font-mono pointer-events-none"
          style={{
            left: `${hoveredNode.position.x}px`,
            top: `${hoveredNode.position.y + 20}px`,
            transform: 'translate(-50%, 0)',
            boxShadow: '0 0 20px rgba(0, 100, 255, 0.3)',
            color: 'white',
            maxWidth: '350px'
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">{hoveredNode.name}</div>
            
            <div className="flex justify-between">
              <span className="text-gray-400">Trustworthy Score:</span>
              <span className={`font-bold ${
                hoveredNode.data.trustworthyScore >= 8 ? 'text-green-500' : 
                hoveredNode.data.trustworthyScore >= 6 ? 'text-yellow-500' : 'text-red-500'
              }`}>
                {hoveredNode.data.trustworthyScore.toFixed(1)}/10.0
              </span>
            </div>

            <div className="mt-2 border-t border-gray-700 pt-2">
              <div className="text-sm font-bold mb-2">Available GPUs:</div>
              <div className="grid grid-cols-1 gap-2">
                {hoveredNode.data.gpus.map((gpu, idx) => (
                  <div key={idx} className={`bg-gray-900 p-2 rounded ${gpu.isRogue ? 'border border-red-700' : ''}`}>
                    <div className="font-bold text-blue-400">{gpu.model} ({gpu.VRAM})</div>
                    <div className="text-xs text-gray-400">Socket: {gpu.socket}</div>
                    <div className="text-xs text-gray-400">Agent: {gpu.agent}</div>
                    
                    {gpu.isRogue && (
                      <div className="bg-red-900/50 border border-red-700 p-2 rounded mt-1 mb-1">
                        <div className="font-bold text-red-400">ROGUE GPU DETECTED</div>
                        {gpu.reasonOfRogue && (
                          <div className="text-red-200 text-xs mt-1">{gpu.reasonOfRogue}</div>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-1 grid grid-cols-2 gap-1">
                      {gpu.pricing.map((price, i) => (
                        <div key={i} className="text-xs">
                          <span className="text-gray-500">{price.type}:</span>{' '}
                          <span className="font-bold text-green-400">{formatPrice(price.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-xs text-[#00ff88] font-mono">
        <div>GLOBAL NETWORK: ACTIVE</div>
        <div>NODES: {ALL_NODES.length - (rogueNodes.length || 0)} HEALTHY / {ALL_NODES.length} TOTAL</div>
        <div>SYSTEM: {rogueNodes.length > 0 ? 'WARNING' : 'OPERATIONAL'}</div>
      </div>
    </div>
  );
}