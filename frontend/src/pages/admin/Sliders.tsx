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
import { sliderService, Slide } from '@/api/sliderService';
import SliderForm from '@/components/admin/SliderForm';

const Sliders: React.FC = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<Slide | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [slideToDelete, setSlideToDelete] = useState<Slide | null>(null);

  // Fetch slides
  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await sliderService.getSlides();
      setSlides(data);
    } catch (err) {
      console.error('Error fetching slides:', err);
      toast.error('Không thể lấy danh sách tin nổi bật.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Form Submit Handler
  const handleFormSubmit = async (values: any) => {
    try {
      if (selectedSlide) {
        // Edit Mode
        const updated = await sliderService.updateSlide(selectedSlide.id, values);
        toast.success(`Đã cập nhật slide "${updated.title}" thành công!`);
      } else {
        // Create Mode
        const created = await sliderService.createSlide(values);
        toast.success(`Đã thêm slide mới "${created.title}" thành công!`);
      }
      setIsFormOpen(false);
      setSelectedSlide(null);
      fetchSlides();
    } catch (err: any) {
      console.error('Submit slide error:', err);
      toast.error(err.message || 'Có lỗi xảy ra khi lưu slide.');
    }
  };

  // Delete Slide Handler
  const handleDeleteConfirm = async () => {
    if (!slideToDelete) return;
    try {
      await sliderService.deleteSlide(slideToDelete.id);
      toast.success(`Đã xóa slide "${slideToDelete.title}" thành công!`);
      setIsDeleteConfirmOpen(false);
      setSlideToDelete(null);
      fetchSlides();
    } catch (err: any) {
      console.error('Delete slide error:', err);
      toast.error('Không thể xóa slide. Vui lòng thử lại.');
    }
  };

  // Actions click triggers
  const handleEditClick = (slide: Slide) => {
    setSelectedSlide(slide);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (slide: Slide) => {
    setSlideToDelete(slide);
    setIsDeleteConfirmOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedSlide(null);
    setIsFormOpen(true);
  };

  // Filter slides
  const filteredSlides = slides.filter((slide) => {
    return slide.title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-outline-variant/60">
        <CardContent className="p-0">
          {/* Header Action Bar */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Quản lý Tin nổi bật</h3>
              <p className="text-xs text-on-surface-variant">
                Cấu hình các banner quảng cáo và sự kiện nổi bật hiển thị ở Slider chính trang chủ.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64 md:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  search
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
                  placeholder="Tìm kiếm tiêu đề slide..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={handleCreateClick} className="gap-2 font-bold px-5 py-2.5">
                <span className="material-symbols-outlined text-lg">add</span>
                Thêm slide mới
              </Button>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-on-surface-variant">Đang tải danh sách slide...</p>
            </div>
          ) : filteredSlides.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">photo_library</span>
              <p className="text-sm">Không tìm thấy slide nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low border-b border-outline-variant hover:bg-surface-container-low">
                    <TableHead className="w-[12%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Hình ảnh
                    </TableHead>
                    <TableHead className="w-[35%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Tiêu đề banner
                    </TableHead>
                    <TableHead className="w-[20%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Đường dẫn liên kết
                    </TableHead>
                    <TableHead className="w-[10%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Thứ tự
                    </TableHead>
                    <TableHead className="w-[13%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-right font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-outline-variant">
                  {filteredSlides.map((slide) => (
                    <TableRow key={slide.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <TableCell>
                        <div className="w-20 h-12 rounded-md overflow-hidden bg-surface-container border border-outline-variant/30">
                          <img
                            className="w-full h-full object-cover"
                            alt={slide.title}
                            src={slide.imageUrl}
                          />
                        </div>
                      </TableCell>

                      <TableCell className="font-bold text-sm text-on-surface">
                        {slide.title}
                      </TableCell>

                      <TableCell className="text-xs text-on-surface-variant break-all font-mono">
                        {slide.linkUrl}
                      </TableCell>

                      <TableCell className="text-sm font-semibold">
                        {slide.displayOrder}
                      </TableCell>

                      <TableCell>
                        {slide.isActive ? (
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            Hiển thị
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-outline font-bold text-xs">
                            <span className="w-2 h-2 bg-outline rounded-full"></span>
                            Ẩn
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-1">
                        <button
                          onClick={() => handleEditClick(slide)}
                          className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                          title="Chỉnh sửa"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(slide)}
                          className="p-2 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {selectedSlide ? 'Chỉnh sửa slide' : 'Thêm slide mới'}
            </DialogTitle>
            <DialogDescription>
              Nhập đầy đủ thông tin để định cấu hình vị trí hiển thị và đường dẫn của slide banner.
            </DialogDescription>
          </DialogHeader>
          <SliderForm
            initialData={selectedSlide}
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
              Xác nhận xóa slide
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa slide <strong>"{slideToDelete?.title}"</strong> không?
              Hành động này sẽ gỡ banner quảng cáo này khỏi trang chủ ngay lập tức.
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

export default Sliders;
