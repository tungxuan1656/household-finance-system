# **Product Overview – Household Finance Web App**

## **1. Tầm nhìn sản phẩm (Vision)**

Xây dựng một công cụ giúp người dùng **ghi chép, hiểu, kiểm soát và tối ưu chi tiêu** trong đời sống hằng ngày.

Sản phẩm phải dùng tốt cho:

* một cá nhân sống một mình
* một cặp vợ chồng
* một gia đình nhiều thành viên

> Cốt lõi là ghi chép chi tiêu rõ ràng. Gia đình là lớp cộng tác thêm vào, không phải điều kiện bắt buộc để dùng sản phẩm.

---

## **2. Định vị (Positioning)**

Một công cụ:

* Đơn giản như app ghi chép chi tiêu cá nhân
* Nhưng mở rộng được thành dashboard tài chính cho gia đình

👉 Khác biệt cốt lõi:

* Dùng được ngay ở chế độ cá nhân
* Khi cần, có thể gắn khoản chi vào household để cả nhà cùng theo dõi
* Group/Event là lớp phân loại độc lập với household
* Không tập trung vào chia tiền, nợ ai, hay split bill
* Tập trung vào:
  * ghi chép đúng
  * theo dõi dòng tiền
  * kiểm soát hành vi chi tiêu
  * tối ưu ngân sách

---

## **3. Đối tượng người dùng (Target Users)**

* Người muốn ghi chép chi tiêu cá nhân hằng ngày
* Cặp vợ chồng muốn theo dõi chi tiêu chung
* Gia đình nhiều thành viên muốn minh bạch khoản chi chung
* Người muốn vừa quản lý tài chính cá nhân, vừa quản lý phần tài chính gia đình

---

## **4. Core Value Proposition**

Ứng dụng giúp trả lời song song hai nhóm câu hỏi:

### **4.1. Ở mức cá nhân**

* Tháng này tôi đã chi bao nhiêu?
* Tôi đang tiêu nhiều nhất vào đâu?
* Tôi có vượt ngân sách cá nhân không?
* Xu hướng chi tiêu của tôi đang tăng hay giảm?

### **4.2. Ở mức gia đình**

* Gia đình đang tiêu bao nhiêu mỗi tháng?
* Các khoản chi chung đang đi vào đâu?
* Gia đình có vượt ngân sách không?
* Thành viên nào đã ghi nhận khoản chi nào?

---

## **5. Core Features**

---

### **5.1. Mô hình khoản chi (Expense Model)**

#### Một khoản chi là gì:

* Một khoản chi là một bản ghi do chính người chi tiêu tạo ra.
* Không có khái niệm tách riêng giữa `người trả tiền` và `người ghi chi tiêu`.
* Trong product model: **ai chi thì người đó ghi**.

#### Mỗi khoản chi bao gồm:

* Số tiền
* Category (chọn từ catalog toàn cục, immutable)
* Nguồn tiền (chọn từ catalog toàn cục, immutable)
* Ghi chú
* Thời gian
* Household tùy chọn
* Group/Event tùy chọn

#### Mô hình reference data:

* Categories và sources là dữ liệu dùng chung cho toàn bộ hệ thống.
* End user không có quyền tạo/sửa/xóa categories hoặc sources.
* Web hiển thị label qua i18n dựa trên stable key thay vì coi tên hiển thị là source of truth.

---

### **5.2. Household là gì**

#### Vai trò của household:

* Household là ngữ cảnh để đánh dấu một khoản chi là **chi cho gia đình**.
* Một khoản chi có thể:
  * không thuộc household nào
  * hoặc thuộc đúng một household

#### Quy tắc hiển thị:

* Nếu khoản chi **không gắn household**:
  * đó là khoản chi cá nhân của người tạo
* Nếu khoản chi **gắn household**:
  * đó là khoản chi của household đó
  * tất cả thành viên trong household đều nhìn thấy

#### Quy tắc sản phẩm:

* Không dùng khái niệm `private/public` như một mode riêng.
* Chỉ có hai trạng thái thực tế:
  * không gắn household
  * có gắn household
* Category không quyết định khoản chi là cá nhân hay gia đình.

---

### **5.3. Group / Event là gì**

#### Vai trò của group:

* Group dùng để gom các khoản chi theo mục đích, sự kiện, hoặc ngữ cảnh.
* Group **không liên quan** đến household.

#### Ví dụ group:

