interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const menuItems = [
    { id: 'today', label: 'Сегодня' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'archive', label: 'Архив' },
    { id: 'admin', label: 'Админ' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-white px-8 py-16" style={{ borderRight: '1px solid rgba(13, 19, 35, 0.08)' }}>
      {/* Logo */}
      <div className="mb-20">
        <h1 className="text-2xl tracking-tight text-black font-medium">Trend Radar</h1>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="relative w-full text-left py-2.5 pl-4 transition-all font-light"
              style={{
                color: isActive ? '#0D1323' : 'rgba(13, 19, 35, 0.4)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(13, 19, 35, 0.7)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.color = 'rgba(13, 19, 35, 0.4)';
                }
              }}
            >
              {isActive && (
                <div
                  className="absolute left-0 top-0 bottom-0 w-[2px]"
                  style={{ backgroundColor: '#0D1323', opacity: 0.3 }}
                />
              )}
              {item.label}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
