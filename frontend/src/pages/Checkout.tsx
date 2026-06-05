import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { bookingService, type Booking, type BookingStatus } from '@/api/bookingService';
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
        toast.success('Thanh toán thành công!');
        try {
          const stored = localStorage.getItem('confirmedBookings');
          const list = stored ? JSON.parse(stored) : [];
          // Tránh lưu trùng lặp
          if (!list.some((b: any) => b.id === updated.id)) {
            list.push(updated);
            localStorage.setItem('confirmedBookings', JSON.stringify(list));
          }
        } catch (err) {
          console.error('Không thể lưu vé đã mua:', err);
        }
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
      toast.success('Đã hủy đơn đặt vé thành công.');
    } catch (e) {
      toast.error(getApiErrorMessage(e, 'Không thể hủy đơn'));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-label-md">Đang tải thông tin thanh toán...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center gap-4">
        <span className="material-symbols-outlined text-error text-6xl">receipt_long</span>
        <h3 className="font-h3 text-h3 font-bold text-on-surface">Không tìm thấy đơn đặt vé</h3>
        <button 
          onClick={() => navigate('/')}
          className="bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-xl hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-100"
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  const isTerminal = ['CONFIRMED', 'CANCELLED', 'FAILED'].includes(booking.status);
  const canPay = isReserved && !reservationExpired;

  return (
    <div className="bg-background text-on-surface font-body-base antialiased min-h-screen flex flex-col">
      {/* Minimal Transactional Header */}
      <header className="bg-surface-container-lowest border-b border-outline-variant py-4 px-gutter flex justify-between items-center z-10 relative">
        <div className="max-w-container-max mx-auto w-full flex justify-between items-center">
          <div 
            onClick={() => navigate('/')}
            className="font-h2 text-h2 font-bold text-primary cursor-pointer flex items-center gap-2"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
            EventPass
          </div>
          <a 
            onClick={(e) => { e.preventDefault(); navigate('/'); }}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-label-md text-label-md hidden sm:inline">Quay lại trang chủ</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-8">
        <div className="mb-stack-gap">
          <h1 className="font-h1 text-h1 text-on-surface font-bold text-3xl">Trang Thanh toán</h1>
          <p className="font-body-base text-body-base text-on-surface-variant mt-2">Hoàn tất các bước giả lập để thanh toán vé của bạn.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Transactional details & mock payment */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            
            {/* Countdown and Status Alert Card */}
            {isReserved && booking.reservedUntil && (
              <section className="bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm flex flex-col gap-4">
                <div
                  className={`rounded-xl border p-5 text-center flex flex-col items-center justify-center gap-2 ${
                    reservationExpired
                      ? 'border-error/40 bg-error/5 text-error'
                      : secondsLeft <= 60
                        ? 'border-amber-500/60 bg-amber-50 text-amber-900'
                        : 'border-primary/30 bg-primary/5 text-primary'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">
                    Thời gian giữ vé còn lại
                  </p>
                  <p className="text-4xl font-mono font-bold tabular-nums tracking-wide">{countdownDisplay}</p>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-md">
                    Vui lòng thanh toán trước khi hết giờ. Hết thời gian giữ vé, đơn đặt vé sẽ bị hủy tự động và hoàn trả vé vào kho.
                  </p>
                </div>
              </section>
            )}

            {/* Status Information for Completed bookings */}
            {isTerminal && (
              <section className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center gap-4 text-center">
                {booking.status === 'CONFIRMED' ? (
                  <>
                    <span className="material-symbols-outlined text-green-600 text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    <h2 className="font-h3 text-h3 text-green-700 font-bold">Đặt Vé Thành Công!</h2>
                    <p className="text-on-surface-variant max-w-md">Đơn đặt vé đã được thanh toán hoàn tất. Bạn có thể xem vé của mình trong lịch sử đặt vé.</p>
                    <div className="flex gap-4 w-full max-w-sm mt-2">
                      <button 
                        onClick={() => navigate('/profile')}
                        className="w-full bg-primary hover:bg-primary-container text-on-primary font-label-md py-3 rounded-xl transition-all font-semibold shadow-sm"
                      >
                        Xem Lịch sử mua vé
                      </button>
                      <button 
                        onClick={() => navigate('/')}
                        className="w-full border border-primary text-primary font-label-md py-3 rounded-xl hover:bg-surface-container-low transition-all font-semibold"
                      >
                        Về Trang chủ
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-error text-6xl">cancel</span>
                    <h2 className="font-h3 text-h3 text-error font-bold">Đơn Đặt Vé Đã Bị Hủy</h2>
                    <p className="text-on-surface-variant max-w-md">Đơn đặt vé này hiện đã ở trạng thái: <strong>{STATUS_LABEL[booking.status]}</strong>. Vé đã được trả lại về kho chứa hệ thống.</p>
                    <button 
                      onClick={() => navigate('/')}
                      className="mt-2 bg-primary text-on-primary font-label-md px-6 py-2.5 rounded-xl hover:bg-primary-container transition-colors shadow-sm active:scale-95 duration-100"
                    >
                      Quay lại trang chủ
                    </button>
                  </>
                )}
              </section>
            )}

            {/* Booking Details / Customer info */}
            {!isTerminal && (
              <>
                <section className="bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
                  <div className="flex items-center gap-3 border-b border-outline-variant pb-4">
                    <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                    <h2 className="font-h3 text-h3 font-bold text-lg">Thông tin giao dịch</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-base">
                    <div>
                      <span className="text-on-surface-variant text-body-sm block">Mã đơn đặt vé</span>
                      <strong className="font-mono text-sm text-on-surface select-all">{booking.id}</strong>
                    </div>
                    <div>
                      <span className="text-on-surface-variant text-body-sm block">Trạng thái đơn hàng</span>
                      <strong className="text-primary font-semibold">{STATUS_LABEL[booking.status] ?? booking.status}</strong>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-on-surface-variant text-body-sm block">Phương thức thanh toán</span>
                      <span className="font-medium">Cổng giả lập (Mock Gate)</span>
                    </div>
                  </div>
                </section>

                {/* Mock Actions Panel */}
                <section className="bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm flex flex-col gap-4">
                  <div className="flex items-center gap-3 border-b border-outline-variant pb-4 mb-2">
                    <span className="material-symbols-outlined text-primary text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
                    <h2 className="font-h3 text-h3 font-bold text-lg">Giả lập cổng thanh toán</h2>
                  </div>
                  
                  {reservationExpired ? (
                    <p className="text-error text-center font-medium py-4">Đơn hàng đã hết hạn giữ vé. Không thể thực hiện thanh toán.</p>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {/* Normal Pay Button */}
                      <button 
                        onClick={() => handleConfirmPayment(false)}
                        disabled={!canPay || paying || cancelling}
                        className="w-full bg-primary hover:bg-primary-container text-on-primary py-4 px-6 rounded-xl font-h3 text-h3 flex items-center justify-center gap-2 font-bold shadow-sm disabled:opacity-50 transition-all duration-100 active:scale-[0.98]"
                      >
                        {paying ? (
                          <>
                            <div className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang thực hiện giao dịch...</span>
                          </>
                        ) : (
                          <>
                            <span>Xác nhận Thanh toán (Thành công)</span>
                            <span className="material-symbols-outlined">lock</span>
                          </>
                        )}
                      </button>

                      {/* Fail Test SAGA button */}
                      <button 
                        onClick={() => handleConfirmPayment(true)}
                        disabled={!canPay || paying || cancelling}
                        className="w-full border border-error text-error hover:bg-error/5 py-3 px-6 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 font-semibold disabled:opacity-50 transition-all duration-100"
                      >
                        {paying ? (
                          <span>Đang giả lập lỗi...</span>
                        ) : (
                          <>
                            <span>Giả lập Thanh toán Thất bại (Kiểm thử SAGA)</span>
                            <span className="material-symbols-outlined text-[18px]">bug_report</span>
                          </>
                        )}
                      </button>

                      {/* Cancel Button */}
                      <button 
                        onClick={handleCancel}
                        disabled={!canPay || paying || cancelling}
                        className="w-full border border-outline-variant text-on-surface hover:bg-surface-container-low py-3 px-6 rounded-xl font-label-md text-label-md flex items-center justify-center gap-2 font-semibold disabled:opacity-50 transition-all duration-100"
                      >
                        {cancelling ? (
                          <span>Đang hủy đơn...</span>
                        ) : (
                          <>
                            <span>Hủy đặt vé này</span>
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </>
                        )}
                      </button>

                      <p className="text-center font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1 opacity-80 mt-2">
                        <span className="material-symbols-outlined text-[16px] text-green-600">verified_user</span>
                        Giao dịch được mô phỏng an toàn trong môi trường phát triển.
                      </p>
                    </div>
                  )}
                </section>
              </>
            )}

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-24 bg-surface-container-lowest p-card-padding rounded-xl border border-outline-variant shadow-sm flex flex-col gap-6">
              <h2 className="font-h3 text-h3 font-bold border-b border-outline-variant pb-4 text-lg">Tóm tắt đơn hàng</h2>
              
              {/* Ticket Details list */}
              <div className="flex flex-col gap-4">
                {booking.items?.map((item) => (
                  <div key={item.id} className="flex justify-between items-start font-body-base text-body-base">
                    <div className="flex flex-col">
                      <span className="text-on-surface font-semibold">Vé Hạng phổ thông</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">Số lượng: x{item.quantity}</span>
                    </div>
                    <span className="text-on-surface font-bold">{formatCurrency(Number(item.price) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-outline-variant"/>

              {/* Cost Calculations */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Tạm tính</span>
                  <span>{formatCurrency(Number(booking.totalAmount))}</span>
                </div>
                <div className="flex justify-between font-body-sm text-body-sm text-on-surface-variant">
                  <span>Phí dịch vụ</span>
                  <span>0 đ</span>
                </div>
              </div>

              {/* Total final price */}
              <div className="p-4 bg-surface-container-low rounded-xl flex flex-col gap-1 border border-outline-variant/50">
                <div className="flex justify-between items-end">
                  <span className="font-label-md text-label-md text-on-surface-variant font-semibold">Tổng thanh toán</span>
                  <span className="font-h2 text-h2 text-primary font-bold text-xl">{formatCurrency(Number(booking.totalAmount))}</span>
                </div>
                <div className="text-right font-body-sm text-body-sm text-on-surface-variant text-[11px]">(Đã bao gồm phí và thuế)</div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
