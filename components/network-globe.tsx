"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredRegion, setHoveredRegion] = useState<{ name: string; position: THREE.Vector3 } | null>(null);
  const [badNode, setBadNode] = useState<number | null>(null);

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
    if (!containerRef.current) return;

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

    // Start the simulation
    const simInterval = setInterval(simulateBadNode, 5000);

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
      
      // Check nodes intersection first
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
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      clearInterval(simInterval);
      
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
    };
  }, []);
  
  return (
    <div 
      className="w-full h-full" 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        minHeight: '600px' 
      }} 
      ref={containerRef}
    >
      {hoveredRegion && (
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
      
      <div className="absolute bottom-4 left-4 text-xs text-[#00ff88] font-mono">
        <div>GLOBAL NETWORK: ACTIVE</div>
        <div>NODES: {ALL_NODES.length - (badNode !== null ? 1 : 0)} HEALTHY / {ALL_NODES.length} TOTAL</div>
        <div>SYSTEM: OPERATIONAL</div>
      </div>
    </div>
  );
}