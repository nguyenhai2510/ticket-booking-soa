import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slide } from '@/api/sliderService';
import { eventService, Event } from '@/api/eventService';

const sliderSchema = z.object({
  title: z.string().min(3, 'Tiêu đề slide phải từ 3 ký tự trở lên'),
  imageUrl: z.string().url('URL ảnh không hợp lệ'),
  linkUrl: z.string().min(1, 'Đường dẫn liên kết không được để trống'),
  displayOrder: z.coerce.number().min(1, 'Thứ tự hiển thị phải lớn hơn 0'),
  isActive: z.boolean().default(true),
});

type SliderFormValues = z.infer<typeof sliderSchema>;

interface SliderFormProps {
  initialData?: Slide | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const SliderForm: React.FC<SliderFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const isEdit = !!initialData;
  const [events, setEvents] = useState<Event[]>([]);

  // Fetch events list for auto-fill selection
  useEffect(() => {
    if (!isEdit) {
      eventService.getEvents()
        .then((data) => setEvents(data))
        .catch((err) => console.error('Error fetching events in SliderForm:', err));
    }
  }, [isEdit]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SliderFormValues>({
    resolver: zodResolver(sliderSchema),
    defaultValues: {
      title: initialData?.title || '',
      imageUrl: initialData?.imageUrl || '',
      linkUrl: initialData?.linkUrl || '',
      displayOrder: initialData?.displayOrder || 1,
      isActive: initialData ? initialData.isActive : true,
    },
  });

  // Auto-fill form values based on selected event
  const handleEventSelect = (eventId: string) => {
    const selectedEvent = events.find((e) => e.id === eventId);
    if (selectedEvent) {
      setValue('title', selectedEvent.title, { shouldValidate: true });
      setValue('imageUrl', selectedEvent.imageUrl || '', { shouldValidate: true });
      setValue('linkUrl', `/events/${selectedEvent.id}`, { shouldValidate: true });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
      {!isEdit && events.length > 0 && (
        <div className="space-y-1">
          <Label htmlFor="selectEvent">Liên kết nhanh từ sự kiện có sẵn</Label>
          <select
            id="selectEvent"
            onChange={(e) => handleEventSelect(e.target.value)}
            defaultValue=""
            className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all h-10 cursor-pointer"
          >
            <option value="" disabled>-- Chọn một sự kiện có sẵn --</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                {evt.title} ({evt.location})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-on-surface-variant/70">
            Hệ thống sẽ tự động điền các thông tin cơ bản từ sự kiện được chọn.
          </p>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="title">Tiêu đề Slide *</Label>
        <Input id="title" {...register('title')} placeholder="Ví dụ: Đại nhạc hội EDM 2026" />
        {errors.title && <p className="text-xs text-error font-medium">{errors.title.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="imageUrl">URL Ảnh banner *</Label>
        <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/banner.png" />
        {errors.imageUrl && <p className="text-xs text-error font-medium">{errors.imageUrl.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="linkUrl">Đường dẫn liên kết *</Label>
        <Input id="linkUrl" {...register('linkUrl')} placeholder="/events/id-su-kien hoặc /checkout/id" />
        {errors.linkUrl && <p className="text-xs text-error font-medium">{errors.linkUrl.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 items-center">
        <div className="space-y-1">
          <Label htmlFor="displayOrder">Thứ tự hiển thị *</Label>
          <Input id="displayOrder" type="number" {...register('displayOrder')} />
          {errors.displayOrder && <p className="text-xs text-error font-medium">{errors.displayOrder.message}</p>}
        </div>

        <div className="flex items-center gap-2 pt-5">
          <input
            id="isActive"
            type="checkbox"
            {...register('isActive')}
            className="w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary"
          />
          <Label htmlFor="isActive" className="cursor-pointer">Kích hoạt hiển thị</Label>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Thêm slide'}
        </Button>
      </div>
    </form>
  );
};

export default SliderForm;