* Đi ăn cưới
* Đi du lịch
* Mua sắm Tết
* Đi ăn nhậu

#### Quy tắc:

* Một khoản chi có thể không thuộc group nào.
* Một khoản chi có thể thuộc một hoặc nhiều group.
* Một khoản chi có thể:
  * thuộc household nhưng không thuộc group
  * thuộc group nhưng không thuộc household
  * thuộc cả household và group cùng lúc

#### Chức năng:

* Tạo/Sửa/Xóa Group
* Gán khoản chi vào Group
* Xem các khoản chi nằm trong một Group
* Xem tổng chi, breakdown category, và ngân sách theo Group

---

### **5.4. Ví dụ nghiệp vụ chuẩn**

* `Đi ăn cưới chị họ 1.000.000`
  * do user tạo
  * có thể gắn vào household của gia đình nhỏ
  * đồng thời gắn vào group `Đi ăn cưới`

* `Đi du lịch`
  * nếu đi một mình: không gắn household
  * nếu là chuyến đi của cả nhà: gắn vào household
  * cả hai trường hợp đều có thể gắn group `Du lịch`

* `Đi cắt tóc`
  * là khoản chi cá nhân thông thường
  * không gắn household
  * không gắn group

---

### **5.5. Household (Gia đình)**

#### Cấu trúc:

* Một user có thể tham gia nhiều household
* Mỗi household là một đơn vị độc lập

#### Trong household:

* Xem toàn bộ khoản chi đã gắn vào household đó
* Biết:
  * Ai đã ghi khoản chi
  * Chi gì
  * Khi nào
  * Thuộc group nào nếu có

---

### **5.6. Role & Permission**

#### Vai trò:

* **Admin**
  * Quản lý thành viên
  * Toàn quyền chỉnh sửa
* **Member**
  * Thêm khoản chi
  * Hạn chế chỉnh sửa/xóa

#### Optional (future-ready):

* Approval flow cho khoản chi lớn

---

### **5.7. Budget Management**

#### Thiết lập:

* Budget theo tháng
* Có thể theo category từ cùng catalog toàn cục
* Có thể theo ngữ cảnh cá nhân, household, hoặc group

#### Theo dõi:

* Planned vs Actual
* Cảnh báo khi vượt ngân sách

👉 Đây là core retention feature

---

### **5.8. Filtering & Search**

* Theo:
  * Ngày / tuần / tháng / khoảng thời gian
  * Category
  * Household
  * Group
* Tìm kiếm:
  * Theo note
  * Theo số tiền
  * Theo tên group / event

---

### **5.9. Insight & Analytics**

#### Bao gồm:

* Tổng chi theo thời gian
* Breakdown theo category dựa trên stable key của catalog toàn cục
* So sánh tháng này vs tháng trước
* Tổng kết theo group
* Dashboard cá nhân
* Dashboard household

#### Highlight:

* Category chi nhiều nhất
* Xu hướng tăng/giảm
* Group nào đang tiêu nhiều nhất

👉 Không cần AI phức tạp. Chỉ cần: đúng, rõ, dễ hiểu.

---

## **6. User Experience Principles**

* **Fast input first**
  * Thêm chi tiêu trong 2–3 giây
* **Mobile-friendly**
* **Low cognitive load**
  * Mặc định không household, không group
  * User chỉ gắn thêm khi cần
* **Single-player usable**
  * Dùng tốt ngay cả khi chưa tạo hay tham gia household nào
* **Personal + Family side by side**
  * Có cả góc nhìn tài chính cá nhân và tài chính gia đình

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

* Auth (Firebase email/password)
* Global static category/source catalogs làm reference data
* CRUD expense:
  * Số tiền
  * Category
  * Nguồn tiền
  * Note
  * Thời gian
  * Household tùy chọn
  * Group/Event tùy chọn
* Household + role (admin/member)
* Grouping (Events/Projects)
* Budget theo tháng
* Basic insight:
  * month comparison
  * category breakdown
  * group summary
  * personal dashboard
  * household dashboard
* Filter & search

Không bao gồm trong core model MVP:

* tách riêng người trả tiền và người ghi chi tiêu
* mode hiển thị private/public như khái niệm sản phẩm chính
* split bill / debt tracking

---

## **9. Những gì KHÔNG làm trong MVP**

* Split bill / debt tracking
* AI insight nâng cao
* Nested household
* Automation phức tạp
* Bank integration

👉 Giữ scope đủ nhỏ để ship nhanh.
