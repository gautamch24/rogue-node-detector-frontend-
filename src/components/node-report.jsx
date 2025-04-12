"use client"

import { useEffect, useState } from "react"
import { useNodeStore } from "../lib/store"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"

// Import icons from a React icon library like react-icons
// For this example, I'll use simple SVG components
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

const Server = (props) => (
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
    <rect width="20" height="8" x="2" y="2" rx="2" ry="2"></rect>
    <rect width="20" height="8" x="2" y="14" rx="2" ry="2"></rect>
    <line x1="6" x2="6" y1="6" y2="6"></line>
    <line x1="6" x2="6" y1="18" y2="18"></line>
  </svg>
)

const Cpu = (props) => (
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
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
    <rect x="9" y="9" width="6" height="6"></rect>
    <line x1="9" y1="2" x2="9" y2="4"></line>
    <line x1="15" y1="2" x2="15" y2="4"></line>
    <line x1="9" y1="20" x2="9" y2="22"></line>
    <line x1="15" y1="20" x2="15" y2="22"></line>
    <line x1="20" y1="9" x2="22" y2="9"></line>
    <line x1="20" y1="14" x2="22" y2="14"></line>
    <line x1="2" y1="9" x2="4" y2="9"></line>
    <line x1="2" y1="14" x2="4" y2="14"></line>
  </svg>
)

const Database = (props) => (
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
    <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
  </svg>
)

const Globe = (props) => (
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
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
)

export default function NodeReport() {
  const { activeNode } = useNodeStore()
  const [isVisible, setIsVisible] = useState(false)
  const [activityLogs, setActivityLogs] = useState([])

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

  const getStatusColor = (status) => {
    return status === "rogue" ? "text-red-500" : "text-green-500"
  }

  const formatDate = (dateString) => {
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
