# 🌟 Memory Gallery

**Memory Gallery** là một không gian riêng tư, lãng mạn và đầy tính nghệ thuật được thiết kế dành riêng cho các cặp đôi để lưu giữ những kỷ niệm đẹp nhất. Vượt ra khỏi giới hạn của một ứng dụng lưu trữ ảnh thông thường, Memory Gallery mang đến một trải nghiệm "điện ảnh" với bản đồ hành trình tương tác, hệ thống tự động gửi thư tình và một giao diện hoàn mỹ đến từng chi tiết.

---

## ✨ Tính năng nổi bật (Key Features)

### 🖼️ Thư viện ảnh tương tác (Interactive Gallery)
- Lưu trữ mọi khoảnh khắc đáng nhớ với chất lượng cao.
- Trải nghiệm xem ảnh mượt mà với các hiệu ứng chuyển động (animations) tinh tế.

### 🗺️ Bản đồ Kỷ niệm (Memory Map)
- Tích hợp **Mapbox GL 3D**, cho phép bạn ghim những bức ảnh kỷ niệm vào chính xác tọa độ địa lý nơi nó được chụp.
- Cùng nhau nhìn lại "những nơi đôi ta đã đi qua" trên một bản đồ trực quan và sinh động.

### 💌 Thư tình & Lời nhắc Tự động (Smart Reminders)
- Quản lý các ngày kỷ niệm quan trọng (Sinh nhật, Ngày yêu nhau, Lịch hẹn du lịch...).
- Soạn thảo thư tình với trình soạn thảo văn bản (Rich-text Editor) chuyên nghiệp.
- **Tính năng đặc biệt:** Hệ thống tự động gửi Email (qua Resend) chúc mừng đến người ấy, hoặc tự động gửi email nhắc nhở bạn "chuẩn bị quà" khi sự kiện sắp đến.

### 🔒 Không gian Riêng tư (Private & Secure)
- Hệ thống xác thực bảo mật mạnh mẽ được hỗ trợ bởi **Supabase Auth**.
- Không gian khép kín chỉ dành riêng cho bạn và người ấy, đảm bảo mọi kỷ niệm luôn an toàn và riêng tư tuyệt đối.

### 🎨 Thiết kế Cao cấp (Premium Aesthetics)
- Giao diện người dùng (UI) được chăm chút tỉ mỉ với phong cách hiện đại, hiệu ứng kính (Glassmorphism) và Dark mode.
- Trải nghiệm người dùng (UX) mượt mà với các vi hiệu ứng (micro-animations) được xây dựng bằng **GSAP** và **Motion**.

---

## 🛠️ Công nghệ sử dụng (Tech Stack)

Dự án được xây dựng dựa trên các công nghệ web hiện đại nhất:
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS 
- **Database & Auth:** Supabase (PostgreSQL, Storage, Authentication)
- **Email Service:** Resend API
- **Maps:** Mapbox GL JS & React Map GL
- **Animations:** GSAP & Motion (Framer Motion)
- **Editor:** Quill.js

---

## 🚀 Hướng dẫn cài đặt (Getting Started)

### 1. Yêu cầu hệ thống
- Node.js (phiên bản 18 trở lên)
- Tài khoản Supabase, Mapbox và Resend.

### 2. Cài đặt các biến môi trường
Tạo một file `.env.local` ở thư mục gốc của dự án và điền các thông tin sau:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
RESEND_API_KEY=your_resend_api_key

# Secret key để bảo vệ Cron Job (tự động gửi mail)
CRON_SECRET=your_cron_secret_key
```

### 3. Cài đặt và Khởi chạy
Chạy các lệnh sau trong terminal:

```bash
# Cài đặt các gói thư viện
npm install

# Khởi chạy server ở chế độ phát triển
npm run dev
```

Mở trình duyệt và truy cập vào [http://localhost:3000](http://localhost:3000) để trải nghiệm dự án.

---
*Được phát triển với rất nhiều tình yêu và sự tỉ mỉ. Chúc hai bạn có những kỷ niệm thật tuyệt vời cùng Memory Gallery! ❤️*
