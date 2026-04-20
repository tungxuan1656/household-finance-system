# **Product Overview – Household Finance Web App**

## **1. Tầm nhìn sản phẩm (Vision)**

Xây dựng một nền tảng giúp các gia đình **hiểu, kiểm soát và tối ưu dòng tiền chung**, thông qua việc ghi nhận chi tiêu minh bạch, theo dõi ngân sách và cung cấp insight dễ hiểu.

> Không phải để “chia tiền”, mà để **quản lý tài chính cùng nhau**.

---

## **2. Định vị (Positioning)**

Một công cụ:

* Đơn giản như app ghi chép chi tiêu
* Nhưng mạnh như một **dashboard tài chính gia đình**

👉 Khác biệt cốt lõi:

* **Family-first (household-centric)**, không phải cá nhân-first
* Không tập trung vào “ai nợ ai”
* Mà tập trung vào:

  * dòng tiền
  * hành vi chi tiêu
  * kiểm soát ngân sách

---

## **3. Đối tượng người dùng (Target Users)**

* Vợ chồng quản lý tài chính chung
* Gia đình nhiều thế hệ
* Người muốn kiểm soát chi tiêu gia đình thay vì cá nhân

---

## **4. Core Value Proposition**

Ứng dụng giúp trả lời các câu hỏi quan trọng:

* Gia đình đang tiêu bao nhiêu mỗi tháng?
* Tiền đang đi vào đâu?
* Có vượt ngân sách không?
* Xu hướng chi tiêu đang tăng hay giảm?
* Ai đang đóng góp chính về tài chính?

---

## **5. Core Features**

---

### **5.1. Quản lý chi tiêu (Expense Tracking)**

#### Mỗi khoản chi bao gồm:

* Số tiền
* Category (ăn uống, sinh hoạt, giáo dục...)
* Nguồn tiền (tiền mặt, tài khoản...)
* Ghi chú
* Thời gian

#### Ownership model:

* **Creator**: người nhập
* **Payer**: người trả tiền (có thể khác creator)

---

### **5.2. Phân loại chi tiêu: Cá nhân vs Gia đình**

* Mỗi expense có thể là:

  * **Cá nhân (private)** → chỉ mình thấy
  * **Gia đình (household)** → shared trong group

👉 Đảm bảo:

* Minh bạch khi cần
* Riêng tư khi cần

---

### **5.3. Household (Gia đình)**

#### Cấu trúc:

* Một user có thể tham gia nhiều household
* Mỗi household là một đơn vị độc lập

#### Trong household:

* Xem toàn bộ chi tiêu chung
* Biết:

  * Ai chi
  * Chi gì
  * Khi nào

---

### **5.4. Role & Permission**

#### Vai trò:

* **Admin**

  * Quản lý thành viên
  * Toàn quyền chỉnh sửa
* **Member**

  * Thêm chi tiêu
  * Hạn chế chỉnh sửa/xóa

#### Optional (future-ready):

* Approval flow cho khoản chi lớn

---

### **5.5. Budget Management (Trọng tâm giữ user)**

#### Thiết lập:

* Budget theo tháng
* Có thể theo category

#### Theo dõi:

* Planned vs Actual
* Cảnh báo khi vượt ngân sách

👉 Đây là core retention feature

---

### **5.6. Filtering & Search**

* Theo:

  * Ngày / tuần / tháng / khoảng thời gian
  * Category
  * Người chi (payer)
* Tìm kiếm:

  * Theo note
  * Theo số tiền
  * Theo Group (Event/Project)

---

### **5.7. Nhóm chi tiêu (Grouping / Events)**

#### Khái niệm:
* Gom nhóm các khoản chi theo sự kiện (Du lịch, Đám cưới, Mua sắm Tết...)
* Theo dõi ngân sách riêng cho từng nhóm.

#### Chức năng:
* Tạo/Sửa/Xóa Group.
* Gán khoản chi vào một hoặc nhiều Group.
* Xem báo cáo tổng kết theo Group.

---

### **5.8. Insight & Analytics (Mức cơ bản – đúng trọng tâm)**

#### Bao gồm:

* Tổng chi theo thời gian
* Breakdown theo category
* So sánh:

  * Tháng này vs tháng trước

#### Highlight:

* Category chi nhiều nhất
* Xu hướng tăng/giảm

👉 Không cần AI phức tạp, chỉ cần:

> đúng – rõ – dễ hiểu

---

## **6. User Experience Principles**

* **Fast input first**

  * Thêm chi tiêu trong 2–3 giây
* **Mobile-friendly (dù là web app)**
* **Low cognitive load**

  * Ít lựa chọn, default hợp lý
* **Single-player usable**

  * Dùng tốt ngay cả khi chưa mời family

---

## **7. Authentication & Identity**

### Đăng nhập:

* Firebase (email/password) — MVP; future: Google / Supabase

### Flow:


1. User signs up/signs in via Firebase Authentication (email/password) on the frontend.
2. Frontend sends the Firebase ID token to the backend.
3. Backend:

  * Verifies the Firebase ID token (e.g., Firebase Admin SDK) and maps/creates a local user record.
  * Issues an application `access token` (short-lived) and a `refresh token` (longer-lived) for the client.
4. Quản lý profile tại hệ thống riêng

---

## **8. MVP Scope (Lean nhưng usable)**

Bao gồm:

* Auth (Google)
 - Auth (Firebase email/password)
* CRUD expense (Số tiền, Category, Nguồn tiền, Group, Payer, Creator, Visibility)
* Cá nhân vs household
* Household + role (admin/member)
* Payer vs creator
* Budget theo tháng
* Grouping (Events/Projects)
* Basic insight (month comparison, category breakdown, group summary)
* Filter & search

---

## **9. Những gì KHÔNG làm trong MVP**

* Split bill / debt tracking
* AI insight nâng cao
* Nested household
* Automation phức tạp
* Bank integration

👉 Giữ scope đủ nhỏ để ship nhanh

---

## **10. Roadmap (Sau MVP)**

### Phase 2:

* Recurring expense
* Smart suggestion category
* Notification (vượt budget)

### Phase 3:

* Advanced insight
* Financial health score
* Multi-device optimization

---

## **11. Điểm khác biệt (USP)**

* Không phải:

  * app ghi chép cá nhân đơn thuần
  * cũng không phải app chia tiền

👉 Mà là:

> **“Nguồn sự thật duy nhất (single source of truth) cho tài chính gia đình”**

---

## **12. Kết luận**

Sản phẩm này:

* Không chạy theo fintech phức tạp
* Mà tập trung vào:

  * hành vi thực tế
  * nhu cầu rất đời

👉 Nếu làm đúng:

* UX cực đơn giản
* Budget + insight rõ ràng
* Family model hợp lý

→ có thể trở thành:

> **công cụ quản lý tài chính gia đình hàng ngày**
