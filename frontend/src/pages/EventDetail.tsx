import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { eventService, type Event, type TicketCategory } from '@/api/eventService';
import { bookingService } from '@/api/bookingService';
import { getUserId } from '@/hooks/useRequireAuth';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency, formatEventDate } from '@/lib/format';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(id);
        if (!mounted) return;
        setEvent(data);
        const initial: Record<string, number> = {};
        (data.ticketCategories ?? []).forEach((c) => {
          initial[c.id] = 0;
        });
        setQuantities(initial);
      } catch (e) {
        if (!mounted) return;
        toast.error(getApiErrorMessage(e, 'Không thể tải sự kiện'));
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [id]);

  const lineItems = useMemo(() => {
    if (!event?.ticketCategories) return [];
    return event.ticketCategories
      .filter((c) => (quantities[c.id] ?? 0) > 0)
      .map((c) => ({
        category: c,
        quantity: quantities[c.id],
        subtotal: Number(c.price) * quantities[c.id],
      }));
  }, [event, quantities]);

  const total = useMemo(
    () => lineItems.reduce((sum, line) => sum + line.subtotal, 0),
    [lineItems],
  );

  const incrementQuantity = (category: TicketCategory) => {
    const current = quantities[category.id] ?? 0;
    const max = category.availableQuantity ?? 0;
    if (current < max) {
      setQuantities((prev) => ({ ...prev, [category.id]: current + 1 }));
    } else {
      toast.warning(`Chỉ còn lại ${max} vé cho hạng vé này`);
    }
  };

  const decrementQuantity = (category: TicketCategory) => {
    const current = quantities[category.id] ?? 0;
    if (current > 0) {
      setQuantities((prev) => ({ ...prev, [category.id]: current - 1 }));
    }
  };

  const handleBook = async () => {
    const userId = getUserId();
    if (!userId || !event?.id) {
      toast.error('Vui lòng đăng nhập để đặt vé');
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Vui lòng chọn ít nhất một vé');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingService.createBooking({
        userId,
        eventId: event.id,
        items: lineItems.map((line) => ({
          ticketCategoryId: line.category.id,
          quantity: line.quantity,
        })),
      });

      const status = String(booking?.status ?? '').toUpperCase();

      if (status === 'RESERVED') {
        toast.success('Đặt vé thành công! Đang chuyển sang trang thanh toán.');
        navigate(`/checkout/${booking.id}`);
        return;
      }

      if (status === 'FAILED') {
        toast.error('Đặt vé thất bại. Hạng vé này đã hết chỗ.');
        return;
      }

      toast.error(`Đặt vé chưa hoàn tất (trạng thái: ${status || 'không xác định'}).`);
    } catch (e) {
      console.error('createBooking failed', e);
      toast.error(getApiErrorMessage(e, 'Không thể đặt vé. Vui lòng thử lại sau.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-label-md">Đang tải thông tin chi tiết sự kiện...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-error text-6xl">event_busy</span>
        <h3 className="font-h3 text-h3 font-bold text-on-surface">Không tìm thấy sự kiện</h3>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-xl hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-100"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const categories = event.ticketCategories ?? [];

  return (
    <div className="bg-surface text-on-surface font-body-base antialiased min-h-screen flex flex-col pt-16">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 mx-auto bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm transition-all duration-300">
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
            <a className="font-label-md text-label-md text-primary border-b-2 border-primary pb-1 px-3 py-1 rounded-md transition-colors cursor-pointer">Sự kiện</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-inline-gap">
            {userId ? (
              <>
                <button 
                  onClick={() => navigate('/profile')}
                  className="hidden lg:flex items-center justify-center bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm active:scale-95 duration-100"
                >
                  Lịch sử mua vé
                </button>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => navigate('/profile')}
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-low rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined">logout</span>
                  </button>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors"
                  >
                    <img 
                      alt="User Profile" 
                      className="w-full h-full object-cover" 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDm9LMJyBDvVbRMJKVs5rguIozEMictK6rjrxzC2Oh3v_N9-sO2fYBKXQbai1172yJOSj-EjWkDSgXmcbKelFzs1_cMHEem-Makr76zcH9YwXGOXYKaITxZhVOCRd4nPW7Kbu7acAC8ks8eXAjFHN9L9_4dx5htROpyZ2R4ge49lo9vYk7yoo7Getv15c4AzzTXeGtJb_3fzZEpEoUuENf3tZMyy_tvrQ4lZEiAd9OLgI-BBrJhcU59Dj-R8lvNpSrmqROfWPIF_g"
                    />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 rounded-lg text-primary border border-primary hover:bg-surface-container-low font-label-md text-label-md transition-colors"
                >
                  Đăng nhập
                </button>
                <button 
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors font-label-md text-label-md shadow-sm"
                >
                  Đăng ký
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-container-max mx-auto pb-section-padding">
        
        {/* Cover Banner Section */}
        <div className="relative w-full h-[320px] md:h-[420px] overflow-hidden bg-on-background flex items-center justify-center">
          {/* Blurred Background cover */}
          {event.imageUrl ? (
            <div 
              className="absolute inset-0 w-full h-full bg-center bg-cover opacity-35 blur-md scale-110" 
              style={{ backgroundImage: `url('${event.imageUrl}')` }}
            ></div>
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-container to-secondary-container opacity-40"></div>
          )}

          <div className="relative z-10 w-full max-w-[1000px] px-gutter flex flex-col md:flex-row items-center gap-8 text-white">
            {/* Poster Card */}
            <div className="w-40 h-52 md:w-52 md:h-68 rounded-xl overflow-hidden shadow-2xl border border-surface-variant flex-shrink-0">
              {event.imageUrl ? (
                <img alt={event.title} className="w-full h-full object-cover" src={event.imageUrl} />
              ) : (
                <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center text-on-surface-variant gap-2">
                  <span className="material-symbols-outlined text-4xl text-primary">event</span>
                  <span className="text-[12px] uppercase font-semibold">EventPass</span>
                </div>
              )}
            </div>

            {/* Event Title & Info */}
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-sm border border-primary/30 px-3 py-1 rounded-full mb-4">
                <span className="material-symbols-outlined text-[16px] text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                <span className="font-label-sm text-label-sm text-primary-fixed uppercase tracking-wider">Sự kiện chính thức</span>
              </div>
              <h1 className="font-h1 text-h1 mb-2 text-white drop-shadow-md font-bold text-2xl md:text-4xl">{event.title}</h1>
              {event.description && (
                <p className="font-body-lg text-body-lg text-surface-container-low mb-6 max-w-2xl line-clamp-2 md:line-clamp-3">{event.description}</p>
              )}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 font-label-md text-label-md text-surface-container-lowest">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                  <span>{formatEventDate(event.eventDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">location_on</span>
                  <span className="truncate">{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Details & Sticky Booking box */}
        <div className="flex flex-col lg:flex-row gap-gutter mt-8 px-gutter">
          
          {/* Left Column - Details */}
          <div className="w-full lg:w-[65%] flex flex-col gap-stack-gap">
            {/* Tabs */}
            <div className="border-b border-outline-variant flex gap-6">
              <button className="font-label-md text-label-md text-primary border-b-2 border-primary pb-3 px-1 font-bold">Giới thiệu</button>
              <button className="font-label-md text-label-md text-on-surface-variant hover:text-primary pb-3 px-1 transition-colors cursor-pointer">Quy định</button>
              <button className="font-label-md text-label-md text-on-surface-variant hover:text-primary pb-3 px-1 transition-colors cursor-pointer">Sơ đồ sự kiện</button>
            </div>

            {/* Description Tab Content */}
            <div className="py-4 font-body-base text-body-base text-secondary flex flex-col gap-4">
              <h3 className="font-h3 text-h3 text-on-surface font-bold text-xl">Mô tả sự kiện</h3>
              <p className="leading-relaxed">
                {event.description || 'Không có mô tả chi tiết cho sự kiện này. Vui lòng liên hệ ban tổ chức để biết thêm thông tin.'}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex gap-3">
                  <span className="material-symbols-outlined text-primary text-[28px]">schedule</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-0.5">Thời gian tổ chức</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Sự kiện diễn ra vào lúc {new Date(event.eventDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}. Vui lòng có mặt sớm trước 30 phút để hoàn tất thủ tục check-in.</p>
                  </div>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline-variant flex gap-3">
                  <span className="material-symbols-outlined text-primary text-[28px]">accessible</span>
                  <div>
                    <h4 className="font-label-md text-label-md text-on-surface font-semibold mb-0.5">Dành cho mọi đối tượng</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">Hỗ trợ xe lăn và khu vực ngồi đặc biệt. Vui lòng liên hệ ban hỗ trợ sau khi hoàn tất đặt vé.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Booking Ticket Panel */}
          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-24 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-card-padding flex flex-col gap-6">
              <h3 className="font-h3 text-h3 text-on-surface font-bold border-b border-outline-variant pb-4 text-lg">Chọn vé sự kiện</h3>
              
              {/* Ticket Categories List */}
              <div className="flex flex-col gap-4">
                {categories.length === 0 ? (
                  <p className="text-on-surface-variant text-body-sm py-4 text-center">Sự kiện hiện chưa mở bán hạng vé nào.</p>
                ) : (
                  categories.map((category) => {
                    const isPremium = category.name.toUpperCase().includes('VIP') || category.name.toUpperCase().includes('PREMIUM');
                    const qty = quantities[category.id] ?? 0;
                    
                    return (
                      <div 
                        key={category.id} 
                        className={`flex flex-col gap-3 p-4 rounded-xl border transition-all ${
                          isPremium 
                            ? 'border-primary/30 bg-primary/5 shadow-sm' 
                            : 'border-outline-variant bg-surface-container-low/30 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-label-md text-label-md text-on-surface font-bold">{category.name}</h4>
                              {isPremium && (
                                <span className="bg-tertiary-container text-on-tertiary-container text-[9px] uppercase font-bold px-2 py-0.5 rounded-full">Premium</span>
                              )}
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              Còn {category.availableQuantity ?? 0} vé
                            </p>
                          </div>
                          <span className="font-h3 text-h3 text-primary font-bold">{formatCurrency(Number(category.price))}</span>
                        </div>

                        {/* Increment/Decrement Buttons */}
                        <div className="flex items-center justify-end gap-3 mt-2">
                          <button 
                            onClick={() => decrementQuantity(category)}
                            disabled={qty === 0}
                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">remove</span>
                          </button>
                          <span className="font-label-md text-label-md w-6 text-center font-bold">{qty}</span>
                          <button 
                            onClick={() => incrementQuantity(category)}
                            disabled={qty >= (category.availableQuantity ?? 0)}
                            className="w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-surface-variant hover:text-on-surface transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Total & Booking Button */}
              {categories.length > 0 && (
                <div className="border-t border-outline-variant pt-4 flex flex-col gap-4 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-body-lg text-body-lg text-on-surface-variant">Tổng tiền tạm tính</span>
                    <span className="font-h2 text-h2 text-primary font-bold text-2xl">{formatCurrency(total)}</span>
                  </div>
                  <button 
                    onClick={handleBook}
                    disabled={submitting || total === 0}
                    className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 font-bold disabled:opacity-50 disabled:cursor-not-allowed scale-95 duration-100"
                  >
                    {submitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                        <span>Đang xử lý đặt vé...</span>
                      </>
                    ) : (
                      <>
                        <span>Tiếp tục thanh toán</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <p className="text-center font-body-sm text-body-sm text-on-surface-variant text-[11px]">Bao gồm các loại phí và giữ chỗ trong vòng 10 phút.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full py-8 px-gutter flex flex-col md:flex-row justify-between items-center max-w-container-max mx-auto bg-surface-container-highest border-t border-outline-variant mt-auto">
        <div className="font-h3 text-h3 text-on-surface mb-4 md:mb-0 font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
          EventPass
        </div>
        <div className="flex gap-4 mb-4 md:mb-0">
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline decoration-primary opacity-80 cursor-pointer">Bảo mật</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline decoration-primary opacity-80 cursor-pointer">Điều khoản</a>
          <a className="font-body-sm text-body-sm text-on-surface-variant hover:underline decoration-primary opacity-80 cursor-pointer">Liên hệ</a>
        </div>
        <div className="font-body-sm text-body-sm text-on-surface-variant">
          © 2026 EventPass Ticketing Inc. Bảo lưu mọi quyền.
        </div>
      </footer>
    </div>
  );
}
