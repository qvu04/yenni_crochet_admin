# Yenni Crochet Admin

Admin dashboard riêng cho Yenni Crochet. Repo này dùng để quản lý đơn hàng, sản phẩm, đặt riêng, voucher và dashboard vận hành shop.

## Stack

- React + Vite + TypeScript
- Tailwind CSS
- Supabase
- React Query
- React Router
- React Hook Form + Zod

## Setup

Copy env mẫu:

```bash
cp .env.example .env.local
```

Điền Supabase project URL và anon key vào `.env.local`.

Chạy local:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## MVP Admin

- Dashboard tổng quan
- Quản lý đơn hàng
- Quản lý sản phẩm và biến thể
- Quản lý yêu cầu đặt riêng

Các thao tác admin nhạy cảm sẽ được nối với Supabase Auth, RLS, RPC hoặc Edge Function ở các bước tiếp theo.
