import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { eventService, type Event, type TicketCategory } from '@/api/eventService';
import { bookingService } from '@/api/bookingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useRequireAuth, getUserId } from '@/hooks/useRequireAuth';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency, formatEventDate } from '@/lib/format';

export default function EventDetail() {
  useRequireAuth();

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

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

  const setQuantity = (category: TicketCategory, value: number) => {
    const max = category.availableQuantity ?? 0;
    const safe = Math.max(0, Math.min(max, Number.isFinite(value) ? value : 0));
    setQuantities((prev) => ({ ...prev, [category.id]: safe }));
  };

  const handleBook = async () => {
    const userId = getUserId();
    if (!userId || !event?.id) {
      toast.error('Vui lòng đăng nhập để đặt vé');
      navigate('/login');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Chọn ít nhất một vé');
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
        toast.success('Đặt vé thành công! Chuyển sang thanh toán.');
        navigate(`/checkout/${booking.id}`);
        return;
      }

      if (status === 'FAILED') {
        toast.error(
          'Đặt vé thất bại (không giữ được tồn kho). Kiểm tra event-service đang chạy và đã có API /api/inventory/reserve.',
        );
        return;
      }

      toast.error(`Đặt vé chưa hoàn tất (trạng thái: ${status || 'không xác định'}).`);
    } catch (e) {
      console.error('createBooking failed', e);
      toast.error(getApiErrorMessage(e, 'Không thể đặt vé — xem Network tab (POST /api/bookings) để biết chi tiết.'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Không tìm thấy sự kiện</p>
        <Button asChild variant="outline">
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const categories = event.ticketCategories ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <Button asChild variant="ghost" className="px-0">
          <Link to="/">← Quay lại danh sách</Link>
        </Button>

        <Card className="overflow-hidden">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-56 object-cover" />
          ) : (
            <div className="w-full h-56 bg-muted flex items-center justify-center text-muted-foreground">
              Chưa có ảnh
            </div>
          )}
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
            <CardDescription>{event.description ?? 'Không có mô tả'}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">Thời gian:</span> {formatEventDate(event.eventDate)}
            </p>
            <p>
              <span className="font-medium">Địa điểm:</span> {event.location}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chọn vé</CardTitle>
            <CardDescription>Nhập số lượng cho từng hạng vé</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.length === 0 && (
              <p className="text-muted-foreground text-sm">Sự kiện chưa có hạng vé.</p>
            )}
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border rounded-lg p-4"
              >
                <div className="space-y-1">
                  <p className="font-medium">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(Number(category.price))} · Còn{' '}
                    {category.availableQuantity ?? 0} vé
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={category.availableQuantity ?? 0}
                  value={quantities[category.id] ?? 0}
                  onChange={(e) => setQuantity(category, parseInt(e.target.value, 10) || 0)}
                  className="w-24 sm:w-28"
                />
              </div>
            ))}

            <div className="border-t pt-4 flex items-center justify-between">
              <span className="font-semibold">Tạm tính</span>
              <span className="text-lg font-bold">{formatCurrency(total)}</span>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={submitting || lineItems.length === 0}
              onClick={handleBook}
            >
              {submitting ? 'Đang đặt vé...' : 'Đặt vé'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
