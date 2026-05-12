# 🏛️ Master Design System Specification: Minimal Glassmorphism (V2.1)

> **Mục tiêu:** Thiết lập bộ quy tắc cốt lõi (Core Rules) về thẩm mỹ, không gian và cấu trúc cho toàn bộ hệ thống tài chính.

---

## 1. Hệ thống Màu sắc (Color Logic - OKLCH)

Chúng ta sử dụng không gian màu OKLCH để kiểm soát độ sáng (L) và độ bão hòa (C) một cách khoa học, giúp giao diện không bị xỉn màu trên các tấm nền OLED/LCD.

| Token | Giá trị Dark Mode (Chủ đạo) | Giá trị Light Mode | Mục đích sử dụng |
| --- | --- | --- | --- |
| `--background` | `oklch(0.14 0.02 250)` | `oklch(0.98 0.01 250)` | Nền tảng thấp nhất (Midnight Slate). |
| `--card` | `oklch(0.20 0.03 250 / 0.65)` | `oklch(1 0 0 / 0.8)` | Các khối nội dung (Glass Layer). |
| `--primary` | `oklch(0.70 0.15 250)` | `oklch(0.60 0.18 250)` | Màu thương hiệu Maia Blue. |
| `--border` | `oklch(1 0 0 / 0.1)` | `oklch(0 0 0 / 0.08)` | Viền mỏng như sợi tóc (Hairline border). |
| `--foreground` | `oklch(0.98 0.01 250)` | `oklch(0.25 0.02 250)` | Chữ nội dung chính. |
| `--muted` | `oklch(0.85 0.02 250 / 0.6)` | `oklch(0.4 0.02 250)` | Chữ phụ, caption. |

---

## 2. Giải phẫu của Lớp Kính (Anatomy of Glass)

Mọi component dạng khối (Card, Popover, Dialog) phải tuân thủ quy tắc **"The Triple Layer"**:

1. **Lớp nền (Backdrop):** Phải có `backdrop-blur-xl` (tối thiểu 24px) để làm nhòe các phần tử bên dưới.
2. **Độ trong suốt (Opacity):** Màu nền của Card không được đặc (Solid), luôn ở mức `65% - 80%`.
3. **Viền phản xạ (Edge Highlight):** Sử dụng `border` mỏng với độ đục thấp để giả lập ánh sáng phản chiếu trên cạnh kính.

---

## 3. Hình khối & Bề mặt (Shapes & Surfaces)

### 3.1 Quy chuẩn Bo góc (Radius)

Áp dụng tính nhất quán từ lớn đến nhỏ theo tỷ lệ vàng:

* **Page Card / Container chính:** `1.5rem` (24px).
* **Interactive Elements (Button, Input, Inner Card):** `0.75rem` (12px).
* **Small Elements (Checkbox, Tag, Badge):** `0.375rem` (6px).

### 3.2 Quy chuẩn Đổ bóng (Shadow System)

Sử dụng đổ bóng đa lớp để tạo cảm giác vật thể đang lơ lửng thực sự (Floating UI):

* **Shadow-Glass:** * Lớp 1 (Sát cạnh): `0 0 0 1px oklch(1 0 0 / 0.05)` (Giả lập độ dày kính).
* Lớp 2 (Tán xạ): `0 20px 40px -12px rgba(0, 0, 0, 0.4)`.



---

## 4. Hệ thống Typography (The Typography)

### 4.1 Phông chữ (Typefaces)

* **UI Text:** Sử dụng font không chân hiện đại (Geist, Inter hoặc San Francisco).
* **Financial Data:** **BẮT BUỘC** sử dụng font Monospace (JetBrains Mono hoặc Roboto Mono) cho toàn bộ số tiền.
* *Lý do:* Để các con số luôn thẳng hàng khi nằm trong danh sách dọc, giúp người dùng so sánh nhanh.



### 4.2 Cấu trúc phân cấp

* **Title (H1, H2):** `Font-bold`, `tracking-tighter`, `text-foreground`.
* **Amount (Số tiền):** `Font-semibold`, `tabular-nums`.
* **Label/Caption:** `Font-medium`, `text-muted-foreground`, `text-xs/sm`.

---

## 5. Quy tắc Khoảng cách (The Spacing & Grid)

Khoảng cách phải được quy định chặt chẽ để tạo sự "thoáng đạt" (Airy Design).

| Vị trí | Mobile (375px - 640px) | Web/Desktop (> 1024px) |
| --- | --- | --- |
| **Page Margin (Lề trang)** | `1rem` (16px) | `2.5rem` (40px) |
| **Section Gap (Giữa các khối)** | `1.5rem` (24px) | `3rem` (48px) |
| **Card Padding (Trong thẻ)** | `1.25rem` (20px) | `1.5rem` (24px) |
| **Element Gap (Trong Card)** | `0.75rem` (12px) | `1rem` (16px) |

---

## 6. Chỉ dẫn Triển khai Hệ thống (Implementation Rules)

### 6.1 Tệp `index.css`

AI Agent cần cập nhật lại các biến môi trường tại đây làm gốc. Không được hard-code mã màu hex trong các component riêng lẻ.

### 6.2 Base Components Refactor

* **Card.tsx:** Phải bao gồm mặc định các class Tailwind: `bg-card/65 backdrop-blur-xl border border-white/10 shadow-glass`.
* **Button.tsx:** Sử dụng `hover:brightness-110` và `active:scale-95` để tạo cảm giác tương tác vật lý.
* **Separator.tsx:** Sử dụng màu `oklch(1 0 0 / 0.05)` thay vì xám đậm để không ngắt quãng thị giác quá mạnh.

---

### 7. Tóm tắt cho AI Agent:

> "Bạn là một chuyên gia Frontend Senior. Hãy sử dụng tài liệu thiết kế này làm kim chỉ nam. Mọi component bạn tạo ra hoặc refactor phải tuân thủ đúng bảng màu OKLCH, quy tắc bo góc 24px cho card, và sử dụng font Mono cho số liệu tài chính. Tuyệt đối không sử dụng màu đen tuyền `#000000`, hãy dùng Midnight Slate làm nền để hiệu ứng kính mờ được tỏa sáng."
