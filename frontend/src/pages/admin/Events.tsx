import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { eventService, Event } from '@/api/eventService';
import EventForm from '@/components/admin/EventForm';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);

  // Fetch events on mount
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getEvents();
      // Ensure sorted by newest
      const sortedData = data.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setEvents(sortedData);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách sự kiện:', err);
      toast.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Form submit handler (both Create and Edit)
  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedEvent) {
        // Edit Mode
        const updated = await eventService.updateEvent(selectedEvent.id, payload);
        toast.success(`Đã cập nhật sự kiện "${updated.title}" thành công!`);
      } else {
        // Create Mode
        const created = await eventService.createEvent(payload);
        toast.success(`Đã tạo sự kiện mới "${created.title}" thành công!`);
      }
      setIsFormOpen(false);
      setSelectedEvent(null);
      fetchEvents();
    } catch (err: any) {
      console.error('Form submit error:', err);
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi lưu sự kiện.');
    }
  };

  // Delete event handler
  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    try {
      await eventService.deleteEvent(eventToDelete.id);
      toast.success(`Đã xóa sự kiện "${eventToDelete.title}" thành công!`);
      setIsDeleteConfirmOpen(false);
      setEventToDelete(null);
      fetchEvents();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Không thể xóa sự kiện. Vui lòng thử lại.');
    }
  };

  // Open edit dialog
  const handleEditClick = (event: Event) => {
    setSelectedEvent(event);
    setIsFormOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (event: Event) => {
    setEventToDelete(event);
    setIsDeleteConfirmOpen(true);
  };

  // Open create dialog
  const handleCreateClick = () => {
    setSelectedEvent(null);
    setIsFormOpen(true);
  };

  // Category mapping helper to match Stitch design aesthetics
  const getEventCategory = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('concert') || t.includes('night') || t.includes('music') || t.includes('ca nhạc')) {
      return { name: 'Âm nhạc', bg: 'bg-primary-container/10 text-primary', classes: 'bg-[#e2dfff] text-[#3323cc]' };
    }
    if (t.includes('summit') || t.includes('tech') || t.includes('conference') || t.includes('hội thảo')) {
      return { name: 'Hội thảo', bg: 'bg-surface-container-highest text-on-surface-variant', classes: 'bg-[#e4e1ee] text-[#464555]' };
    }
    return { name: 'Nghệ thuật', bg: 'bg-tertiary-container/10 text-tertiary', classes: 'bg-[#ffdbcc] text-[#7e3000]' };
  };

  // Calculations for list elements
  const getTicketStats = (event: Event) => {
    if (!event.ticketCategories || event.ticketCategories.length === 0) {
      return { sold: 0, total: 0, percent: 0 };
    }
    let total = 0;
    let available = 0;
    event.ticketCategories.forEach((cat) => {
      total += cat.totalQuantity || 0;
      available += cat.availableQuantity || 0;
    });
    const sold = total - available;
    const percent = total > 0 ? Math.round((sold / total) * 100) : 0;
    return { sold, total, percent };
  };

  const getPriceDisplay = (event: Event) => {
    if (!event.ticketCategories || event.ticketCategories.length === 0) {
      return 'Chưa cấu hình';
    }
    const prices = event.ticketCategories.map((cat) => Number(cat.price));
    const minPrice = Math.min(...prices);
    if (minPrice === 0) return 'Miễn phí';
    return `${minPrice.toLocaleString('vi-VN')}₫`;
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const { sold, total } = getTicketStats(event);

    if (eventDate < now) {
      return { label: 'Đã kết thúc', color: 'text-error' };
    }
    if (total > 0 && sold >= total) {
      return { label: 'Hết vé', color: 'text-error' };
    }
    if (!event.ticketCategories || event.ticketCategories.length === 0) {
      return { label: 'Bản nháp', color: 'text-outline' };
    }
    return { label: 'Hoạt động', color: 'text-emerald-600', active: true };
  };

  // Filter events based on search query
  const filteredEvents = events.filter((evt) => {
    const query = searchQuery.toLowerCase();
    return (
      evt.title.toLowerCase().includes(query) ||
      evt.location.toLowerCase().includes(query) ||
      (evt.description && evt.description.toLowerCase().includes(query))
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-outline-variant/60">
        <CardContent className="p-0">
          {/* Header Action Bar */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Danh sách sự kiện</h3>
              <p className="text-xs text-on-surface-variant">
                Quản lý, theo dõi hiệu suất bán vé và thêm các sự kiện mới.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 md:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  search
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
                  placeholder="Tìm sự kiện trong bảng..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateClick} className="gap-2 font-bold px-5 py-2.5">
                <span className="material-symbols-outlined text-lg">add</span>
                Thêm sự kiện mới
              </Button>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-on-surface-variant">Đang tải danh sách sự kiện...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">info</span>
              <p className="text-sm">Không tìm thấy sự kiện nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low border-b border-outline-variant hover:bg-surface-container-low">
                    <TableHead className="w-[30%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Tên sự kiện
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Danh mục
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Ngày diễn ra
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Vé đã bán
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Giá vé
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-outline-variant">
                  {filteredEvents.map((evt) => {
                    const category = getEventCategory(evt.title);
                    const stats = getTicketStats(evt);
                    const status = getEventStatus(evt);
                    
                    return (
                      <TableRow key={evt.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/30">
                              {evt.imageUrl ? (
                                <img
                                  className="w-full h-full object-cover"
                                  alt={evt.title}
                                  src={evt.imageUrl}
                                />
                              ) : (
                                <div className="w-full h-full bg-primary-container/10 flex items-center justify-center text-primary">
                                  <span className="material-symbols-outlined">event</span>
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-sm group-hover:text-primary transition-colors">
                                {evt.title}
                              </p>
                              <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {evt.location}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${category.classes}`}>
                            {category.name}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-on-surface-variant">
                          {new Date(evt.eventDate).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>

                        <TableCell>
                          <div className="w-full max-w-[120px] space-y-1">
                            <div className="flex justify-between text-xs font-medium">
                              <span>{stats.sold}/{stats.total}</span>
                              <span className="text-primary font-bold">{stats.percent}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-300"
                                style={{ width: `${stats.percent}%` }}
                              ></div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm font-semibold">
                          {getPriceDisplay(evt)}
                        </TableCell>

                        <TableCell>
                          <span className={`flex items-center gap-1.5 font-bold text-xs ${status.color}`}>
                            {status.active && (
                              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            )}
                            {status.label}
                          </span>
                        </TableCell>

                        <TableCell className="text-right space-x-1">
                          <button
                            onClick={() => handleEditClick(evt)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(evt)}
                            className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                            title="Xóa"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? 'Chỉnh sửa sự kiện' : 'Thêm sự kiện mới'}
            </DialogTitle>
            <DialogDescription>
              Điền các thông tin cần thiết vào form bên dưới để cập nhật danh sách sự kiện.
            </DialogDescription>
          </DialogHeader>
          <EventForm
            initialData={selectedEvent}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-error flex items-center gap-2">
              <span className="material-symbols-outlined">warning</span>
              Xác nhận xóa sự kiện
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa sự kiện <strong>"{eventToDelete?.title}"</strong> không? 
              Hành động này sẽ xóa vĩnh viễn sự kiện cùng với tất cả danh mục vé tương ứng khỏi cơ sở dữ liệu.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-outline-variant/30">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Hủy bỏ
            </Button>
            <Button
              className="bg-error text-white hover:bg-error/90"
              onClick={handleDeleteConfirm}
            >
              Xác nhận xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
