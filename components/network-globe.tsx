"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"

// Define regions with their coordinates and names
const REGIONS = [
  { name: "North America", lat: 40, lng: -100, connections: [1, 2, 3], color: 0x00ff88 },
  { name: "Europe", lat: 50, lng: 10, connections: [0, 2, 4], color: 0x00ff88 },
  { name: "Asia", lat: 35, lng: 105, connections: [1, 3, 4], color: 0x00ff88 },
  { name: "South America", lat: -15, lng: -55, connections: [0, 2, 4], color: 0x00ff88 },
  { name: "Australia", lat: -25, lng: 135, connections: [1, 2, 3], color: 0x00ff88 }
]

// Generate random nodes within each region
const generateNodesForRegion = (region: typeof REGIONS[0], count: number) => {
  const nodes = []
  for (let i = 0; i < count; i++) {
    const latOffset = (Math.random() - 0.5) * 20
    const lngOffset = (Math.random() - 0.5) * 20
    nodes.push({
      lat: region.lat + latOffset,
      lng: region.lng + lngOffset,
      color: 0x00ff88
    })
  }
  return nodes
}

const ALL_NODES = REGIONS.flatMap(region => generateNodesForRegion(region, 10))

export default function NetworkGlobe() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredRegion, setHoveredRegion] = useState<{ name: string; position: THREE.Vector3 } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [nodeStates, setNodeStates] = useState(ALL_NODES.map(() => ({ color: 0x00ff88 })))
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)

  useEffect(() => {
    if (!containerRef.current || isInitialized) return

    const container = containerRef.current

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(0x000000, 0.00003)

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      10000
    )
    camera.position.z = 5

    // Renderer setup with post-processing
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    renderer.setClearColor(0x000000, 1)
    container.appendChild(renderer.domElement)

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x0a192f, 0.2)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0x00ff88, 0.5)
    directionalLight.position.set(5, 3, 5)
    scene.add(directionalLight)

    // Earth creation
    const earthGeometry = new THREE.SphereGeometry(2, 64, 64)
    const earthMaterial = new THREE.MeshPhongMaterial({
      color: 0x0a192f,
      emissive: 0x0a192f,
      emissiveIntensity: 0.2,
      shininess: 25,
      transparent: true,
      opacity: 0.9,
    })
    const earth = new THREE.Mesh(earthGeometry, earthMaterial)
    scene.add(earth)

    // Region highlighting
    const regionHighlightMaterials = REGIONS.map(() => {
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ff88,
        transparent: true,
        opacity: 0,
        side: THREE.BackSide,
      })
      const geometry = new THREE.SphereGeometry(2.02, 32, 32)
      const mesh = new THREE.Mesh(geometry, material)
      scene.add(mesh)
      return { material, mesh }
    })

    // Grid overlay
    const gridGeometry = new THREE.SphereGeometry(2.01, 32, 32)
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    })
    const grid = new THREE.Mesh(gridGeometry, gridMaterial)
    scene.add(grid)

    // Atmosphere glow
    const glowGeometry = new THREE.SphereGeometry(2.1, 64, 64)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.1,
    })
    const glow = new THREE.Mesh(glowGeometry, glowMaterial)
    scene.add(glow)

    // Create nodes for each region
    const nodeObjects: THREE.Mesh[] = []
    const nodeGeometry = new THREE.SphereGeometry(0.03, 16, 16)
    
    // Create nodes and connections
    const connectionMaterial = new THREE.LineBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.2,
    })

    ALL_NODES.forEach((node, index) => {
      const position = latLngToVector3(node.lat, node.lng, 2)
      const nodeMaterial = new THREE.MeshPhongMaterial({
        color: node.color,
        emissive: node.color,
        emissiveIntensity: 0.5,
      })
      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
      nodeMesh.position.copy(position)
      nodeMesh.userData = { nodeIndex: index }
      nodeObjects.push(nodeMesh)
      scene.add(nodeMesh)
    })

    // Create ripple effect
    const createRipple = (position: THREE.Vector3) => {
      const rippleGeometry = new THREE.RingGeometry(0, 0.2, 32)
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 1,
        side: THREE.DoubleSide,
      })
      const ripple = new THREE.Mesh(rippleGeometry, rippleMaterial)
      ripple.position.copy(position)
      ripple.lookAt(new THREE.Vector3(0, 0, 0))
      scene.add(ripple)

      const startTime = Date.now()
      const animate = () => {
        const elapsed = Date.now() - startTime
        const duration = 1000 // 1 second animation
        if (elapsed < duration) {
          const scale = elapsed / duration * 2
          ripple.scale.set(scale, scale, scale)
          rippleMaterial.opacity = 1 - (elapsed / duration)
          requestAnimationFrame(animate)
        } else {
          scene.remove(ripple)
          ripple.geometry.dispose()
          rippleMaterial.dispose()
        }
      }
      animate()
    }

    // Simulate bad nodes
    const simulateBadNodes = () => {
      const randomIndex = Math.floor(Math.random() * ALL_NODES.length)
      setNodeStates(prevStates => {
        const newStates = [...prevStates]
        newStates[randomIndex] = { color: 0xff0000 }
        const position = nodeObjects[randomIndex].position.clone()
        createRipple(position)
        return newStates
      })

      // Reset after 2 seconds
      setTimeout(() => {
        setNodeStates(prevStates => {
          const newStates = [...prevStates]
          newStates[randomIndex] = { color: 0x00ff88 }
          return newStates
        })
      }, 2000)
    }

    // Start simulation
    const simulationInterval = setInterval(simulateBadNodes, 5000)

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controls.rotateSpeed = 0.5
    controls.enableZoom = true
    controls.minDistance = 3
    controls.maxDistance = 10
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.5
    controlsRef.current = controls
    
    // Add mouse down/up event listeners to prevent conflicts
    const onMouseDown = () => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = false;
      }
    };
    
    const onMouseUp = () => {
      if (controlsRef.current) {
        controlsRef.current.autoRotate = true;
      }
    };
    
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mouseup", onMouseUp);

    // Raycaster for hover effects
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseMove = (event: MouseEvent) => {
      // Prevent default behavior to avoid conflicts with OrbitControls
      event.preventDefault();
      
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(nodeObjects)

      // Reset all nodes
      nodeObjects.forEach(node => {
        const material = node.material as THREE.MeshPhongMaterial
        material.emissiveIntensity = 0.5
        node.scale.set(1, 1, 1)
      })

      if (intersects.length > 0) {
        const hoveredMesh = intersects[0].object as THREE.Mesh
        const nodeIndex = hoveredMesh.userData.nodeIndex
        
        // Find region by checking which region's bounds the node falls into
        let foundRegionIndex = -1
        for (let i = 0; i < REGIONS.length; i++) {
          const region = REGIONS[i]
          const node = ALL_NODES[nodeIndex]
          const latDiff = Math.abs(node.lat - region.lat)
          const lngDiff = Math.abs(node.lng - region.lng)
          if (latDiff <= 20 && lngDiff <= 20) {
            foundRegionIndex = i
            break
          }
        }
        
        // Highlight hovered node
        const material = hoveredMesh.material as THREE.MeshPhongMaterial
        material.emissiveIntensity = 1
        hoveredMesh.scale.set(1.5, 1.5, 1.5)

        // Update tooltip and region highlighting only if we found a valid region
        if (foundRegionIndex !== -1) {
          const worldPosition = new THREE.Vector3()
          hoveredMesh.getWorldPosition(worldPosition)
          worldPosition.project(camera)
          
          const x = (worldPosition.x * 0.5 + 0.5) * container.clientWidth
          const y = (-worldPosition.y * 0.5 + 0.5) * container.clientHeight
          
          setHoveredRegion({
            name: REGIONS[foundRegionIndex].name,
            position: new THREE.Vector3(x, y, 0)
          })
          setSelectedRegion(foundRegionIndex)
        }
      } else {
        setHoveredRegion(null)
        setSelectedRegion(null)
      }
    }

    renderer.domElement.addEventListener("mousemove", onMouseMove)

    // Animation loop
    let animationFrameId: number
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      controls.update()

      // Update node colors
      nodeObjects.forEach((node, index) => {
        const material = node.material as THREE.MeshPhongMaterial
        material.color.setHex(nodeStates[index].color)
        material.emissive.setHex(nodeStates[index].color)
      })

      // Update region highlighting
      regionHighlightMaterials.forEach(({ material, mesh }, index) => {
        mesh.rotation.copy(earth.rotation)
        if (selectedRegion === index) {
          material.opacity = 0.2
        } else {
          material.opacity = 0
        }
      })

      // Pulse the glow
      const time = Date.now() * 0.001
      glow.scale.set(
        1 + Math.sin(time) * 0.03,
        1 + Math.sin(time) * 0.03,
        1 + Math.sin(time) * 0.03
      )

      renderer.render(scene, camera)
    }

    animate()
    setIsInitialized(true)

    // Handle window resize
    const handleResize = () => {
      if (!container) return
      const width = container.clientWidth
      const height = container.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize)
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      clearInterval(simulationInterval)
      renderer.domElement.removeEventListener("mousemove", onMouseMove)
      renderer.domElement.removeEventListener("mousedown", onMouseDown)
      renderer.domElement.removeEventListener("mouseup", onMouseUp)
      renderer.dispose()
      if (controlsRef.current) {
        controlsRef.current.dispose()
      }
    }
  }, [isInitialized])

  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const z = radius * Math.sin(phi) * Math.sin(theta)
    const y = radius * Math.cos(phi)
    return new THREE.Vector3(x, y, z)
  }

  return (
    <div className="w-full h-full" ref={containerRef}>
      {hoveredRegion && (
        <div 
          className="absolute pointer-events-none z-10 bg-black/80 border border-[#00ff88] rounded-md p-2 text-xs font-mono"
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
        <div>NODES: {nodeStates.filter(state => state.color === 0x00ff88).length} HEALTHY / {nodeStates.length} TOTAL</div>
        <div>SYSTEM: OPERATIONAL</div>
      </div>
    </div>
  )
}
