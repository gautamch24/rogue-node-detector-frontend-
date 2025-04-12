"use client"

import { useEffect, useState } from "react"
import { useNodeStore } from "../lib/store"

// Simple SVG icons
const Activity = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
)

const Shield = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
  </svg>
)

const AlertTriangle = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <path d="M12 9v4"></path>
    <path d="M12 17h.01"></path>
  </svg>
)

export default function StatusBar() {
  const { nodes } = useNodeStore()
  const [time, setTime] = useState(new Date())
  const [alerts, setAlerts] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const rogueNodes = nodes.filter((node) => node.status === "rogue")
    setAlerts(rogueNodes.length)
  }, [nodes])

  return (
    <div className="h-10 bg-gray-900/80 border-b border-gray-800 backdrop-blur-sm flex items-center justify-between px-4 text-xs font-mono">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-green-500" />
          <span>NETWORK MONITOR</span>
        </div>
        <div className="flex items-center gap-  />
          <span>NETWORK MONITOR</span>
        </div>
        <div className=\"flex items-center gap-2">
          <Shield size={14} className="text-blue-500" />
          <span>NODES: {nodes.length}</span>
        </div>
        {alerts > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500" />
            <span className="text-red-500">ALERTS: {alerts}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-6">
        <div>LAT: 37.7749° N, LONG: 122.4194° W</div>
        <div>{time.toLocaleTimeString()}</div>
      </div>
    </div>
  )
}
