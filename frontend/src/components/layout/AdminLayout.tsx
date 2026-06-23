import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return 'Dashboard Thống kê';
      case '/admin/events':
        return 'Quản lý Sự kiện';
      case '/admin/sliders':
        return 'Quản lý Tin nổi bật';
      default:
        return 'Quản trị hệ thống';
    }
  };

  return (
    <div className="flex h-screen w-full bg-background text-on-background overflow-hidden">
      {/* SideNavBar */}
      <aside className="flex flex-col w-64 h-screen p-4 bg-surface-container-low border-r border-outline-variant shadow-sm z-40 sticky top-0">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-4 py-6">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-on-primary">
            <span className="material-symbols-outlined font-bold text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              confirmation_number
            </span>
          </div>
          <h1 className="text-xl font-bold text-primary font-h3">EventPass</h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-2 px-2">
          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold translate-x-1 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              dashboard
            </span>
            <span className="text-sm font-medium">Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/events"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold translate-x-1 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined">event</span>
            <span className="text-sm font-medium">Quản lý Sự kiện</span>
          </NavLink>

          <NavLink
            to="/admin/sliders"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-primary-container text-on-primary-container font-bold translate-x-1 shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`
            }
          >
            <span className="material-symbols-outlined">view_carousel</span>
            <span className="text-sm font-medium">Tin nổi bật</span>
          </NavLink>

          {/* Placeholders for future feature modules */}
          <div className="pt-4 border-t border-outline-variant/30 space-y-1">
            <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant/40 cursor-not-allowed select-none">
              <span className="material-symbols-outlined">group</span>
              <span className="text-sm font-medium">Quản lý Người dùng</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant/40 cursor-not-allowed select-none">
              <span className="material-symbols-outlined">bar_chart</span>
              <span className="text-sm font-medium">Báo cáo</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 text-on-surface-variant/40 cursor-not-allowed select-none">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Cài đặt</span>
            </div>
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 py-4 mt-auto border-t border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-container-highest overflow-hidden">
              <img
                className="w-full h-full object-cover"
                alt="Alex Rivera Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAr7bG5RaOchGqauLc3bLAlfNt_DvSUzUNgS6N35cKz27IgBwgLhh6zDW3wm7UhY8c80DAWSt5tGR_VzJgHYLF1_FbSTpNDjcEGaSnFXwXI4l2BAnpjsEIkDTBO-F1m04ntUMs1NwfFsAktveIftBlsCoEPwRgX9GyzZG-BEamdSx5eS_FTJb2BQCbugDhf_KRHxsXldFeMwq_OaE_TPnug8Am92OmDzDlTT8X89Pi2ZSHpQ0SutZlhpejA8NJbeE5K0Pgjh803Lw"
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate">Alex Rivera</p>
              <p className="text-xs text-on-surface-variant/70 truncate">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* TopNavBar */}
        <header className="h-16 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-md border-b border-outline-variant sticky top-0 z-30">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-xl font-bold text-primary">{getPageTitle()}</h2>
            {/* Search Bar */}
            <div className="max-w-md w-full relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
                placeholder="Tìm kiếm sự kiện, danh mục, địa điểm..."
                type="text"
              />
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
