"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { NODE_DATA, NodeData, GPUPricing } from "@/lib/node-data"

// For tracking globe instances globally
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
  const [hoveredNode, setHoveredNode] = useState<{ 
    name: string; 
    data: NodeData; 
    position: THREE.Vector3;
    gpuData?: any;
    gpuIndex?: number;
  } | null>(null);
  const [badNode, setBadNode] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const instanceIdRef = useRef<number | null>(null);
  
  // Add state for node data from backend
  const [nodeState, setNodeState] = useState<typeof NODE_DATA>(NODE_DATA);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Add state for trust management panel
  const [showTrustPanel, setShowTrustPanel] = useState(true); // Always visible
  const [selectedProvider, setSelectedProvider] = useState<string | null>(Object.keys(NODE_DATA)[0]);
  
  // Add state for provider investments
  const [investments, setInvestments] = useState<{[provider: string]: number}>({});
  const [currentInvestmentInput, setCurrentInvestmentInput] = useState<string>("");
  
  // Store animation-related arrays as refs to avoid temporal dead zone issues
  const rogueNodePulsesRef = useRef<{mesh: THREE.Mesh, time: number, node: THREE.Mesh}[]>([]);
  const rogueNodeIntervalsRef = useRef<NodeJS.Timeout[]>([]);
  const ripplesRef = useRef<{mesh: THREE.Mesh, time: number, maxSize: number, origin?: THREE.Mesh}[]>([]);
  
  // Function to fetch node data from backend
  const fetchNodeData = async () => {
    try {
      setIsLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // In a real app, we'd fetch from an API:
      // const response = await fetch('/api/nodes');
      // if (!response.ok) {
      //   throw new Error(`Error fetching node data: ${response.status}`);
      // }
      // const data = await response.json();
      
      // Instead, let's create some rogue nodes in our local data
      const data = structuredClone(NODE_DATA); // Create a deep copy
      
      // Randomly mark some nodes as rogue for demonstration
      // (In real app, this would come from backend)
      const providers = Object.keys(data);
      
      // Prime intellect H100 node is rogue - unauthorized model access (high severity)
      if (data["prime intellect"]?.gpus?.[1]) {
        data["prime intellect"].gpus[1].isRogue = true;
        data["prime intellect"].gpus[1].rogueDetails = {
          detectedAt: new Date().toISOString(),
          threat: "Unauthorized Model Access",
          severity: "high",
          suspiciousActivity: "The node was detected accessing and copying proprietary model weights without authorization",
          recommendedAction: "Isolate node and revoke network access immediately"
        };
        // Lower the trustworthy score
        data["prime intellect"].trustworthyScore = 5.8;
      }
      
      // NVIDIA T100 node is rogue - cryptomining (medium severity)
      if (data["nvidia"]?.gpus?.[4]) {
        data["nvidia"].gpus[4].isRogue = true;
        data["nvidia"].gpus[4].rogueDetails = {
          detectedAt: new Date().toISOString(),
          threat: "Cryptomining Activity",
          severity: "medium",
          suspiciousActivity: "High computational usage patterns consistent with unauthorized cryptomining operations",
          recommendedAction: "Terminate running processes and update security protocols"
        };
        // Lower the trustworthy score
        data["nvidia"].trustworthyScore = 6.2;
      }
      
      // Add a third provider with a critical issue
      if (data["robinhood"]?.gpus?.[3]) {
        data["robinhood"].gpus[3].isRogue = true; // A100
        data["robinhood"].gpus[3].rogueDetails = {
          detectedAt: new Date().toISOString(),
          threat: "Data Exfiltration",
          severity: "critical",
          suspiciousActivity: "Large volumes of user data being transmitted to unknown external endpoints",
          recommendedAction: "Shutdown immediately and engage security team for forensic analysis"
        };
        // Significantly lower the trustworthy score
        data["robinhood"].trustworthyScore = 3.1;
      }
      
      setNodeState(data);
      setLastUpdated(new Date());
      debugLog('Node data updated from simulated backend');
      return data;
    } catch (error) {
      console.error('Failed to fetch node data:', error);
      // Fall back to existing data
      return nodeState;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch data when component mounts
  useEffect(() => {
    // Initialize with static data first
    setNodeState(NODE_DATA);
    
    // Then try to get fresh data from backend
    fetchNodeData();
    
    // Set up interval to periodically check for updates
    const intervalId = setInterval(() => {
      fetchNodeData();
    }, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

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

    // Create custom nodes from nodeState (instead of hardcoded NODE_DATA)
    const customNodes: THREE.Mesh[] = [];
    const nodeNameMap: Map<THREE.Mesh, string> = new Map();
    const nodeDataMap: Map<THREE.Mesh, any> = new Map(); // Store specific data for each node
    
    // Calculate positions for the custom nodes (distribute them around the globe)
    Object.entries(nodeState).forEach(([nodeName, nodeData], index) => {
      // Base position for this provider
      const totalProviders = Object.keys(nodeState).length;
      const baseAngle = (index / totalProviders) * Math.PI * 2;
      const baseLat = (Math.random() * 40) - 20; // Base latitude between -20 and 20 degrees
      const baseLng = (baseAngle * 180 / Math.PI) - 180; // Base longitude: convert angle to -180 to 180
      
      // Count rogue nodes to manage spacing
      const rogueCount = nodeData.gpus.filter(gpu => gpu.isRogue).length;
      
      // Add one node per GPU for this provider (or up to 5)
      const nodeCount = Math.min(nodeData.gpus.length, 5); // Up to 5 nodes per provider
      
      // Create node positions with better spacing
      const positions: {lat: number, lng: number}[] = [];
      
      for (let i = 0; i < nodeCount; i++) {
        // Create variation around the base position, with increased spacing
        // Use a wider spread for positioning to avoid crowding
        const spreadFactor = nodeCount > 3 ? 15 : 10; // More nodes = more spread
        
        // Is this a rogue node?
        const isRogue = nodeData.gpus[i].isRogue;
        
        // If there are rogue nodes, give them more space
        const spacingMultiplier = isRogue ? 1.5 : 1.0;
        
        // Create a more deterministic pattern rather than pure random
        const angle = (i / nodeCount) * Math.PI * 2;
        const radius = spreadFactor * spacingMultiplier;
        
        const latOffset = Math.sin(angle) * radius;
        const lngOffset = Math.cos(angle) * radius;
        
        const lat = baseLat + latOffset;
        const lng = baseLng + lngOffset;
        
        positions.push({lat, lng});
      }
      
      // Create the nodes based on calculated positions
      for (let i = 0; i < nodeCount; i++) {
        // Get this GPU data
        const gpuData = nodeData.gpus[i];
        const {lat, lng} = positions[i];
        
        // Create node marker - adjust size based on type
        const nodeSize = gpuData.isRogue ? 0.045 : 0.035;
        const nodeGeometry = new THREE.SphereGeometry(nodeSize, 16, 16);
        
        // Determine color based on GPU model or rogue status
        let nodeColor;
        
        if (gpuData.isRogue) {
          // Rogue nodes are red with different brightness based on severity
          const severity = gpuData.rogueDetails?.severity || 'medium';
          switch(severity) {
            case 'critical':
              nodeColor = 0xff0000; // Bright red for critical
              break;
            case 'high':
              nodeColor = 0xe60000; // Slightly darker red for high
              break;
            case 'medium':
              nodeColor = 0xcc0000; // Even darker red for medium
              break;
            default:
              nodeColor = 0xb30000; // Darkest red for low
          }
        } else {
          // Normal nodes get color by GPU model
          switch(gpuData.model) {
            case "H200":
              nodeColor = 0x00ffff; // Cyan for H200
              break;
            case "H100":
              nodeColor = 0x00ff00; // Green for H100
              break;
            case "A100":
              nodeColor = 0x0000ff; // Blue for A100
              break;
            case "V100":
              nodeColor = 0xff00ff; // Purple for V100
              break;
            default:
              nodeColor = 0xffff00; // Yellow for T100 or others
          }
        }
        
        const nodeMaterial = new THREE.MeshPhongMaterial({
          color: nodeColor,
          emissive: nodeColor,
          emissiveIntensity: 0.5
        });
        
        const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial);
        nodeMesh.position.copy(latLngToVector3(lat, lng, 2.05)); // Position slightly above the globe
        
        // Store the provider name and specific GPU data for this node
        nodeMesh.userData = { 
          nodeName,
          gpuIndex: i 
        };
        
        scene.add(nodeMesh);
        customNodes.push(nodeMesh);
        nodeNameMap.set(nodeMesh, nodeName);
        nodeDataMap.set(nodeMesh, gpuData); // Store GPU-specific data
        
        // Create pulse effect for rogue nodes
        if (gpuData.isRogue) {
          const pulse = createRogueNodePulse(nodeMesh);
          rogueNodePulsesRef.current.push(pulse);
        }
      }
      
      // Add a label for the provider at the base position
      const textSprite = createTextSprite(nodeName, {
        fontFace: 'Arial',
        fontSize: 10,
        borderColor: { r: 0, g: 0, b: 0, a: 1.0 },
        backgroundColor: { r: 0, g: 0, b: 0, a: 0.8 },
        textColor: { r: 255, g: 255, b: 255, a: 1.0 }
      });
      textSprite.position.copy(latLngToVector3(baseLat, baseLng, 2.05).multiplyScalar(1.05));
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

    // Simulate bad nodes
    const simulateBadNode = () => {
      // Reset previous bad node
      if (badNode !== null) {
        const prevNode = nodes[badNode];
        const material = prevNode.material as THREE.MeshPhongMaterial;
        material.color.setHex(0x00ff88);
        material.emissive.setHex(0x00ff88);
      }
      
      // Set new bad node
      const randomIndex = Math.floor(Math.random() * nodes.length);
      setBadNode(randomIndex);
      
      const nodeMesh = nodes[randomIndex];
      const material = nodeMesh.material as THREE.MeshPhongMaterial;
      material.color.setHex(0xff0000);
      material.emissive.setHex(0xff0000);
      
      // Create ripple effect
      createRipple(nodeMesh.position.clone());
    };

    // Create rogue node pulse effect with glow
    function createRogueNodePulse(node: THREE.Mesh) {
      // Create outer glow effect
      const glowGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0xff3333,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide,
      });
      
      const pulse = new THREE.Mesh(glowGeometry, glowMaterial);
      pulse.position.copy(node.position);
      scene.add(pulse);
      
      // Add a ring ripple that expands periodically
      const createRogueRipple = (position: THREE.Vector3) => {
        const rippleGeometry = new THREE.RingGeometry(0, 0.12, 32);
        const rippleMaterial = new THREE.MeshBasicMaterial({
          color: 0xff0000,
          transparent: true,
          opacity: 0.7,
          side: THREE.DoubleSide,
        });
        
        const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial);
        ripple.position.copy(position);
        ripple.lookAt(new THREE.Vector3(0, 0, 0));
        scene.add(ripple);
        
        ripplesRef.current.push({
          mesh: ripple,
          time: 0,
          maxSize: 0.7, // Larger max size for better visibility
          origin: node
        });
      };
      
      // Schedule periodic ripples for this node
      const rippleInterval = setInterval(() => {
        if (!node.parent) {
          clearInterval(rippleInterval); // Stop if node is removed
          return;
        }
        createRogueRipple(node.position.clone());
      }, 3000 + Math.random() * 2000); // Random interval between 3-5 seconds
      
      // Store the interval for cleanup
      rogueNodeIntervalsRef.current.push(rippleInterval);
      
      return {
        mesh: pulse,
        time: Math.random() * Math.PI * 2, // Random starting phase
        node: node
      };
    }
    
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
        const userData = nodeMesh.userData;
        
        if (nodeName && nodeState[nodeName]) {
          // Get the specific GPU data if available
          const gpuData = nodeDataMap.get(nodeMesh);
          
          // Update tooltip
          const worldPos = new THREE.Vector3();
          nodeMesh.getWorldPosition(worldPos);
          worldPos.project(camera);
          
          const x = (worldPos.x * 0.5 + 0.5) * containerRef.current!.clientWidth;
          const y = (-worldPos.y * 0.5 + 0.5) * containerRef.current!.clientHeight;
          
          setHoveredNode({
            name: nodeName,
            data: nodeState[nodeName],
            position: new THREE.Vector3(x, y, 0),
            gpuData: gpuData, // Pass the specific GPU data
            gpuIndex: userData.gpuIndex // Pass the index
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
      
      // Update controls
      controls.update();
      
      // Rotate the earth slowly
      earth.rotation.y += 0.0005;
      grid.rotation.y += 0.0005;
      
      // Animate ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        const ripple = ripplesRef.current[i];
        ripple.time += 0.03;
        const scale = Math.min(ripple.time, ripple.maxSize);
        ripple.mesh.scale.set(scale, scale, scale);
        
        // Properly cast material to access opacity property
        const material = ripple.mesh.material as THREE.MeshBasicMaterial;
        material.opacity = 0.8 * (1 - (ripple.time / ripple.maxSize));
        
        if (ripple.time >= ripple.maxSize) {
          scene.remove(ripple.mesh);
          ripplesRef.current.splice(i, 1);
        }
      }
      
      // Animate rogue node pulses with glowing effect
      rogueNodePulsesRef.current.forEach((pulse) => {
        pulse.time += 0.05;
        const pulseFactor = 1.0 + Math.sin(pulse.time) * 0.3;
        pulse.mesh.scale.set(pulseFactor, pulseFactor, pulseFactor);
        
        // Update pulse position to match node
        pulse.mesh.position.copy(pulse.node.position);
        
        // Adjust opacity for pulsing effect
        (pulse.mesh.material as THREE.MeshBasicMaterial).opacity = 0.3 + Math.abs(Math.sin(pulse.time * 0.5)) * 0.4;
      });
      
      renderer.render(scene, camera);
    }
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      debugLog(`Cleanup triggered for ID: ${uniqueId.current}, instance #${instanceIdRef.current}, GLOBE_INSTANCE_COUNT: ${GLOBE_INSTANCE_COUNT}`);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      
      // Clear all intervals
      rogueNodeIntervalsRef.current.forEach(interval => clearInterval(interval));
      
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

  // Update selectedProvider when hovering over a node
  useEffect(() => {
    if (hoveredNode) {
      setSelectedProvider(hoveredNode.name);
      // We don't automatically show the panel here, to keep it persistent
    }
  }, [hoveredNode]);

  // Get provider names for dropdown
  const providerNames = useMemo(() => Object.keys(nodeState), [nodeState]);

  // Helper function to format price display
  const formatPrice = (price: number | null): string => {
    if (price === null) return 'Free';
    return `$${price.toFixed(2)}/hr`;
  };

  // Toggle trust for a specific GPU
  const toggleTrust = (providerName: string, gpuIndex: number, trustValue: boolean) => {
    setNodeState(prevState => {
      // Clone the state
      const newState = { ...prevState };
      
      // Check if provider exists
      if (!newState[providerName]) {
        console.warn(`Provider ${providerName} not found in nodeState`);
        return prevState; // Return unchanged state if provider doesn't exist
      }
      
      // Check if GPU index is valid
      if (!newState[providerName].gpus || gpuIndex >= newState[providerName].gpus.length) {
        console.warn(`GPU index ${gpuIndex} not found for provider ${providerName}`);
        return prevState; // Return unchanged state if GPU doesn't exist
      }
      
      // Set the trust value (true for trust, false for distrust)
      newState[providerName].gpus[gpuIndex].userTrusted = trustValue;
      return newState;
    });
  };

  // Check if a GPU is trusted
  const isGpuTrusted = (providerName: string, gpuIndex: number): boolean => {
    return nodeState[providerName]?.gpus[gpuIndex]?.userTrusted === true;
  };

  // Check if a GPU is distrusted
  const isGpuDistrusted = (providerName: string, gpuIndex: number): boolean => {
    return nodeState[providerName]?.gpus[gpuIndex]?.userTrusted === false;
  };

  // Invest in a provider
  const investInProvider = (providerName: string, amount: number) => {
    if (!providerName || amount <= 0) return;
    
    setInvestments(prev => {
      const currentAmount = prev[providerName] || 0;
      return {
        ...prev,
        [providerName]: currentAmount + amount
      };
    });
  };

  return (
    <div 
      id={`globe-container-${uniqueId.current}`}
      className="relative w-full h-full" 
      style={{ 
        position: 'relative', 
        minHeight: '600px',
      }} 
      ref={containerRef}
    >
      {/* TRUST PANEL - ULTRA COMPACT DESIGN */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          maxHeight: '80vh',
          width: '260px',
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          color: 'white',
          padding: '12px',
          border: '1px solid #3b82f6',
          borderRadius: '6px',
          zIndex: 100000,
          overflowY: 'auto',
          boxShadow: '0 0 15px rgba(0,0,0,0.4)',
          fontSize: '12px'
        }}
      >
        <h2 style={{ fontSize: '15px', marginBottom: '8px', borderBottom: '1px solid #3b82f6', paddingBottom: '6px' }}>
          <span style={{ color: '#3b82f6', marginRight: '6px' }}>☑</span>
          Trust Management
        </h2>
        
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '3px', color: '#94a3b8', fontSize: '11px' }}>Provider:</label>
          <select 
            value={selectedProvider || ''} 
            onChange={(e) => setSelectedProvider(e.target.value)}
            style={{
              width: '100%',
              padding: '4px',
              backgroundColor: '#1e293b',
              color: 'white',
              border: '1px solid #475569',
              borderRadius: '3px',
              fontSize: '11px'
            }}
          >
            {Object.keys(NODE_DATA).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
        
        {selectedProvider && (
          <>
            {/* Investment Section */}
            <div style={{ 
              marginBottom: '8px', 
              padding: '6px', 
              backgroundColor: 'rgba(59, 130, 246, 0.2)', 
              borderRadius: '4px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '13px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>Investment:</span>
                <span style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  ${investments[selectedProvider] ? investments[selectedProvider].toLocaleString() : '0'}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                <input
                  type="number"
                  value={currentInvestmentInput}
                  onChange={(e) => setCurrentInvestmentInput(e.target.value)}
                  placeholder="Amount"
                  style={{
                    flex: 1,
                    padding: '3px 5px',
                    backgroundColor: '#1e293b',
                    color: 'white',
                    border: '1px solid #475569',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                  min="0"
                />
                <button
                  onClick={() => {
                    const amount = parseFloat(currentInvestmentInput);
                    if (!isNaN(amount) && amount > 0 && selectedProvider) {
                      investInProvider(selectedProvider, amount);
                      setCurrentInvestmentInput("");
                    }
                  }}
                  style={{
                    padding: '3px 6px',
                    backgroundColor: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Invest
                </button>
              </div>
            </div>
            
            <h3 style={{ fontSize: '13px', marginBottom: '6px', color: '#e2e8f0' }}>
              GPUs:
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {nodeState[selectedProvider]?.gpus.map((gpu, idx) => (
                <div 
                  key={idx}
                  style={{
                    backgroundColor: isGpuTrusted(selectedProvider, idx) ? 'rgba(6, 95, 70, 0.7)' : 
                                    isGpuDistrusted(selectedProvider, idx) ? 'rgba(127, 29, 29, 0.7)' : 'rgba(30, 41, 59, 0.7)',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #475569'
                  }}
                >
                  <div style={{ marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{gpu.model}</div>
                      <div style={{ fontSize: '10px', opacity: 0.8, color: '#94a3b8' }}>{gpu.VRAM}</div>
                    </div>
                    
                    {gpu.isRogue && (
                      <div style={{ 
                        backgroundColor: '#991b1b', 
                        display: 'inline-block',
                        padding: '1px 3px',
                        borderRadius: '2px',
                        fontSize: '9px'
                      }}>
                        ⚠️
                      </div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => toggleTrust(selectedProvider, idx, true)}
                      style={{
                        flex: 1,
                        padding: '3px 0',
                        backgroundColor: isGpuTrusted(selectedProvider, idx) ? '#059669' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Trust
                    </button>
                    <button
                      onClick={() => toggleTrust(selectedProvider, idx, false)}
                      style={{
                        flex: 1,
                        padding: '3px 0',
                        backgroundColor: isGpuDistrusted(selectedProvider, idx) ? '#b91c1c' : '#334155',
                        color: 'white',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                        fontSize: '11px'
                      }}
                    >
                      Distrust
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Ultra compact legend */}
        <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px solid #475569', fontSize: '10px', color: '#94a3b8' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#059669', borderRadius: '50%', marginRight: '4px' }}></span>
              <span>Trusted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#b91c1c', borderRadius: '50%', marginRight: '4px' }}></span>
              <span>Distrusted</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: '#f59e0b', borderRadius: '50%', marginRight: '4px' }}></span>
              <span>Neutral</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add loading indicator */}
      {isLoading && (
        <div className="absolute top-4 right-4 bg-black/80 text-white p-2 rounded-md shadow-lg z-50 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          <span className="text-xs">Updating Network...</span>
        </div>
      )}
      
      {/* Add last updated time */}
      {lastUpdated && (
        <div className="absolute top-4 left-4 bg-black/80 text-white p-2 rounded-md shadow-lg z-50 text-xs">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {/* Hovering info for regions */}
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
      
      {/* Tooltip for nodes */}
      {hoveredNode && (
        <div 
          className="absolute z-10 bg-black/90 border border-gray-700 rounded-md p-4 text-sm font-mono pointer-events-none"
          style={{
            left: `${hoveredNode.position.x}px`,
            top: `${hoveredNode.position.y + 20}px`,
            transform: 'translate(-50%, 0)',
            boxShadow: '0 0 20px rgba(0, 100, 255, 0.3)',
            color: 'white',
            maxWidth: '350px',
            borderColor: hoveredNode.gpuData?.isRogue ? '#ff3333' : '#888888',
          }}
        >
          <div className="flex flex-col gap-2">
            <div className="text-lg font-bold border-b border-gray-700 pb-2 mb-2">
              {hoveredNode.name}
              {hoveredNode.gpuData && (
                <span className={`ml-2 ${hoveredNode.gpuData.isRogue ? 'text-red-400' : 'text-blue-400'}`}>
                  - {hoveredNode.gpuData.model}
                </span>
              )}
            </div>
            
            {/* Display rogue status warning if applicable */}
            {hoveredNode.gpuData?.isRogue && hoveredNode.gpuData?.rogueDetails && (
              <div className="mt-2 bg-red-900/50 border border-red-700 rounded p-2 text-xs">
                <div className="font-bold text-red-400 uppercase flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  ROGUE NODE DETECTED
                </div>
                <div className="mt-1 grid grid-cols-3 gap-1">
                  <span className="text-gray-400">Threat:</span>
                  <span className="col-span-2 font-bold text-red-300">{hoveredNode.gpuData.rogueDetails.threat}</span>
                  
                  <span className="text-gray-400">Severity:</span>
                  <span className="col-span-2 font-bold text-red-300">{hoveredNode.gpuData.rogueDetails.severity}</span>
                  
                  {hoveredNode.gpuData.rogueDetails.detectedAt && (
                    <>
                      <span className="text-gray-400">Detected:</span>
                      <span className="col-span-2">{new Date(hoveredNode.gpuData.rogueDetails.detectedAt).toLocaleString()}</span>
                    </>
                  )}
                </div>
                {hoveredNode.gpuData.rogueDetails.suspiciousActivity && (
                  <div className="mt-2">
                    <span className="text-gray-400 block">Suspicious Activity:</span>
                    <span className="block mt-1">{hoveredNode.gpuData.rogueDetails.suspiciousActivity}</span>
                  </div>
                )}
                {hoveredNode.gpuData.rogueDetails.recommendedAction && (
                  <div className="mt-2">
                    <span className="text-gray-400 block">Recommended Action:</span>
                    <span className="block mt-1 font-bold text-yellow-400">{hoveredNode.gpuData.rogueDetails.recommendedAction}</span>
                  </div>
                )}
              </div>
            )}
            
            {hoveredNode.gpuData && (
              <div className="mt-2 border-t border-gray-700 pt-2">
                <div className="text-sm font-bold mb-2">GPU Details:</div>
                <div className="bg-gray-900 p-2 rounded">
                  <div className="font-bold text-blue-400">{hoveredNode.gpuData.model} ({hoveredNode.gpuData.VRAM})</div>
                  {hoveredNode.gpuData.socket && (
                    <div className="text-xs text-gray-400">Socket: {hoveredNode.gpuData.socket}</div>
                  )}
                  {hoveredNode.gpuData.agent && (
                    <div className="text-xs text-gray-400">Agent: {hoveredNode.gpuData.agent}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}