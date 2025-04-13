export default function NodeTooltip({ node, position }) {
    if (!node || node.status !== "rogue") return null
  
    const threatTypes = {
      "Data Exfiltration": {
        provider: "CloudGuard Security",
        description:
          "Unauthorized data transfer detected. Sensitive information being sent to unknown external endpoints.",
        recommendation: "Isolate node and perform forensic analysis.",
      },
      Malware: {
        provider: "NexusDefend",
        description: "Malicious code signature detected. Behavior consistent with ransomware preparation.",
        recommendation: "Quarantine node and scan connected systems.",
      },
      "Unauthorized Access": {
        provider: "CyberSentinel",
        description: "Multiple privilege escalation attempts detected. Admin credentials potentially compromised.",
        recommendation: "Force password reset and review access logs.",
      },
      "DDoS Source": {
        provider: "ShieldNet",
        description: "Node participating in distributed attack network. Abnormal outbound traffic patterns.",
        recommendation: "Block external communications and patch system.",
      },
    }
  
    const threatInfo = threatTypes[node.threat?.type] || {
      provider: "Unknown Provider",
      description: "Unclassified threat detected. Investigation required.",
      recommendation: "Isolate node pending security review.",
    }
  
    return (
      <div
        className="absolute z-50 w-64 bg-black/90 border border-red-500 rounded-md p-3 text-xs font-mono text-white shadow-lg backdrop-blur-sm"
        style={{
          left: `${position.x + 15}px`,
          top: `${position.y - 15}px`,
          transform: "translate(0, -100%)",
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="text-red-500 font-bold">THREAT DETECTED</div>
          <div className="bg-red-500 text-black px-1 rounded text-[10px]">LIVE</div>
        </div>
  
        <div className="grid gap-2">
          <div>
            <div className="text-gray-400">Provider:</div>
            <div className="text-white">{threatInfo.provider}</div>
          </div>
  
          <div>
            <div className="text-gray-400">Type:</div>
            <div className="text-red-400">{node.threat?.type}</div>
          </div>
  
          <div>
            <div className="text-gray-400">Description:</div>
            <div className="text-white">{threatInfo.description}</div>
          </div>
  
          <div>
            <div className="text-gray-400">Recommendation:</div>
            <div className="text-green-400">{threatInfo.recommendation}</div>
          </div>
  
          <div>
            <div className="text-gray-400">Confidence:</div>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-full bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full"
                  style={{ width: `${node.threat?.confidence || 0}%` }}
                ></div>
              </div>
              <span>{node.threat?.confidence || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    )
  }