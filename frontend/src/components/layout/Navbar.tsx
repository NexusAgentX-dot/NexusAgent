import { Link, useLocation } from 'react-router-dom'

const NAV_ITEMS = [
  { path: '/', label: 'Home' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/dashboard', label: 'Dashboard' },
]

export default function Navbar() {
  const { pathname } = useLocation()

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-void/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 no-underline">
          <img src="/brand/logo.svg" alt="NexusAgent" className="w-8 h-8 rounded-lg" />
          <span className="font-semibold text-text-primary tracking-tight">
            NexusAgent
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium no-underline transition-all
                ${pathname === item.path
                  ? 'bg-cyan/10 text-cyan'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}
