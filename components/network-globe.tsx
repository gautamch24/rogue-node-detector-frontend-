"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { useNodeStore } from "@/lib/store"
import { generateRandomNodes } from "@/lib/node-generator"

export default function NetworkGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { setActiveNode, setNodes } = useNodeStore()
  const [hoveredNode, setHoveredNode] = useState<{ node: any; position: THREE.Vector3 } | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!containerRef.current || isInitialized || !isClient) return
    
    // Ensure container has dimensions
    if (containerRef.current.clientWidth === 0 || containerRef.current.clientHeight === 0) {
      containerRef.current.style.width = '100%'
      containerRef.current.style.height = '100%'
      containerRef.current.style.minHeight = '600px'
    }

    // Generate random nodes
    const nodes = generateRandomNodes(50)
    setNodes(nodes)

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    )
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
    containerRef.current.innerHTML = '' // Clear any existing content
    containerRef.current.appendChild(renderer.domElement)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = true
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5

    // Earth
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthMaterial = new THREE.MeshBasicMaterial({
      color: 0x1a2e4a,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    scene.add(earth)

    // Glow effect
    const glowGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a84ff,
      transparent: true,
      opacity: 0.1,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(glow)

    // Node meshes
    const nodeObjects: THREE.Mesh[] = []
    const nodeGeometry = new THREE.SphereGeometry(0.03, 16, 16)
    
    // Create a larger geometry for hover effect
    const hoverGeometry = new THREE.SphereGeometry(0.05, 16, 16)
    
    // Create a pulsing geometry for rogue nodes
    const rogueHoverGeometry = new THREE.SphereGeometry(0.06, 16, 16)

    nodes.forEach((node, index) => {
      const { position } = node
      const nodeMaterial = new THREE.MeshStandardMaterial({
        color: node.status === "rogue" ? 0xff3b30 : 0x34c759,
        emissive: node.status === "rogue" ? new THREE.Color(0xff3b30) : new THREE.Color(0x000000),
        emissiveIntensity: node.status === "rogue" ? 0.3 : 0,
        roughness: 0.5,
        metalness: 0.8,
      })

      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
      nodeMesh.position.set(position.x * 2, position.y * 2, position.z * 2)
      nodeMesh.userData = { 
        nodeIndex: index,
        originalScale: nodeMesh.scale.clone(),
        isRogue: node.status === "rogue",
        node: node
      }
      scene.add(nodeMesh)
      nodeObjects.push(nodeMesh)
    })

    // Connection lines
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x4c6ef5,
      transparent: true,
      opacity: 0.3,
    })

    for (let i = 0; i < nodes.length; i++) {
      // Connect to 2-3 nearest nodes
      const connections = Math.floor(Math.random() * 2) + 2

      for (let j = 0; j < connections; j++) {
        const targetIndex = (i + j + 1) % nodes.length

        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          nodeObjects[i].position,
          nodeObjects[targetIndex].position,
        ])

        const line = new THREE.Line(lineGeometry, connectionMaterial)
        scene.add(line)
      }
    }

    // Raycaster for node selection and hover
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(nodeObjects)

      if (intersects.length > 0) {
        const nodeIndex = intersects[0].object.userData.nodeIndex
        setActiveNode(nodes[nodeIndex])
      }
    }

    // Handle mouse move for hover effects
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(nodeObjects)

      // Reset all nodes to original scale
      nodeObjects.forEach((node) => {
        node.scale.copy(node.userData.originalScale)
      })

      // If hovering over a node
      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as THREE.Mesh
        const nodeIndex = hoveredMesh.userData.nodeIndex
        const isRogue = hoveredMesh.userData.isRogue
        
        // Apply bulge effect
        const scaleFactor = isRogue ? 2.5 : 2.0
        hoveredMesh.scale.set(scaleFactor, scaleFactor, scaleFactor)
        
        // Update hover state for tooltip
        const worldPosition = new THREE.Vector3()
        hoveredMesh.getWorldPosition(worldPosition)
        
        // Project the 3D position to 2D screen coordinates
        if (!containerRef.current) return;
        
        const widthHalf = containerRef.current.clientWidth / 2
        const heightHalf = containerRef.current.clientHeight / 2
        
        const vector = worldPosition.clone()
        vector.project(camera)
        
        vector.x = (vector.x * widthHalf) + widthHalf
        vector.y = -(vector.y * heightHalf) + heightHalf
        
        setHoveredNode({
          node: nodes[nodeIndex],
          position: vector
        })
        
        // Add glow effect for rogue nodes
        if (isRogue) {
          const nodeMaterial = hoveredMesh.material as THREE.MeshStandardMaterial
          nodeMaterial.emissive = new THREE.Color(0xff3b30)
          nodeMaterial.emissiveIntensity = 0.5
        }
      } else {
        setHoveredNode(null)
      }
    }

    renderer.domElement.addEventListener("click", onMouseClick)
    renderer.domElement.addEventListener("mousemove", onMouseMove)

    // Simulate rogue node detection
    const simulateRogueNode = () => {
      const randomIndex = Math.floor(Math.random() * nodes.length)
      const updatedNodes = [...nodes]

      // Reset all nodes
      updatedNodes.forEach((node) => {
        node.status = "normal"
      })

      // Set random node as rogue
      updatedNodes[randomIndex].status = "rogue"
      updatedNodes[randomIndex].detectedAt = new Date().toISOString()
      updatedNodes[randomIndex].threat = {
        type: ["Data Exfiltration", "Malware", "Unauthorized Access", "DDoS Source"][Math.floor(Math.random() * 4)],
        severity: ["Critical", "High", "Medium"][Math.floor(Math.random() * 3)],
        confidence: Math.floor(Math.random() * 30) + 70,
      }

      // Update node color
      const nodeMaterial = nodeObjects[randomIndex].material as THREE.MeshStandardMaterial
      nodeMaterial.color.set(0xff3b30)
      nodeMaterial.emissive.set(0xff3b30)
      nodeMaterial.emissiveIntensity = 0.3
      
      // Update node userData
      nodeObjects[randomIndex].userData.isRogue = true

      setNodes(updatedNodes)
      setActiveNode(updatedNodes[randomIndex])
    }

    // Simulate rogue node detection every 8-15 seconds
    const rogueNodeInterval = setInterval(
      () => {
        simulateRogueNode()
      },
      Math.random() * 7000 + 8000,
    )

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      controls.update()
      
      // Add pulsing effect to rogue nodes
      nodeObjects.forEach((nodeMesh) => {
        if (nodeMesh.userData.isRogue) {
          const time = Date.now() * 0.001
          const pulse = Math.sin(time * 3) * 0.1 + 1
          
          // Only apply pulse if not currently hovered
          if (hoveredNode?.node.id !== nodes[nodeMesh.userData.nodeIndex].id) {
            nodeMesh.scale.set(pulse, pulse, pulse)
          }
        }
      })
      
      renderer.render(scene, camera)
    }

    animate()
    setIsInitialized(true)

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return

      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement)
      }
      renderer.domElement.removeEventListener("click", onMouseClick)
      renderer.domElement.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("resize", handleResize)
      clearInterval(rogueNodeInterval)
    }
  }, [isInitialized, setActiveNode, setNodes, isClient])

  if (!isClient) {
    return <div className="relative flex-1 h-full min-h-[600px] w-full" ref={containerRef}></div>
  }

  return (
    <div className="relative flex-1 h-full min-h-[600px] w-full" ref={containerRef}>
      {hoveredNode && (
        <div 
          className={`absolute pointer-events-none z-10 bg-gray-900/90 border ${hoveredNode.node.status === 'rogue' ? 'border-red-500 shadow-red-500/30 shadow-lg' : 'border-green-500'} rounded-md p-2 text-xs font-mono w-64`}
          style={{
            left: `${hoveredNode.position.x}px`,
            top: `${hoveredNode.position.y + 20}px`,
            transform: 'translate(-50%, 0)'
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className="font-bold">{hoveredNode.node.id}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${hoveredNode.node.status === 'rogue' ? 'bg-red-900/50 text-red-400' : 'bg-green-900/50 text-green-400'}`}>
              {hoveredNode.node.status.toUpperCase()}
            </span>
          </div>
          <div className="text-gray-400 mb-1">{hoveredNode.node.location}</div>
          
          {hoveredNode.node.status === 'rogue' && (
            <div className="mt-2 pt-2 border-t border-gray-700">
              <div className="text-red-400 font-bold mb-1">⚠️ {hoveredNode.node.threat?.type}</div>
              <div className="flex justify-between text-xs">
                <span>Severity: {hoveredNode.node.threat?.severity}</span>
                <span>Confidence: {hoveredNode.node.threat?.confidence}%</span>
              </div>
            </div>
          )}
          
          <div className="mt-2 pt-2 border-t border-gray-700 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div>
              <span className="text-gray-400">IP: </span>
              <span>{hoveredNode.node.specs?.ip}</span>
            </div>
            <div>
              <span className="text-gray-400">CPU: </span>
              <span className="truncate">{hoveredNode.node.specs?.cpu.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-4 left-4 text-xs text-green-400 font-mono">
        <div>NETWORK STATUS: MONITORING</div>
        <div>NODES: ACTIVE</div>
        <div>THREAT DETECTION: ENABLED</div>
      </div>
    </div>
  )
}
