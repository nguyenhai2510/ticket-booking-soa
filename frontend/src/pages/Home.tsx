import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventService, type Event } from '@/api/eventService';
import { formatEventDate } from '@/lib/format';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function Home() {
  useRequireAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // States for search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const userId = localStorage.getItem('userId');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    navigate('/login');
  };

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await eventService.getEvents();
        if (!mounted) return;
        setEvents(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Không thể tải danh sách sự kiện');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter events based on search query and selected category
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesSearch = 
        ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        ev.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === 'All') return matchesSearch;
      
      // Simple categorization based on title/description keywords
      const titleLower = ev.title.toLowerCase();
      const descLower = (ev.description || '').toLowerCase();
      if (selectedCategory === 'Music') {
        return matchesSearch && (titleLower.includes('music') || titleLower.includes('concert') || titleLower.includes('festival') || titleLower.includes('nhạc') || descLower.includes('nhạc') || descLower.includes('ca sĩ'));
      }
      if (selectedCategory === 'Comedy') {
        return matchesSearch && (titleLower.includes('comedy') || titleLower.includes('hài') || descLower.includes('hài'));
      }
      if (selectedCategory === 'Sports') {
        return matchesSearch && (titleLower.includes('sports') || titleLower.includes('football') || titleLower.includes('bóng đá') || titleLower.includes('thể thao'));
      }
      
      return matchesSearch;
    });
  }, [events, searchQuery, selectedCategory]);

  // Featured Event (highest price event or first event)
  const featuredEvent = useMemo(() => {
    if (!events.length) return null;
    return events[0]; // Simply choose the first event as featured for this preview
  }, [events]);

  const renderEventGrid = () => {
    if (loading) {
      return (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-on-surface-variant font-label-md">Đang tải danh sách sự kiện...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-16 text-center max-w-md mx-auto space-y-4 bg-surface-container-low border border-outline-variant p-8 rounded-2xl">
          <span className="material-symbols-outlined text-error text-5xl">error</span>
          <p className="text-on-surface font-label-md">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-on-primary font-label-md px-4 py-2 rounded-xl hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-100"
          >
            Thử lại
          </button>
        </div>
      );
    }

    if (!filteredEvents.length) {
      return (
        <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-surface-container-lowest border border-outline-variant p-8 rounded-2xl">
          <span className="material-symbols-outlined text-on-surface-variant text-5xl">search_off</span>
          <h3 className="font-h3 text-h3 text-on-surface font-semibold">Không tìm thấy sự kiện nào</h3>
          <p className="text-on-surface-variant text-body-sm">Hãy thử thay đổi từ khóa tìm kiếm hoặc danh mục bộ lọc.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter">
        {filteredEvents.map((ev) => {
          const categories = ev.ticketCategories ?? [];
          const minPrice = categories.length > 0
            ? Math.min(...categories.map((c) => Number(c.price)))
            : null;
          
          const priceText = minPrice === null
            ? 'Chưa có giá'
            : minPrice === 0
              ? 'Miễn phí'
              : `${minPrice.toLocaleString('vi-VN')} đ`;

          // Parse event date
          const dateObj = new Date(ev.eventDate);
          const day = dateObj.getDate();
          const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
          const formattedTime = dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

          return (
            <article 
              key={ev.id} 
              onClick={() => navigate(`/events/${ev.id}`)}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 overflow-hidden flex flex-col group h-full cursor-pointer"
            >
              {/* Event Cover */}
              <div className="relative h-48 w-full overflow-hidden">
                {ev.imageUrl ? (
                  <img 
                    alt={ev.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={ev.imageUrl}
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container flex flex-col items-center justify-center text-on-surface-variant gap-2">
                    <span className="material-symbols-outlined text-4xl">event</span>
                    <span className="text-[12px] uppercase font-semibold tracking-wider">EventPass</span>
                  </div>
                )}
                {/* Date Badge */}
                <div className="absolute top-3 right-3 bg-surface/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-primary font-label-sm text-label-sm shadow-sm flex flex-col items-center border border-outline-variant/50 z-10">
                  <span className="font-bold text-lg leading-none">{day}</span>
                  <span className="uppercase text-[9px] tracking-wide font-bold">{month}</span>
                </div>
              </div>

              {/* Event Content */}
              <div className="p-card-padding flex flex-col flex-grow gap-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-h3 text-h3 text-on-surface font-bold line-clamp-2 group-hover:text-primary transition-colors">
                    {ev.title}
                  </h3>
                </div>
                
                {ev.description && (
                  <p className="text-on-surface-variant text-body-sm line-clamp-2">
                    {ev.description}
                  </p>
                )}

                <div className="flex flex-col gap-1.5 mt-auto">
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                    <span>{formattedTime} - {formatEventDate(ev.eventDate)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-secondary font-body-sm text-body-sm">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-outline-variant flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-on-surface-variant uppercase font-semibold">Giá vé từ</span>
                    <span className="font-h3 text-h3 font-bold text-primary">{priceText}</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${ev.id}`);
                    }}
                    className="px-4 py-2 rounded-lg border border-primary text-primary font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors active:scale-95 duration-100"
                  >
                    Chi tiết
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-surface text-on-surface font-body-base antialiased min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-gutter h-16 mx-auto bg-surface/80 backdrop-blur-md border-b border-outline-variant shadow-sm transition-all duration-300">
        <div className="max-w-container-max mx-auto w-full flex justify-between items-center">
          {/* Brand & Search */}
          <div className="flex items-center gap-inline-gap lg:gap-8 flex-grow md:flex-grow-0">
            <a 
              className="font-h2 text-h2 font-bold text-primary flex items-center gap-2 mr-4" 
              href="#"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              EventPass
            </a>
            
            {/* Search Input */}
            <div className="hidden md:flex items-center bg-surface-container-low rounded-full px-4 py-1.5 border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-64 lg:w-96">
              <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
              <input 
                className="bg-transparent border-none outline-none text-body-sm w-full placeholder-on-surface-variant text-on-surface focus:ring-0 p-0" 
                placeholder="Tìm kiếm sự kiện, địa điểm..." 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-inline-gap lg:gap-6">
            <a 
              onClick={(e) => { e.preventDefault(); setSelectedCategory('All'); }} 
              className={`font-label-md text-label-md px-2 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'All' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Khám phá
            </a>
            <a 
              onClick={(e) => { e.preventDefault(); setSelectedCategory('Music'); }}
              className={`font-label-md text-label-md px-2 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'Music' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Âm nhạc
            </a>
            <a 
              onClick={(e) => { e.preventDefault(); setSelectedCategory('Sports'); }}
              className={`font-label-md text-label-md px-2 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'Sports' 
                  ? 'text-primary border-b-2 border-primary font-bold' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
              }`}
            >
              Thể thao
            </a>
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
                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full transition-colors active:scale-95 duration-100"
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    title="Đăng xuất"
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container-low rounded-full transition-colors active:scale-95 duration-100"
                  >
                    <span className="material-symbols-outlined">logout</span>
                  </button>
                  <button 
                    onClick={() => navigate('/profile')}
                    className="ml-2 w-8 h-8 rounded-full overflow-hidden border border-outline-variant hover:border-primary transition-colors active:scale-95 duration-100"
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
      <main className="flex-grow pt-24 pb-section-padding px-gutter max-w-container-max mx-auto w-full flex flex-col gap-section-padding">
        
        {/* Mobile Search Bar */}
        <div className="flex md:hidden items-center bg-surface-container-low rounded-full px-4 py-2.5 border border-outline-variant focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all w-full mb-4">
          <span className="material-symbols-outlined text-on-surface-variant mr-2">search</span>
          <input 
            className="bg-transparent border-none outline-none text-body-sm w-full placeholder-on-surface-variant text-on-surface focus:ring-0 p-0" 
            placeholder="Tìm kiếm sự kiện, địa điểm..." 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Hero Banner for Featured Event */}
        {featuredEvent && (
          <section className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-outline-variant h-[350px] md:h-[450px] flex items-center group">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              {featuredEvent.imageUrl ? (
                <img 
                  alt={featuredEvent.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  src={featuredEvent.imageUrl}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center">
                  <span className="text-white text-7xl font-bold tracking-widest opacity-25">EVENTPASS</span>
                </div>
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-on-background/95 via-on-background/70 to-transparent mix-blend-multiply"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 to-transparent"></div>
            </div>
            {/* Content */}
            <div className="relative z-10 px-8 md:px-16 max-w-2xl text-on-primary">
              <span className="inline-block px-3 py-1 mb-4 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-fixed font-label-sm text-label-sm uppercase tracking-wider">
                Sự kiện nổi bật
              </span>
              <h1 className="font-h1 text-h1 mb-4 text-white drop-shadow-md line-clamp-2">
                {featuredEvent.title}
              </h1>
              {featuredEvent.description && (
                <p className="font-body-lg text-body-lg mb-8 text-surface-container-low drop-shadow-sm line-clamp-2 md:line-clamp-3">
                  {featuredEvent.description}
                </p>
              )}
              <div className="flex flex-wrap gap-4 items-center">
                <button 
                  onClick={() => navigate(`/events/${featuredEvent.id}`)}
                  className="bg-primary text-on-primary font-label-md text-label-md px-8 py-3 rounded-xl hover:bg-primary-container transition-all shadow-md hover:shadow-lg active:scale-95 duration-100 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  Đặt vé ngay
                </button>
                <div className="flex items-center gap-2 text-surface-container-highest font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  <span>{formatEventDate(featuredEvent.eventDate)}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Filters & Sort Bar */}
        <section className="flex flex-col md:flex-row justify-between items-center gap-stack-gap">
          <h2 className="font-h2 text-h2 text-on-surface w-full md:w-auto font-bold">
            {selectedCategory === 'All' ? 'Tất cả Sự kiện' : selectedCategory === 'Music' ? 'Sự kiện Âm nhạc' : selectedCategory === 'Sports' ? 'Giải đấu Thể thao' : 'Hài kịch đặc sắc'}
          </h2>
          <div className="flex w-full md:w-auto overflow-x-auto pb-2 md:pb-0 gap-2 hide-scrollbar">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                selectedCategory === 'All'
                  ? 'bg-primary text-on-primary border border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setSelectedCategory('Music')}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                selectedCategory === 'Music'
                  ? 'bg-primary text-on-primary border border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">music_note</span> Âm nhạc
            </button>
            <button 
              onClick={() => setSelectedCategory('Comedy')}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                selectedCategory === 'Comedy'
                  ? 'bg-primary text-on-primary border border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">theater_comedy</span> Hài kịch
            </button>
            <button 
              onClick={() => setSelectedCategory('Sports')}
              className={`whitespace-nowrap px-4 py-2 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1 ${
                selectedCategory === 'Sports'
                  ? 'bg-primary text-on-primary border border-primary'
                  : 'bg-surface-container-lowest text-on-surface-variant border border-outline-variant hover:border-primary hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">sports_baseball</span> Thể thao
            </button>
          </div>
        </section>

        {/* Event List / Grid */}
        <section className="w-full">
          {renderEventGrid()}
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-surface-container-highest dark:bg-surface-dim border-t border-outline-variant dark:border-outline w-full py-8 px-gutter mt-auto">
        <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <span className="font-h3 text-h3 text-on-surface flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
              EventPass
            </span>
            <p className="text-on-surface-variant font-body-sm text-body-sm">© 2026 EventPass Ticketing Inc. Bảo lưu mọi quyền.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-4 lg:gap-6">
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:underline decoration-primary opacity-80 transition-opacity hover:opacity-100 hover:text-primary cursor-pointer">Chính sách bảo mật</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:underline decoration-primary opacity-80 transition-opacity hover:opacity-100 hover:text-primary cursor-pointer">Điều khoản dịch vụ</a>
            <a className="text-on-surface-variant font-label-sm text-label-sm hover:underline decoration-primary opacity-80 transition-opacity hover:opacity-100 hover:text-primary cursor-pointer">Liên hệ</a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
