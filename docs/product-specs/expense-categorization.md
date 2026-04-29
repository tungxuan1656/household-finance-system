# Expense Categorization

## Goal

Provide clear, maintainable categorization for expenses to power budgets and analytics.

## Entry Conditions

- User creates or edits an expense and selects a category.

## Reference Data Model

- Categories are global reference data shared by all users and households.
- The category catalog is immutable for end users; only a system administrator may change it through code updates or explicit DB-migration work.
- The source of truth is a checked-in catalog in application code. API responses are derived from that catalog, not from household-owned records.
- Categories are not tied to household membership, household settings, recent usage, or personal defaults.

## API Contract

- `GET /api/v1/categories`
  - Public static reference-data endpoint.
  - Safe to cache aggressively because the catalog changes rarely.
  - Each item exposes only stable machine-readable metadata:
    - `key`
    - `kind`
    - `iconUrl`
    - `color`
- `GET /api/v1/sources`
  - Public static reference-data endpoint.
  - Safe to cache aggressively.
  - Each item exposes a stable source key.
- API payloads do not treat display labels as the source of truth. Web maps labels from i18n using the stable `key`.

## Canonical Categories

- `food` (`expense`) — Ăn uống
- `transport` (`expense`) — Xe cộ
- `dating` (`expense`) — Tình yêu
- `living-costs` (`expense`) — Sinh hoạt phí
- `family` (`expense`) — Gia đình
- `children` (`expense`) — Con cái
- `relatives` (`expense`) — Họ hàng
- `shopping` (`expense`) — Mua sắm
- `beauty` (`expense`) — Làm đẹp
- `health` (`expense`) — Sức khoẻ
- `social` (`expense`) — Xã giao
- `repairs` (`expense`) — Sửa chữa
- `work` (`expense`) — Công việc
- `education` (`expense`) — Học tập
- `investment` (`expense`) — Đầu tư
- `self-development` (`expense`) — Phát triển
- `sports` (`expense`) — Thể thao
- `travel` (`expense`) — Du lịch
- `hobbies` (`expense`) — Sở thích
- `pets` (`expense`) — Vật nuôi
- `money-in` (`income`) — Nhận tiền
- `lending` (`transfer`) — Cho vay
- `charity` (`expense`) — Từ thiện
- `other` (`expense`) — Khác

## Canonical Sources

- `cash`
- `bank-transfer`
- `card`
- `e-wallet`
- `other`

## User Flow

1. Category picker loads the same global static catalog for every user and household.
2. Expense create/edit flows only allow categories whose catalog `kind` is `expense`.
3. Frontend renders the label through i18n and uses API metadata only for stable key, icon, and color.
4. Future income or transfer flows may reuse the same mixed catalog without redefining product truth.

## Acceptance Criteria

- Categories are global and immutable for end users.
- The same canonical keys are returned to all callers.
- Pickers and downstream flows treat `key` as the canonical identifier.
- Web resolves labels from i18n instead of storing display names as the source of truth.

## Failure States

- Static catalog endpoint unavailable: show a clear loading/error state and allow retry.
- Unknown category key in stored expense data: surface a safe fallback label/icon and log for investigation.

---

Notes:
- Avoid ML in MVP; keep categorization manual with later auto-suggestion in Phase 2.
- Historical implementation note: the current DB migration still contains a household-scoped `expense_categories` table. That is a legacy mismatch and not the current product truth.
