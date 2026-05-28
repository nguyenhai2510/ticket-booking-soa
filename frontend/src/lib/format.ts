export function formatEventDate(iso: string | undefined): string {
  if (!iso) return 'Chưa cập nhật';
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}đ`;
}
