"use client"

import { useEffect, useState } from "react"
import { Activity, Shield, AlertTriangle } from "lucide-react"
import { useNodeStore } from "@/lib/store"

export default function StatusBar() {
  const { nodes } = useNodeStore()
  const [time, setTime] = useState(new Date())
  const [alerts, setAlerts] = useState(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
        <div className="flex items-center gap-2">
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
        {isClient ? (
          <div>{time.toLocaleTimeString()}</div>
        ) : (
          <div>--:--:--</div>
        )}
      </div>
    </div>
  )
}
