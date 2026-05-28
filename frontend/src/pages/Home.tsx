import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { eventService, type Event } from '@/api/eventService';
import { formatEventDate } from '@/lib/format';

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
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

  const content = useMemo(() => {
    if (loading) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          Đang tải sự kiện...
        </div>
      );
    }

    if (error) {
      return (
        <div className="py-12 text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      );
    }

    if (!events.length) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          Chưa có sự kiện nào.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((ev) => {
          const categories = ev.ticketCategories ?? [];
          const minPrice =
            categories.length > 0
              ? Math.min(...categories.map((c) => Number(c.price)))
              : null;
          const maxPrice =
            categories.length > 0
              ? Math.max(...categories.map((c) => Number(c.price)))
              : null;

          const priceText =
            minPrice === null
              ? 'Chưa có hạng vé'
              : minPrice === maxPrice
                ? `${minPrice.toLocaleString('vi-VN')}đ`
                : `${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`;

          const totalAvailable = categories.reduce(
            (sum, c) => sum + (c.availableQuantity ?? 0),
            0,
          );

          return (
            <Card key={ev.id} className="hover:shadow-md transition-shadow overflow-hidden">
              {ev.imageUrl ? (
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="w-full h-40 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                  Chưa có ảnh
                </div>
              )}
              <CardHeader className="space-y-2">
                <CardTitle className="text-xl">{ev.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {ev.description ?? 'Không có mô tả'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Thời gian:</span>{' '}
                  {formatEventDate(ev.eventDate)}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Địa điểm:</span>{' '}
                  {ev.location}
                </div>
                <div className="text-muted-foreground">
                  <span className="font-medium text-foreground">Giá vé:</span> {priceText}
                </div>
                {categories.length > 0 && (
                  <div className="text-muted-foreground">
                    <span className="font-medium text-foreground">Còn lại:</span>{' '}
                    {totalAvailable.toLocaleString('vi-VN')} vé
                  </div>
                )}
              </CardContent>
              <CardFooter className="gap-3">
                <Button
                  className="w-full"
                  onClick={() => navigate(`/events/${ev.id}`)}
                >
                  Xem chi tiết
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  }, [events, loading, error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ticket Booking System
            </h1>
            <p className="text-muted-foreground">Danh sách sự kiện</p>
          </div>
          <Button onClick={handleLogout} variant="outline">
            Đăng xuất
          </Button>
        </div>

        {content}
      </div>
    </div>
  );
}
