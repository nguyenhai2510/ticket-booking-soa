import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Event } from '@/api/eventService';

const ticketCategorySchema = z.object({
  name: z.string().min(1, 'Tên hạng vé không được trống'),
  price: z.coerce.number().min(0, 'Giá vé không được âm'),
  totalQuantity: z.coerce.number().min(1, 'Số lượng phải ít nhất là 1'),
});

const eventFormSchema = z.object({
  title: z.string().min(3, 'Tên sự kiện phải từ 3 ký tự trở lên'),
  location: z.string().min(3, 'Địa điểm phải từ 3 ký tự trở lên'),
  eventDate: z.string().min(1, 'Vui lòng chọn ngày diễn ra'),
  imageUrl: z.string().url('URL ảnh không hợp lệ').optional().or(z.literal('')),
  description: z.string().optional(),
  ticketCategories: z.array(ticketCategorySchema).min(1, 'Cần có ít nhất một hạng vé'),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  initialData?: Event | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

import { useFieldArray } from 'react-hook-form';

const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const isEdit = !!initialData;

  // Format date to ISO-like string suitable for input[type="datetime-local"]
  const formatDateForInput = (dateStr?: string | null) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      // Offset timezone to get correct local time value
      const offset = date.getTimezoneOffset();
      const localDate = new Date(date.getTime() - offset * 60 * 1000);
      return localDate.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      location: initialData?.location || '',
      eventDate: formatDateForInput(initialData?.eventDate),
      imageUrl: initialData?.imageUrl || '',
      description: initialData?.description || '',
      ticketCategories: initialData?.ticketCategories
        ? initialData.ticketCategories.map((cat) => ({
            name: cat.name,
            price: Number(cat.price),
            totalQuantity: cat.totalQuantity,
          }))
        : [{ name: 'Vé Standard', price: 500000, totalQuantity: 1000 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketCategories',
  });

  const handleFormSubmit = async (values: EventFormValues) => {
    // Construct the payload for creation or update
    const payload: any = {
      title: values.title,
      location: values.location,
      eventDate: new Date(values.eventDate).toISOString(),
      imageUrl: values.imageUrl || null,
      description: values.description || null,
    };

    if (isEdit) {
      payload.id = initialData.id;
      payload.version = initialData.version;
    } else {
      // Map ticket categories for creation payload
      payload.ticketCategories = values.ticketCategories.map((cat) => ({
        name: cat.name,
        price: cat.price,
        totalQuantity: cat.totalQuantity,
        availableQuantity: cat.totalQuantity,
      }));
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1">
        <Label htmlFor="title">Tên sự kiện *</Label>
        <Input id="title" {...register('title')} placeholder="Ví dụ: Concert Live" />
        {errors.title && <p className="text-xs text-error font-medium">{errors.title.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="location">Địa điểm *</Label>
          <Input id="location" {...register('location')} placeholder="Sân vận động Mỹ Đình" />
          {errors.location && <p className="text-xs text-error font-medium">{errors.location.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="eventDate">Ngày diễn ra *</Label>
          <Input id="eventDate" type="datetime-local" {...register('eventDate')} />
          {errors.eventDate && <p className="text-xs text-error font-medium">{errors.eventDate.message}</p>}
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="imageUrl">URL Ảnh minh họa</Label>
        <Input id="imageUrl" {...register('imageUrl')} placeholder="https://example.com/image.png" />
        {errors.imageUrl && <p className="text-xs text-error font-medium">{errors.imageUrl.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Mô tả sự kiện</Label>
        <textarea
          id="description"
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
          placeholder="Thông tin giới thiệu về sự kiện..."
        />
      </div>

      {/* Initialize ticket categories ONLY when creating */}
      {!isEdit ? (
        <div className="p-4 bg-surface-container rounded-xl space-y-4 border border-outline-variant/30">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-bold text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-lg">confirmation_number</span>
              Khởi tạo vé mở bán
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', price: 0, totalQuantity: 100 })}
              className="h-8 px-2.5 text-xs font-bold gap-1"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              Thêm hạng vé
            </Button>
          </div>

          <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-end border-b border-outline-variant/20 pb-3 last:border-0 last:pb-0">
                <div className="flex-1 space-y-1">
                  {index === 0 && <Label className="text-xs">Tên hạng vé *</Label>}
                  <Input
                    {...register(`ticketCategories.${index}.name` as const)}
                    placeholder="Standard, VIP,..."
                    className="h-9 text-xs"
                  />
                  {errors.ticketCategories?.[index]?.name && (
                    <p className="text-[10px] text-error font-medium">
                      {errors.ticketCategories[index]?.name?.message}
                    </p>
                  )}
                </div>

                <div className="w-[120px] space-y-1">
                  {index === 0 && <Label className="text-xs">Giá vé (₫) *</Label>}
                  <Input
                    type="number"
                    {...register(`ticketCategories.${index}.price` as const)}
                    placeholder="500000"
                    className="h-9 text-xs"
                  />
                  {errors.ticketCategories?.[index]?.price && (
                    <p className="text-[10px] text-error font-medium">
                      {errors.ticketCategories[index]?.price?.message}
                    </p>
                  )}
                </div>

                <div className="w-[90px] space-y-1">
                  {index === 0 && <Label className="text-xs">Số lượng *</Label>}
                  <Input
                    type="number"
                    {...register(`ticketCategories.${index}.totalQuantity` as const)}
                    placeholder="100"
                    className="h-9 text-xs"
                  />
                  {errors.ticketCategories?.[index]?.totalQuantity && (
                    <p className="text-[10px] text-error font-medium">
                      {errors.ticketCategories[index]?.totalQuantity?.message}
                    </p>
                  )}
                </div>

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 mb-0.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all"
                    title="Xóa hạng vé"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                )}
              </div>
            ))}
            {errors.ticketCategories && !Array.isArray(errors.ticketCategories) && (
              <p className="text-xs text-error font-medium">
                {(errors.ticketCategories as any).message}
              </p>
            )}
          </div>
        </div>
      ) : (
        <div className="p-3 bg-surface-container/50 rounded-xl border border-outline-variant/20 text-xs text-on-surface-variant flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">info</span>
          Lưu ý: Bạn đang cập nhật thông tin cơ bản của sự kiện. Quản lý phân loại vé có thể được chỉnh sửa trực tiếp thông qua Inventory API.
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo sự kiện'}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
