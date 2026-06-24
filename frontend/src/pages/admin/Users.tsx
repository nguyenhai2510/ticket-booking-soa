import React, { useEffect, useMemo, useState } from 'react';
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
import { userService, User } from '@/api/userService';
import { getApiErrorMessage } from '@/lib/apiError';
import UserForm from '@/components/admin/UserForm';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Current admin id (for self-delete guard)
  const currentUserId = useMemo(() => {
    return localStorage.getItem('userId') || null;
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      const sortedData = [...data].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setUsers(sortedData);
    } catch (err) {
      console.error('Lỗi khi lấy danh sách người dùng:', err);
      toast.error('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleFormSubmit = async (payload: any) => {
    try {
      if (selectedUser) {
        const updated = await userService.updateUser(selectedUser.id, payload);
        toast.success(`Đã cập nhật người dùng "${updated.username}" thành công!`);
      } else {
        const created = await userService.createUser(payload);
        toast.success(`Đã tạo người dùng "${created.username}" thành công!`);
      }
      setIsFormOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Form submit error:', err);
      toast.error(getApiErrorMessage(err, 'Có lỗi xảy ra khi lưu người dùng.'));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.id);
      toast.success(`Đã xóa người dùng "${userToDelete.username}" thành công!`);
      setIsDeleteConfirmOpen(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(getApiErrorMessage(err, 'Không thể xóa người dùng. Vui lòng thử lại.'));
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setIsDeleteConfirmOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const getRoleBadge = (role: string) => {
    if (role === 'ADMIN') {
      return 'bg-[#e2dfff] text-[#3323cc]';
    }
    return 'bg-[#e4e1ee] text-[#464555]';
  };

  const getRoleLabel = (role: string) => {
    if (role === 'ADMIN') return 'Quản trị viên';
    return 'Người dùng';
  };

  const getInitials = (username: string) => {
    const parts = username.trim().split(/\s+|[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return username.slice(0, 2).toUpperCase();
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-outline-variant/60">
        <CardContent className="p-0">
          {/* Header Action Bar */}
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-outline-variant">
            <div>
              <h3 className="text-lg font-bold text-on-surface mb-1">Danh sách người dùng</h3>
              <p className="text-xs text-on-surface-variant">
                Quản lý tài khoản, phân quyền và theo dõi người dùng trong hệ thống.
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto flex-wrap">
              <div className="relative flex-1 md:w-64 md:flex-none">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
                  search
                </span>
                <input
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs"
                  placeholder="Tìm theo tên đăng nhập hoặc email..."
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as 'ALL' | 'USER' | 'ADMIN')}
                className="px-3 py-2.5 bg-background border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-xs cursor-pointer"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="ADMIN">Quản trị viên</option>
                <option value="USER">Người dùng</option>
              </select>
              <Button onClick={handleCreateClick} className="gap-2 font-bold px-5 py-2.5">
                <span className="material-symbols-outlined text-lg">add</span>
                Thêm người dùng
              </Button>
            </div>
          </div>

          {/* Table Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-on-surface-variant">Đang tải danh sách người dùng...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl mb-2 text-outline/50">group</span>
              <p className="text-sm">Không tìm thấy người dùng nào.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-container-low border-b border-outline-variant hover:bg-surface-container-low">
                    <TableHead className="w-[28%] font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Người dùng
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Email
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Vai trò
                    </TableHead>
                    <TableHead className="font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Ngày tạo
                    </TableHead>
                    <TableHead className="text-right font-bold text-on-surface-variant uppercase tracking-wider text-xs">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-outline-variant">
                  {filteredUsers.map((u) => {
                    const isSelf = currentUserId !== null && u.id === currentUserId;
                    return (
                      <TableRow key={u.id} className="hover:bg-surface-container-lowest transition-colors group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0 border border-outline-variant/30">
                              {getInitials(u.username)}
                            </div>
                            <div>
                              <p className="font-bold text-sm group-hover:text-primary transition-colors">
                                {u.username}
                                {isSelf && (
                                  <span className="ml-2 text-[10px] font-semibold text-primary bg-primary-container/40 px-2 py-0.5 rounded-full align-middle">
                                    Bạn
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-on-surface-variant/70 font-mono mt-0.5">
                                ID: {u.id.slice(0, 8)}...
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm text-on-surface-variant">
                          {u.email}
                        </TableCell>

                        <TableCell>
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getRoleBadge(u.role)}`}>
                            {getRoleLabel(u.role)}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-on-surface-variant">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Chưa rõ'}
                        </TableCell>

                        <TableCell className="text-right space-x-1">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Chỉnh sửa"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-lg transition-all ${
                              isSelf
                                ? 'text-outline/40 cursor-not-allowed'
                                : 'text-on-surface-variant hover:text-error hover:bg-error/10'
                            }`}
                            title={isSelf ? 'Không thể xóa chính bạn' : 'Xóa'}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
            </DialogTitle>
            <DialogDescription>
              {selectedUser
                ? 'Cập nhật thông tin tài khoản, email hoặc thay đổi vai trò của người dùng.'
                : 'Điền thông tin để tạo tài khoản mới. Người dùng có thể đăng nhập ngay sau khi tạo.'}
            </DialogDescription>
          </DialogHeader>
          <UserForm
            initialData={selectedUser}
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
              Xác nhận xóa người dùng
            </DialogTitle>
            <DialogDescription className="pt-2">
              Bạn có chắc chắn muốn xóa người dùng <strong>"{userToDelete?.username}"</strong> không?
              Hành động này sẽ xóa vĩnh viễn tài khoản khỏi cơ sở dữ liệu và không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 border-t border-outline-variant/30">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
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

export default Users;
