export const OrdersPage = () => {
  return (
    <section className="rounded-admin bg-white p-6 shadow-soft ring-1 ring-berry/10">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Đơn hàng</p>
      <h2 className="mt-2 text-2xl font-black text-ink">Quản lý đơn hàng</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        Bước tiếp theo mình sẽ nối bảng orders và order_items, sau đó làm bộ lọc theo trạng thái,
        màn hình chi tiết đơn và nút cập nhật tiến độ xử lý.
      </p>
    </section>
  )
}
