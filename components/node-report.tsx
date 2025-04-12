"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNodeStore } from "@/lib/store"
import { AlertTriangle, Shield, Server, Cpu, Database, Globe } from "lucide-react"

export default function NodeReport() {
  const { activeNode } = useNodeStore()
  const [isVisible, setIsVisible] = useState(false)
  const [activityLogs, setActivityLogs] = useState<string[]>([])

  useEffect(() => {
    if (activeNode) {
      setIsVisible(true)

      // Generate random activity logs
      if (activeNode.status === "rogue") {
        const newLogs = [
          `[${new Date().toLocaleTimeString()}] Anomalous traffic pattern detected`,
          `[${new Date().toLocaleTimeString()}] Unusual port scanning activity`,
          `[${new Date().toLocaleTimeString()}] Multiple failed authentication attempts`,
          `[${new Date().toLocaleTimeString()}] Suspicious outbound connections`,
          `[${new Date().toLocaleTimeString()}] Threat signature matched: ${activeNode.threat?.type}`,
          `[${new Date().toLocaleTimeString()}] Node quarantine initiated`,
        ]
        setActivityLogs(newLogs)
      } else {
        const newLogs = [
          `[${new Date().toLocaleTimeString()}] Regular heartbeat received`,
          `[${new Date().toLocaleTimeString()}] System health check: OK`,
          `[${new Date().toLocaleTimeString()}] Security scan completed`,
        ]
        setActivityLogs(newLogs)
      }
    }
  }, [activeNode])

  if (!isVisible || !activeNode) {
    return null
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  const getStatusColor = (status: string) => {
    return status === "rogue" ? "text-red-500" : "text-green-500"
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString()
  }

  return (
    <div className="w-96 h-full bg-gray-900/80 border-l border-gray-800 backdrop-blur-sm overflow-auto">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-mono font-bold flex items-center gap-2">
          <Server size={18} />
          Node Report
        </h2>
        <button onClick={handleClose} className="text-gray-400 hover:text-white">
          ×
        </button>
      </div>

      <div className="p-4">
        {activeNode.status === "rogue" && (
          <div className="mb-4 bg-red-900/30 border border-red-800 rounded-md p-3 flex items-start gap-3">
            <AlertTriangle className="text-red-500 mt-0.5" size={18} />
            <div>
              <h3 className="font-bold text-red-500">Alert: Rogue Node Detected</h3>
              <p className="text-sm text-gray-300">
                This node has been flagged for suspicious activity and quarantined.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-1">Node ID</div>
            <div className="font-mono">{activeNode.id}</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-1">Status</div>
            <div className={`font-mono ${getStatusColor(activeNode.status)}`}>{activeNode.status.toUpperCase()}</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-1">Location</div>
            <div className="font-mono">{activeNode.location}</div>
          </div>
          <div className="bg-gray-800/50 rounded-md p-3">
            <div className="text-xs text-gray-400 mb-1">Last Updated</div>
            <div className="font-mono text-sm">{formatDate(activeNode.lastUpdated)}</div>
          </div>
        </div>

        {activeNode.status === "rogue" && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Shield size={16} />
              Threat Assessment
            </h3>
            <div className="bg-gray-800/50 rounded-md p-3 grid gap-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Type</div>
                <Badge variant="destructive">{activeNode.threat?.type}</Badge>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Severity</div>
                <div className="font-mono text-red-500">{activeNode.threat?.severity}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Detection Confidence</div>
                <div className="flex items-center gap-2">
                  <Progress value={activeNode.threat?.confidence} className="h-2" />
                  <span className="text-xs">{activeNode.threat?.confidence}%</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-1">Detected At</div>
                <div className="font-mono text-sm">{formatDate(activeNode.detectedAt)}</div>
              </div>
            </div>
          </div>
        )}

        <Tabs defaultValue="activity">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="specs">Specs</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="mt-0">
            <div className="bg-black/50 border border-gray-800 rounded-md p-3 h-48 overflow-y-auto font-mono text-xs">
              {activityLogs.map((log, index) => (
                <div key={index} className="mb-1 text-green-400">
                  {log}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="specs" className="mt-0">
            <div className="bg-black/50 border border-gray-800 rounded-md p-3 h-48 overflow-y-auto">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <Cpu size={14} />
                  <div className="text-xs">
                    <div className="text-gray-400">CPU</div>
                    <div>{activeNode.specs?.cpu || "Intel Xeon E5-2680 v4"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Database size={14} />
                  <div className="text-xs">
                    <div className="text-gray-400">Memory</div>
                    <div>{activeNode.specs?.memory || "64GB DDR4"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Server size={14} />
                  <div className="text-xs">
                    <div className="text-gray-400">Storage</div>
                    <div>{activeNode.specs?.storage || "2TB NVMe SSD"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  <div className="text-xs">
                    <div className="text-gray-400">IP Address</div>
                    <div className="font-mono">{activeNode.specs?.ip || "192.168.1.1"}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="mt-0">
            <div className="bg-black/50 border border-gray-800 rounded-md p-3 h-48 overflow-y-auto">
              <div className="grid gap-3">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Bandwidth Usage</div>
                  <Progress value={activeNode.network?.bandwidth || 78} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span>0 Mbps</span>
                    <span>{activeNode.network?.bandwidth || 78} Mbps</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Packet Loss</div>
                  <div className="font-mono">{activeNode.network?.packetLoss || "0.2%"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Latency</div>
                  <div className="font-mono">{activeNode.network?.latency || "24ms"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Connected Peers</div>
                  <div className="font-mono">{activeNode.network?.peers || 12}</div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
