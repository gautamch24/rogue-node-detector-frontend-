import { ThemeProvider } from "./components/theme-provider"
import NetworkGlobe from "./components/network-globe"
import NodeReport from "./components/node-report"
import StatusBar from "./components/status-bar"

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-black text-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900 to-black"></div>
        <div className="relative z-10 flex h-screen w-full flex-col">
          <StatusBar />
          <div className="flex flex-1">
            <NetworkGlobe />
            <NodeReport />
          </div>
        </div>
      </main>
    </ThemeProvider>
  )
}

export default App
