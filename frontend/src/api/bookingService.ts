import axiosClient from './axiosClient';

export type BookingStatus =
  | 'PENDING'
  | 'RESERVED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'CANCELLED'
  | 'COMPENSATING';

export interface BookingItem {
  id: string;
  ticketCategoryId: string;
  quantity: number;
  price: number;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: number;
  status: BookingStatus;
  bookingTime?: string;
  reservedUntil?: string;
  items: BookingItem[];
}

export interface CreateBookingItem {
  ticketCategoryId: string;
  quantity: number;
}

export interface CreateBookingPayload {
  userId: string;
  eventId: string;
  items: CreateBookingItem[];
}

export interface ConfirmPaymentPayload {
  paymentMethod?: string;
  simulateFailure?: boolean;
}

export const bookingService = {
  createBooking: async (payload: CreateBookingPayload): Promise<Booking> => {
    return await axiosClient.post('/api/bookings', payload);
  },

  getBooking: async (id: string): Promise<Booking> => {
    return await axiosClient.get(`/api/bookings/${id}`);
  },

  confirmPayment: async (
    id: string,
    payload?: ConfirmPaymentPayload,
  ): Promise<Booking> => {
    return await axiosClient.post(`/api/bookings/${id}/confirm-payment`, payload ?? {});
  },

  cancelBooking: async (id: string): Promise<Booking> => {
    return await axiosClient.post(`/api/bookings/${id}/cancel`, {});
  },
};
