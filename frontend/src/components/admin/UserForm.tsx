import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/api/userService';

const baseSchema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải từ 3 ký tự trở lên'),
  email: z.string().email('Email không hợp lệ'),
  role: z.enum(['USER', 'ADMIN'], { message: 'Vui lòng chọn vai trò' }),
});

const createSchema = baseSchema.extend({
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});

const editSchema = baseSchema.extend({
  password: z.string().optional(),
});

type CreateUserFormValues = z.infer<typeof createSchema>;
type EditUserFormValues = z.infer<typeof editSchema>;
type UserFormValues = CreateUserFormValues | EditUserFormValues;

interface UserFormProps {
  initialData?: User | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const isEdit = !!initialData;
  const schema = isEdit ? editSchema : createSchema;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: initialData?.username || '',
      email: initialData?.email || '',
      role: (initialData?.role as 'USER' | 'ADMIN') || 'USER',
      password: '',
    },
  });

  const handleFormSubmit = async (values: UserFormValues) => {
    const payload: any = {
      username: values.username,
      email: values.email,
      role: values.role,
    };

    if (!isEdit) {
      payload.password = (values as CreateUserFormValues).password;
    }

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
      <div className="space-y-1">
        <Label htmlFor="username">Tên đăng nhập *</Label>
        <Input id="username" {...register('username')} placeholder="vidu: nguyenvana" />
        {errors.username && <p className="text-xs text-error font-medium">{errors.username.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} placeholder="email@example.com" />
        {errors.email && <p className="text-xs text-error font-medium">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="role">Vai trò *</Label>
        <select
          id="role"
          {...register('role')}
          className="w-full h-10 px-3 py-2 bg-background border border-input rounded-md text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all cursor-pointer"
        >
          <option value="USER">Người dùng (USER)</option>
          <option value="ADMIN">Quản trị viên (ADMIN)</option>
        </select>
        {errors.role && <p className="text-xs text-error font-medium">{errors.role.message}</p>}
      </div>

      {!isEdit && (
        <div className="space-y-1">
          <Label htmlFor="password">Mật khẩu *</Label>
          <Input
            id="password"
            type="password"
            {...register('password' as const)}
            placeholder="Ít nhất 6 ký tự"
          />
          {errors.password && <p className="text-xs text-error font-medium">{errors.password.message}</p>}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/40">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy bỏ
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo người dùng'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
