import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { formatCurrency, formatEventDate } from '@/lib/format';
import { eventService, type Event } from '@/api/eventService';

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
  const [eventsMap, setEventsMap] = useState<Record<string, Event>>({});

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Khách hàng';
  const userRole = localStorage.getItem('userRole') || 'USER';
  const isAdmin = userRole === 'ADMIN';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('confirmedBookings');
      if (stored) {
        const bookings: LocalBooking[] = JSON.parse(stored);
        setRealBookings(bookings);

        // Fetch event details for each unique eventId
        const uniqueEventIds = Array.from(new Set(bookings.map((b) => b.eventId)));
        uniqueEventIds.forEach(async (id) => {
          try {
            const event = await eventService.getEventById(id);
            setEventsMap((prev) => ({ ...prev, [id]: event }));
          } catch (err) {
            console.error(`Không thể tải thông tin sự kiện ${id}:`, err);
          }
        });
      }
    } catch (e) {
      console.error('Không thể đọc dữ liệu vé đã thanh toán:', e);
    }
  }, []);

  const getTicketCategoryNames = (b: LocalBooking) => {
    if (!b.items || b.items.length === 0) return 'Vé Phổ thông';
    const event = eventsMap[b.eventId];
    if (!event || !event.ticketCategories) return 'Vé Phổ thông / VIP';
    return b.items
      .map((item) => {
        const cat = event.ticketCategories?.find((c) => c.id === item.ticketCategoryId);
        return `${cat?.name || 'Vé'} x${item.quantity}`;
      })
      .join(', ');
  };

  const now = new Date();

  const upcomingBookings = realBookings.filter((b) => {
    const event = eventsMap[b.eventId];
    if (!event) return true; // Default to upcoming while loading event
    return new Date(event.eventDate) >= now;
  });

  const pastBookings = realBookings.filter((b) => {
    const event = eventsMap[b.eventId];
    if (!event) return false;
    return new Date(event.eventDate) < now;
  });

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
            {isAdmin && (
              <>
                <div className="my-2 border-t border-outline-variant/40" />
                <a
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-3 px-4 py-3 bg-primary-container/30 text-primary rounded-lg font-bold hover:bg-primary-container/60 transition-all duration-200 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                    admin_panel_settings
                  </span>
                  <span className="font-label-md text-label-md">Quản trị hệ thống</span>
                </a>
              </>
            )}
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
              upcomingBookings.length > 0 ? (
                upcomingBookings.map((b) => {
                  const event = eventsMap[b.eventId];
                  return (
                    <div key={b.id} className="flex flex-col sm:flex-row bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
                      <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-surface-container overflow-hidden flex items-center justify-center">
                        {event?.imageUrl ? (
                          <img 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            src={event.imageUrl}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary flex flex-col items-center justify-center text-on-primary p-4">
                            <span className="material-symbols-outlined text-5xl opacity-40">local_activity</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider mt-2">Vé điện tử</span>
                          </div>
                        )}
                      </div>
                      <div className="p-card-padding flex flex-col flex-grow justify-center gap-3">
                        <div className="flex justify-between items-start mb-1 gap-4">
                          <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary font-bold transition-colors text-lg line-clamp-1">
                            {event?.title || 'Đang tải thông tin...'}
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
                          {event?.eventDate && (
                            <div className="flex items-center gap-2 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                              <span className="font-body-sm text-body-sm">{formatEventDate(event.eventDate)}</span>
                            </div>
                          )}
                          {event?.location && (
                            <div className="flex items-center gap-2 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[16px]">location_on</span>
                              <span className="font-body-sm text-body-sm line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            <span className="font-body-sm text-body-sm font-semibold text-primary">Tổng tiền: {formatCurrency(b.totalAmount)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Hạng vé</span>
                            <span className="font-body-base text-body-base font-bold text-on-surface">
                              {getTicketCategoryNames(b)}
                            </span>
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
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2">event_busy</span>
                  <p className="font-label-md text-label-md text-on-surface-variant">Không có vé nào sắp diễn ra</p>
                  <button 
                    onClick={() => navigate('/')}
                    className="mt-4 bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
                  >
                    Khám phá sự kiện
                  </button>
                </div>
              )
            ) : (
              pastBookings.length > 0 ? (
                pastBookings.map((b) => {
                  const event = eventsMap[b.eventId];
                  return (
                    <div key={b.id} className="flex flex-col sm:flex-row bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group opacity-80">
                      <div className="w-full sm:w-48 h-48 sm:h-auto shrink-0 bg-surface-container overflow-hidden flex items-center justify-center grayscale">
                        {event?.imageUrl ? (
                          <img 
                            alt={event.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            src={event.imageUrl}
                          />
                        ) : (
                          <div className="w-full h-full bg-primary flex flex-col items-center justify-center text-on-primary p-4">
                            <span className="material-symbols-outlined text-5xl opacity-40">local_activity</span>
                            <span className="text-[10px] uppercase font-bold tracking-wider mt-2">Vé điện tử</span>
                          </div>
                        )}
                      </div>
                      <div className="p-card-padding flex flex-col flex-grow justify-center gap-3">
                        <div className="flex justify-between items-start mb-1 gap-4">
                          <h3 className="font-h3 text-h3 text-on-surface group-hover:text-primary font-bold transition-colors text-lg line-clamp-1 line-through decoration-outline">
                            {event?.title || 'Đang tải thông tin...'}
                          </h3>
                          <span className="bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full font-label-sm text-label-sm whitespace-nowrap font-bold">
                            Đã diễn ra
                          </span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                            <span className="font-body-sm text-body-sm select-all font-mono">Mã vé: {b.id}</span>
                          </div>
                          {event?.eventDate && (
                            <div className="flex items-center gap-2 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                              <span className="font-body-sm text-body-sm">{formatEventDate(event.eventDate)}</span>
                            </div>
                          )}
                          {event?.location && (
                            <div className="flex items-center gap-2 text-on-surface-variant">
                              <span className="material-symbols-outlined text-[16px]">location_on</span>
                              <span className="font-body-sm text-body-sm line-clamp-1">{event.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-on-surface-variant">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            <span className="font-body-sm text-body-sm font-semibold text-primary">Tổng tiền: {formatCurrency(b.totalAmount)}</span>
                          </div>
                        </div>
                        
                        <div className="mt-auto flex items-center justify-between border-t border-outline-variant pt-3">
                          <div className="flex flex-col">
                            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Hạng vé</span>
                            <span className="font-body-base text-body-base font-bold text-on-surface">
                              {getTicketCategoryNames(b)}
                            </span>
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
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-outline-variant rounded-xl bg-surface-container-lowest text-center">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2">history</span>
                  <p className="font-label-md text-label-md text-on-surface-variant">Bạn chưa tham gia sự kiện nào trước đây</p>
                </div>
              )
            )}
          </div>
        </main>
        
      </div>
    </div>
  );
}
