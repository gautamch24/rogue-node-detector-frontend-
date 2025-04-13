"use client"

import ClientWrapper from "@/components/client-wrapper"
import NodeReport from "@/components/node-report"
import StatusBar from "@/components/status-bar"
import { useEffect } from "react"

export default function Home() {
  console.log("[Page] Home component rendering");
  
  useEffect(() => {
    console.log("[Page] Home component mounted");
    return () => {
      console.log("[Page] Home component unmounting");
    };
  }, []);
  
  return (
    <main className="relative flex min-h-screen flex-col bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black"></div>
      <div className="relative z-10 flex h-screen w-full flex-col">
        <StatusBar />
        <div className="flex flex-1 relative">
          {/* Globe is now handled by src/App.jsx */}
          <div className="relative z-20">
            <NodeReport />
          </div>
        </div>
      </div>
    </main>
  )
}
