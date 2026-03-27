import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/brand/logo.svg" alt="NexusAgent" className="w-5 h-5 rounded" />
            <span className="font-mono text-sm text-text-secondary">NexusAgent</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-xs text-text-muted">
              Built on X Layer &middot; Powered by OKX Onchain OS &middot; Standards-aligned agent commerce
            </p>
            <a href="https://x.com/NexusAgentX" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-cyan transition-colors no-underline">𝕏</a>
            <a href="https://github.com/NexusAgentX-dot/NexusAgent" target="_blank" rel="noopener noreferrer" className="text-xs text-text-muted hover:text-cyan transition-colors no-underline">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
