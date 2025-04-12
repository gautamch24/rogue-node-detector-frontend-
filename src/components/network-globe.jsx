"use client"

import { useEffect, useRef, useState } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { useNodeStore } from "../lib/store"
import { generateRandomNodes } from "../lib/node-generator"

export default function NetworkGlobe() {
  const containerRef = useRef(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const { setActiveNode, setNodes } = useNodeStore()

  useEffect(() => {
    if (!containerRef.current || isInitialized) return

    // Generate random nodes
    const nodes = generateRandomNodes(50)
    setNodes(nodes)

    // Scene setup
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.z = 5

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setClearColor(0x000000, 0)
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
    const nodeObjects = []
    const nodeGeometry = new THREE.SphereGeometry(0.03, 16, 16)

    nodes.forEach((node, index) => {
      const { position } = node
      const nodeMaterial = new THREE.MeshBasicMaterial({
        color: node.status === "rogue" ? 0xff3b30 : 0x34c759,
      })

      const nodeMesh = new THREE.Mesh(nodeGeometry, nodeMaterial)
      nodeMesh.position.set(position.x * 2, position.y * 2, position.z * 2)
      nodeMesh.userData = { nodeIndex: index }
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

    // Raycaster for node selection
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    const onMouseClick = (event) => {
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

    renderer.domElement.addEventListener("click", onMouseClick)

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
      const nodeMaterial = nodeObjects[randomIndex].material
      nodeMaterial.color.set(0xff3b30)

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
      window.removeEventListener("resize", handleResize)
      clearInterval(rogueNodeInterval)
    }
  }, [isInitialized, setActiveNode, setNodes])

  return (
    <div className="relative flex-1 h-full" ref={containerRef}>
      <div className="absolute bottom-4 left-4 text-xs text-green-400 font-mono">
        <div>NETWORK STATUS: MONITORING</div>
        <div>NODES: ACTIVE</div>
        <div>THREAT DETECTION: ENABLED</div>
      </div>
    </div>
  )
}
