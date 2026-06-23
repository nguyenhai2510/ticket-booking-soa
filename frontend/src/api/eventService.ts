import axiosClient from './axiosClient';

export interface TicketCategory {
  id: string;
  name: string;
  price: number;
  totalQuantity: number;
  availableQuantity: number;
}

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  eventDate: string;
  imageUrl?: string | null;
  version?: number;
  createdAt?: string | null;
  ticketCategories?: TicketCategory[];
}

export const eventService = {
  getEvents: async (): Promise<Event[]> => {
    return await axiosClient.get('/api/events');
  },

  getEventById: async (id: string): Promise<Event> => {
    return await axiosClient.get(`/api/events/${id}`);
  },

  createEvent: async (event: Partial<Event>): Promise<Event> => {
    return await axiosClient.post('/api/events', event);
  },

  updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
    return await axiosClient.put(`/api/events/${id}`, event);
  },

  deleteEvent: async (id: string): Promise<void> => {
    return await axiosClient.delete(`/api/events/${id}`);
  },
};
