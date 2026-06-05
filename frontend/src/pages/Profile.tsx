import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { formatCurrency } from '@/lib/format';

interface LocalBooking {
  id: string;
  eventId: string;
  totalAmount: number;
  status: string;
  bookingTime?: string;
  items?: Array<{
    ticketCategoryId: string;
    quantity: number;
    price: number;
  }>;
}

export default function Profile() {
  useRequireAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
  const [realBookings, setRealBookings] = useState<LocalBooking[]>([]);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Khách hàng';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('confirmedBookings');
      if (stored) {
        setRealBookings(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Không thể đọc dữ liệu vé đã thanh toán:', e);
    }
  }, []);

  return (
    <div className="bg-surface text-on-surface font-body-base antialiased min-h-screen flex flex-col pt-16">
      
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 mx-auto bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm transition-colors duration-200">
        <div className="max-w-container-max mx-auto w-full flex justify-between items-center">
          {/* Brand */}
          <div className="flex items-center gap-inline-gap lg:gap-8">
            <a 
              className="font-h2 text-h2 font-bold text-primary flex items-center gap-2 mr-4 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              EventPass
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-inline-gap lg:gap-6">
            <a onClick={() => navigate('/')} className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1 rounded-md transition-colors cursor-pointer">Khám phá</a>
            <a onClick={() => navigate('/')} className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:bg-surface-container-low px-3 py-1 rounded-md transition-colors cursor-pointer">Sự kiện</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-inline-gap">
            <button 
              onClick={() => navigate('/')}
              className="hidden lg:flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-95 duration-100"
            >
              Mua thêm vé
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleLogout}
                title="Đăng xuất"
                className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-low rounded-full transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden ml-2 border border-outline-variant">
                <img 
                  alt="User Avatar" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGCqEHhsyu61P0bSptPMsjiaRNuKURx44ic-SI3VpM4xb0uf1AMal_Jvs1xn92EcdwsasaAFPyCVBztg0PhkzNSnUxp_logdTbUSgxIh_99NxidRUME9DTnlPdV5W9PJ5UqtPNv02IJcnXqPlMtGsaPceQxkeQm9RFo3fwxTMMsrsqk1kCE25PDHcr9COZxVN5BKuADYF4aseXXUctUrmCeA9o55C0_2aGnMSUzYnLNRkptPs5sMwEo28Nq71m8pZKlnNnBlLbBA"
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-container-max mx-auto w-full px-gutter py-8 gap-8">
        
        {/* SideNavBar */}
        <aside className="flex flex-col w-64 p-stack-gap sticky top-24 bg-surface-container-low rounded-xl border border-outline-variant shadow-sm h-fit hidden md:flex">
          <div className="flex flex-col items-center mb-8 pt-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-primary mb-3">
              <img 
                alt="User Profile" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCGCqEHhsyu61P0bSptPMsjiaRNuKURx44ic-SI3VpM4xb0uf1AMal_Jvs1xn92EcdwsasaAFPyCVBztg0PhkzNSnUxp_logdTbUSgxIh_99NxidRUME9DTnlPdV5W9PJ5UqtPNv02IJcnXqPlMtGsaPceQxkeQm9RFo3fwxTMMsrsqk1kCE25PDHcr9COZxVN5BKuADYF4aseXXUctUrmCeA9o55C0_2aGnMSUzYnLNRkptPs5sMwEo28Nq71m8pZKlnNnBlLbBA"
              />
            </div>
            <h2 className="font-h3 text-h3 text-primary text-center font-bold">{username}</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-1">Thành viên từ 2026</p>
            <button className="mt-4 w-full bg-surface-container-high border border-outline-variant text-on-surface font-label-md text-label-md py-2 rounded-lg hover:bg-outline-variant/30 transition-colors font-semibold">
              Nâng cấp Pro
            </button>
          </div>
          
          <nav className="flex flex-col gap-2 flex-1">
            <a className="flex items-center gap-3 px-4 py-3 bg-primary text-on-primary rounded-lg font-bold transition-all duration-200" href="#">
              <span className="material-symbols-outlined text-lg">confirmation_number</span>
              <span className="font-label-md text-label-md">Vé của tôi</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg cursor-pointer">
              <span className="material-symbols-outlined text-lg">favorite</span>
              <span className="font-label-md text-label-md">Sự kiện đã lưu</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg cursor-pointer">
              <span className="material-symbols-outlined text-lg">payments</span>
              <span className="font-label-md text-label-md">Phương thức thanh toán</span>
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-container-highest transition-all rounded-lg cursor-pointer">
              <span className="material-symbols-outlined text-lg">settings</span>
              <span className="font-label-md text-label-md">Cài đặt tài khoản</span>
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col gap-stack-gap min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 border-b border-outline-variant pb-4 gap-4">
            <div>
              <h1 className="font-h1 text-h1 text-on-surface font-bold text-2xl md:text-3xl">Lịch sử đặt vé</h1>
              <p className="font-body-base text-body-base text-on-surface-variant mt-2">Quản lý và xem lại thông tin chi tiết các vé sự kiện của bạn.</p>
            </div>
            
            <div className="flex gap-2 bg-surface-container-low p-1 rounded-xl border border-outline-variant h-fit">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                  activeTab === 'upcoming' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Sắp diễn ra
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`px-4 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                  activeTab === 'past' 
                    ? 'bg-surface-container-lowest text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                Đã diễn ra
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {activeTab === 'upcoming' ? (
              <>
                {/* 1. Real confirmed bookings from this session */}
                {realBookings.map((b) => (
                  <div key={b.id} className="flex flex-col sm:flex-row bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                    <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-surface-container flex flex-col items-center justify-center text-primary-fixed bg-primary">
                      <span className="material-symbols-outlined text-5xl opacity-40">local_activity</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider mt-2">Vé điện tử</span>
                    </div>
                    <div className="p-card-padding flex flex-col flex-grow justify-center gap-3">
                      <div className="flex justify-between items-start mb-1 gap-4">
                        <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary font-bold transition-colors text-lg line-clamp-1">
                          Vé Sự Kiện Đã Đặt
                        </h3>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap font-bold">
                          Đã thanh toán
                        </span>
                      </div>
                      
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                          <span className="font-body-sm text-body-sm select-all font-mono">Mã vé: {b.id}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant">
                          <span className="material-symbols-outlined text-[16px]">payments</span>
                          <span className="font-body-sm text-body-sm font-semibold text-primary">Tổng tiền: {formatCurrency(b.totalAmount)}</span>
                        </div>
                      </div>
                      
                      <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Hạng vé</span>
                          <span className="font-body-base text-body-base font-bold text-on-surface">Vé Phổ thông / VIP</span>
                        </div>
                        <button 
                          onClick={() => navigate(`/checkout/${b.id}`)}
                          className="text-primary font-label-md text-label-md font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          Chi tiết hoá đơn <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 2. Mock upcoming ticket card 1 */}
                <div className="flex flex-col sm:flex-row bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-surface-container overflow-hidden">
                    <img 
                      alt="Global Tech Summit" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfIiCnBU2dWbPqGhXtwKGGo-6aJKxERJifaAej1F52dcoZ3gcB2UuuthPlL8ekX8pQwjM1gF-AaQuyTezwmixImj5hF7R-Y7YUDuBCn-AnBvopwQVwkaBwY6LiFDs_Rz5ckPWw-Z4AejCmSQ1wMTTLaZJZe_-_X6HgXy8oVqPWhQr0YXVNjm8ZaG0OHGYMMZsYkP3VKwtSie6rmzihCzrL2YTzsWXBSDzZVqvxVZ7fcFzb4vsDpPg-_1JXM3NnQ65YR2NSLOLz5A"
                    />
                  </div>
                  <div className="p-card-padding flex flex-col flex-1 justify-center gap-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary font-bold transition-colors text-lg">Global Tech Summit 2024</h3>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap font-bold">Thành công</span>
                    </div>
                    <div className="flex flex-col gap-1 text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        <span className="font-body-sm text-body-sm">15 Tháng 10, 2024 • 09:00 AM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="font-body-sm text-body-sm">Moscone Center, San Francisco</span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Chỗ ngồi</span>
                        <span className="font-body-base text-body-base font-bold text-on-surface">Khu A, Dãy 12, Ghế 4</span>
                      </div>
                      <button className="text-primary font-label-md text-label-md font-bold hover:underline flex items-center gap-1">
                        Xem vé <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Mock upcoming ticket card 2 */}
                <div className="flex flex-col sm:flex-row bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                  <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-surface-container overflow-hidden">
                    <img 
                      alt="Symphony Under the Stars" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBrTvFSIuDDAabB0D5vU6HtAvON6c8lTfGsedum43MOt9Wvfotya2VbkcQoi0CrHwXyPGyNX_KOHqEol3CNhVb395Z4HAHyvMG8JMA64lYbHPRBPmZBdHdqcxYN4CZdZXFULU1TGpkTBXnX-0YnnLc8VxCqRmtw0bJG6lE6Ys8vrjt48byhbQ63MTLXoqPiNdMEKjQv3GOBRIub-bX3Wl_idNbIdY2zfW5oSrZ0NVNclnaZII_SexpgQaVylTZRARWc_Nqm5hASrg"
                    />
                  </div>
                  <div className="p-card-padding flex flex-col flex-grow justify-center gap-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary font-bold transition-colors text-lg">Symphony Under the Stars</h3>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap font-bold">Thành công</span>
                    </div>
                    <div className="flex flex-col gap-1 text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        <span className="font-body-sm text-body-sm">20 Tháng 9, 2024 • 07:30 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="font-body-sm text-body-sm">Central Park Great Lawn, New York</span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Chỗ ngồi</span>
                        <span className="font-body-base text-body-base font-bold text-on-surface">Vé Phổ thông - Bãi cỏ</span>
                      </div>
                      <button className="text-primary font-label-md text-label-md font-bold hover:underline flex items-center gap-1">
                        Xem vé <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Past Tickets - Mock Cancelled / Completed events */}
                <div className="flex flex-col sm:flex-row bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group opacity-80">
                  <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-surface-container overflow-hidden grayscale">
                    <img 
                      alt="Startup Pitch Night" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfIiCnBU2dWbPqGhXtwKGGo-6aJKxERJifaAej1F52dcoZ3gcB2UuuthPlL8ekX8pQwjM1gF-AaQuyTezwmixImj5hF7R-Y7YUDuBCn-AnBvopwQVwkaBwY6LiFDs_Rz5ckPWw-Z4AejCmSQ1wMTTLaZJZe_-_X6HgXy8oVqPWhQr0YXVNjm8ZaG0OHGYMMZsYkP3VKwtSie6rmzihCzrL2YTzsWXBSDzZVqvxVZ7fcFzb4vsDpPg-_1JXM3NnQ65YR2NSLOLz5A"
                    />
                  </div>
                  <div className="p-card-padding flex flex-col flex-grow justify-center gap-3">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-h3 text-h3 text-on-surface font-bold text-lg line-through decoration-outline">Startup Pitch Night</h3>
                      <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap font-bold">Đã hủy</span>
                    </div>
                    <div className="flex flex-col gap-1 text-on-surface-variant">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                        <span className="font-body-sm text-body-sm">05 Tháng 8, 2024 • 06:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        <span className="font-body-sm text-body-sm">WeWork Downtown, Austin</span>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Trạng thái hoàn tiền</span>
                        <span className="font-body-base text-body-base font-bold text-on-surface">Đã hoàn tiền ngày 01/08</span>
                      </div>
                      <button className="text-secondary font-label-md text-label-md font-bold hover:underline flex items-center gap-1">
                        Chi tiết <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
        
      </div>
    </div>
  );
}
