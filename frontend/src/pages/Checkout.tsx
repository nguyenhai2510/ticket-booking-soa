import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { bookingService, type Booking, type BookingStatus } from '@/api/bookingService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useReservationCountdown } from '@/hooks/useReservationCountdown';
import { getApiErrorMessage } from '@/lib/apiError';
import { formatCurrency, formatEventDate } from '@/lib/format';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Đang xử lý',
  RESERVED: 'Đã giữ vé — chờ thanh toán',
  CONFIRMED: 'Thanh toán thành công',
  FAILED: 'Đặt vé thất bại',
  CANCELLED: 'Đã hủy',
  COMPENSATING: 'Đang hoàn tồn kho...',
};

export default function Checkout() {
  useRequireAuth();

  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadBooking = useCallback(async () => {
    if (!bookingId) return;
    try {
      setLoading(true);
      const data = await bookingService.getBooking(bookingId);
      setBooking(data);
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Không thể tải đơn đặt vé'));
      setBooking(null);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  const isReserved = booking?.status === 'RESERVED';
  const { display: countdownDisplay, isExpired: reservationExpired, secondsLeft } =
    useReservationCountdown(isReserved ? booking?.reservedUntil : null);

  useEffect(() => {
    if (!isReserved || !reservationExpired || !bookingId) return;
    void (async () => {
      await loadBooking();
      toast.warning('Hết thời gian giữ vé (5 phút). Đơn đã được hủy tự động.');
    })();
  }, [isReserved, reservationExpired, bookingId, loadBooking]);

  const handleConfirmPayment = async (simulateFailure = false) => {
    if (reservationExpired) {
      toast.warning('Hết thời gian giữ vé. Vui lòng đặt vé lại.');
      return;
    }
    if (!bookingId) return;
    setPaying(true);
    try {
      const updated = await bookingService.confirmPayment(bookingId, {
        paymentMethod: 'MOCK',
        simulateFailure,
      });
      setBooking(updated);
      if (updated.status === 'CONFIRMED') {
        toast.success('Thanh toán mock thành công!');
      } else if (updated.status === 'CANCELLED') {
        toast.warning('Thanh toán thất bại — đã hủy đơn và hoàn vé.');
      }
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Thanh toán thất bại'));
    } finally {
      setPaying(false);
    }
  };

  const handleCancel = async () => {
    if (reservationExpired) {
      await loadBooking();
      return;
    }
    if (!bookingId) return;
    setCancelling(true);
    try {
      const updated = await bookingService.cancelBooking(bookingId);
      setBooking(updated);
      toast.success('Đã hủy đơn và hoàn tồn kho vé.');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Không thể hủy đơn'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải đơn hàng...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex flex-col items-center justify-center gap-4">
        <p className="text-destructive">Không tìm thấy đơn đặt vé</p>
        <Button asChild variant="outline">
          <Link to="/">Về trang chủ</Link>
        </Button>
      </div>
    );
  }

  const isTerminal = ['CONFIRMED', 'CANCELLED', 'FAILED'].includes(booking.status);
  const canPay = isReserved && !reservationExpired;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="max-w-lg mx-auto px-4 py-10 space-y-6">
        <Button asChild variant="ghost" className="px-0">
          <Link to="/">← Trang chủ</Link>
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Thanh toán (Mock)</CardTitle>
            <CardDescription>
              Mã đơn: <span className="font-mono text-xs">{booking.id}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted/60 p-4 space-y-2 text-sm">
              {isReserved && booking.reservedUntil && (
                <div
                  className={`rounded-md border px-3 py-2 text-center ${
                    reservationExpired
                      ? 'border-destructive/40 bg-destructive/10 text-destructive'
                      : secondsLeft <= 60
                        ? 'border-amber-400/60 bg-amber-50 text-amber-900'
                        : 'border-primary/30 bg-primary/5 text-primary'
                  }`}
                >
                  <p className="text-xs font-medium uppercase tracking-wide">
                    Thời gian giữ vé còn lại
                  </p>
                  <p className="text-3xl font-mono font-bold tabular-nums">{countdownDisplay}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Sau 5:00 không thanh toán, đơn sẽ tự hủy và hoàn vé.
                  </p>
                </div>
              )}
              <p>
                <span className="font-medium">Trạng thái:</span>{' '}
                {STATUS_LABEL[booking.status] ?? booking.status}
              </p>
              {booking.bookingTime && (
                <p>
                  <span className="font-medium">Thời gian đặt:</span>{' '}
                  {formatEventDate(booking.bookingTime)}
                </p>
              )}
              <p>
                <span className="font-medium">Tổng tiền:</span>{' '}
                <span className="text-lg font-bold">
                  {formatCurrency(Number(booking.totalAmount))}
                </span>
              </p>
            </div>

            <ul className="space-y-2 text-sm border rounded-lg p-4">
              {booking.items?.map((item) => (
                <li key={item.id} className="flex justify-between gap-2">
                  <span>
                    Hạng vé · x{item.quantity}
                  </span>
                  <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
                </li>
              ))}
            </ul>

            {isReserved && (
              <div className="space-y-3 pt-2">
                {reservationExpired ? (
                  <p className="text-sm text-destructive text-center">
                    Đơn đã hết hạn giữ vé. Vui lòng quay lại sự kiện để đặt lại.
                  </p>
                ) : (
                  <>
                    <Button
                      className="w-full"
                      size="lg"
                      disabled={!canPay || paying || cancelling}
                      onClick={() => handleConfirmPayment(false)}
                    >
                      {paying ? 'Đang xử lý...' : 'Xác nhận thanh toán (Mock)'}
                    </Button>
                    <Button
                      className="w-full"
                      variant="outline"
                      disabled={!canPay || paying || cancelling}
                      onClick={handleCancel}
                    >
                      {cancelling ? 'Đang hủy...' : 'Hủy đơn (hoàn vé)'}
                    </Button>
                    <Button
                      className="w-full"
                      variant="secondary"
                      size="sm"
                      disabled={!canPay || paying || cancelling}
                      onClick={() => handleConfirmPayment(true)}
                    >
                      Test: thanh toán thất bại (SAGA compensate)
                    </Button>
                  </>
                )}
              </div>
            )}

            {booking.status === 'CONFIRMED' && (
              <div className="text-center space-y-3">
                <p className="text-green-700 font-medium">Đặt vé và thanh toán hoàn tất.</p>
                <Button className="w-full" onClick={() => navigate('/')}>
                  Về trang chủ
                </Button>
              </div>
            )}

            {isTerminal && booking.status !== 'CONFIRMED' && (
              <Button className="w-full" variant="outline" onClick={() => navigate('/')}>
                Về trang chủ
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
