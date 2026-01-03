import { NavLink } from 'react-router-dom'

export const Navigation = () => {
  const navItems = [
    { path: '/', label: 'Today', icon: '📝' },
    { path: '/dashboard', label: 'Progress', icon: '📊' },
    { path: '/calendar', label: 'Calendar', icon: '📅' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ]


  return (
    <nav 
      className="bg-dark-card border-t border-dark-border px-2 sm:px-4 py-2 safe-area-bottom"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="flex justify-around max-w-md mx-auto">
        {navItems.map(({ path, label, icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center py-2 px-2 sm:px-3 rounded-lg transition-all duration-200 min-w-0 flex-1 ${
                isActive
                  ? 'text-accent-primary bg-accent-primary/10 scale-105'
                  : 'text-dark-text-muted hover:text-dark-text-primary hover:bg-dark-surface hover:scale-105'
              }`
            }
            aria-label={`Navigate to ${label}`}
            aria-current={undefined}
          >
            <span className="text-base sm:text-lg mb-0.5" role="img" aria-hidden="true">{icon}</span>
            <span className="text-[10px] sm:text-xs font-medium leading-tight truncate w-full text-center">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}