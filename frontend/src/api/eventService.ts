import axiosClient from './axiosClient';

export interface TicketCategory {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Event {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  ticketCategories?: TicketCategory[];
}

export const eventService = {
  getEvents: async (): Promise<Event[]> => {
    return await axiosClient.get('/api/events');
  },

  getEventById: async (id: number): Promise<Event> => {
    return await axiosClient.get(`/api/events/${id}`);
  },
};

