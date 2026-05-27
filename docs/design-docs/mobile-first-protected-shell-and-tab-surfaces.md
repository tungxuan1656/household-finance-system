# Mobile-First Protected Shell and Tab Surfaces

Owner: product + frontend
Update trigger: when protected app shell, top-level navigation, or page wrapper contracts change

## Why this doc exists

This doc locks the next durable UI direction for `apps/web`.

The protected app should feel like one mobile finance app first, then stretch to desktop without changing the mental model.

This version is refined against the approved Stitch screens from project `18281018757123318855`.

## Short summary

- Public auth pages stay as they are.
- After sign-in or sign-up, the protected app enters the Expense surface first.
- Approved source screens currently cover the four main tabs plus the key household and add-expense flows.
- Protected pages use one mobile-first shell:
  - header
  - content
  - bottom-tab navigator on mobile
  - left navigation rail on desktop
- Top-level tabs become:
  - Expense
  - Analysis
  - Household
  - Settings
- `PageShell` and `PageSection` are removed after migration.
- New page wrappers become:
  - `PageContainer`
  - `PageHeader`
  - `PageContent`
  - `PageFooter`
- Existing `components/ui/*` primitives stay unchanged. Wireframes should compose them, not replace them.

## Stitch source of truth

Approved screens reviewed for this doc:

- `da4d4c41662949208812f9b58789617b`: `Chi tiêu - Yellow Finance`
- `597db3ad7f304c079a05a08c5fce0b97`: `Phân tích - Yellow Finance`
- `9e976fd1dee942d7864e5c2647a3a423`: `Gia đình - Yellow Finance`
- `6f585ee3e58946529d20f9f354f113c4`: `Cài đặt - Yellow Finance`
- `d3f226d8dae6400ea2ffe376e4071a35`: `Thêm chi tiêu (B1 - Cập nhật) - Yellow Finance`
- `0873b77d3a94440aad8e51f25277d845`: `Thêm chi tiêu (B2) - Yellow Finance`
- `a6228976644f45058f7c00015abaa0eb`: `Thêm chi tiêu (B3 - Cập nhật) - Yellow Finance`
- `bff23f40b541436487ab7927f156e195`: `Thêm gia đình mới - Yellow Finance`
- `fc3e3c16d8bb4959a5321d6755cc52b8`: `Danh sách Gia đình (Cập nhật) - Yellow Finance`
- `602985f82c40456da8164dbc23441993`: `Chi tiết Gia đình - Yellow Finance`

## Visual direction from current screens

The current approved visual language is not generic shadcn-default.

It already implies these durable rules:

- dark-first warm finance theme
- yellow/gold primary accent
- large pill and rounded-card shapes
- compact mobile width with strong vertical rhythm
- mono styling for money values
- one dominant primary action per screen

Desktop adaptation should preserve this mobile composition and only relocate navigation.

## Core direction

### 1. One protected shell, two nav surfaces

Route shape stays:

`public route -> protected auth/session gate -> protected shell layout -> page surface`

Rules:

- Public auth routes stay outside the protected shell.
- Protected routes stay inside one layout that still owns:
  - auth session coordination
  - desktop navigation rail
  - mobile bottom-tab navigator
  - global drawers/sheets/dialogs
- The shell must use one shared route source for both desktop and mobile navigation.

### 2. Mobile is the base product shape

Protected pages should read like a native mobile app:

- sticky page header at top
- content area in the middle
- bottom-tab navigator at the bottom

Desktop does not invent a second app structure.

Desktop keeps:

- the same header behavior
- the same page content shape
- the same route model

Desktop only moves the primary navigation to the far-left rail, similar to Instagram.

## Protected layout model

### Mobile

- Header stays at top.
- Content scrolls under the header.
- Bottom-tab navigator is fixed at viewport bottom.
- Shell reserves safe bottom space so tabs never cover content or footer actions.
- Main-tab labels stay:
  - `Expense`
  - `Analysis`
  - `Household`
  - `Settings`

### Desktop

- Far-left rail replaces the mobile bottom-tab navigator.
- Main page column stays centered.
- Header and content remain in the center column.
- Page width stays constrained so screens still feel app-like, not dashboard-sprawl.
- Floating actions and bottom drawers still anchor to the center content column, not the full desktop viewport.

## Page wrapper contract

These wrappers replace `PageShell` and `PageSection`.

### `PageContainer`

Purpose:

- top-level page frame inside the protected shell
- vertical composition for one surface
- safe spacing between header, content, and footer

Rules:

- owns page-level min height and bottom spacing
- does not own auth or navigation
- does not impose card/list styling opinions

### `PageHeader`

Purpose:

- page title
- subtitle/summary
- back affordance when needed
- trailing actions when needed

Rules:

- same contract on mobile and desktop
- no duplicate route title outside this component
- can be sticky when the surface needs it

### `PageContent`

Purpose:

- primary page body
- sections, lists, charts, forms, empty states

Rules:

- owns page body spacing
- stays neutral
- composes existing `components/ui/*` primitives and feature components

### `PageFooter`

Purpose:

- action area at the end of a page
- usually submit/save/destructive actions

Rules:

- optional
- separate from the bottom-tab navigator
- may be sticky inside the page surface if the flow needs persistent actions

## Keep layout components, remove page-shell opinions

Keep a layout layer for:

- sidebar vs bottom-tab switching
- protected session gating
- global drawer/sheet mounting

Do not keep old page-shell/page-section abstractions.

The new rule is:

- layout components handle app chrome
- page wrapper components handle page structure
- feature components handle page-specific UI
- shadcn primitives handle base UI building blocks

## Top-level tab model

Only four top-level tabs remain in the protected app.

### Expense

This is the first protected surface after auth.

Purpose:

- show current balance and budget status
- show expense timeline clearly
- make expense capture fast

UI direction:

- top summary card shows:
  - current month balance
  - remaining budget
  - budget progress bar
- filter chips sit under the summary card
- expense list stays in timeline order with date dividers such as `Today` and `Yesterday`
- labels distinguish:
  - personal expense
  - household expense
  - group/event expense when relevant
- income rows are visually distinct with positive green value styling
- the primary add action is a floating `+` button above the bottom-tab bar

Primary action:

- open the add-expense bottom drawer flow

### Analysis

Purpose:

- explain spending distribution
- compare current month with previous month

UI direction:

- segmented time filters at top:
  - `Tháng này`
  - `Theo tuần`
  - `Hôm nay`
- pie chart for allocation
- a compare card summarizes month-over-month delta
- one breakdown section compares `Nhóm của tôi`, `Gia đình`, and other key buckets
- one ranked list highlights top categories with a detail drill-down affordance
- stronger hierarchy, fewer but denser cards than the old analytics dashboard

### Household

Purpose:

- manage shared family contexts
- make shared spending transparent

Surface set:

- Household List
- Add Household
- Household Details

Current screen direction:

- Household List uses household cards first, recent activity second
- header area includes lightweight utility actions and a quick add button
- household cards show member count, financial snapshot, progress bar, and member avatars
- a secondary list variant also exists with a dedicated `Tạo gia đình mới` stub card

### Settings

Purpose:

- manage personal profile
- manage system-level setup

This tab owns:

- profile
- budget settings
- group/event settings
- system settings

Current screen direction:

- profile hero card at top
- management section for:
  - group management
  - household management
  - budget setup
- personal section for account info and sign-out
- settings stays utility-first, not dashboard-like

Budgets and groups are no longer top-level tabs.

They stay reachable as pages/tools under Settings or from contextual actions.

## Expense capture flow

Expense creation becomes one 3-step bottom drawer flow for Yellow Finance.

It should open from shell-level actions and feel native on mobile.

### Step 1: Choose category

- date selector sits above the category area
- category picker uses a clear icon grid
- search field helps fast lookup
- categories are icon-first pills/tiles, not a plain select
- the current approved set includes visible core items such as:
  - `Ăn uống`
  - `Di chuyển`
  - `Mua sắm`
  - `Nhà ở`
  - `Sức khỏe`
  - `Hóa đơn`
  - `Giải trí`
  - `Giáo dục`
  - `Gia đình`
  - `Quà tặng`
  - `Du lịch`
- the drawer keeps a strong primary `Tiếp tục` action at the bottom

### Step 2: Smart entry

- focus on amount and note
- quick amount suggestions like `35k`, `45k`
- the chosen category stays visible as a compact chip in the header area
- the amount field is the visual focal point of the step
- source selection is part of this step, not postponed
- current source options in the approved screen are:
  - `Tiền mặt`
  - `Ngân hàng`
  - `Ví điện tử`
- note tags adapt to the chosen category
- example tags:
  - `Cơm`
  - `Bún bò`
- current screen also shows `Cà phê`
- footer uses two clear actions:
  - `Quay lại`
  - `Tiếp tục`

### Step 3: Advanced context

- assign optional household context
- assign optional group/event context
- step summary repeats chosen category and amount at the top
- household and group rows are simple drill-in selectors with current state text such as `Không thuộc gia đình`
- footer uses:
  - `Quay lại`
  - `Hoàn thành`

This stays aligned with product direction v2:

- household is optional
- group/event is optional
- household and group/event stay independent axes

## Household surfaces

### Household List

- shows households the user belongs to
- each card gives quick context:
  - member count
  - remaining budget or current-month spend
- progress/budget meter
- visible member avatar stack
- fast header action to add a new household
- recent activity feed sits below the household cards on the main variant

### Add Household

- simple bottom sheet
- fields:
  - name
  - description
- sheet header includes explicit dismiss control
- current approved sheet also shows an initial-member preview row for the current user
- primary action stays a single bottom CTA: `Tạo gia đình`

### Household Details

- top area shows back navigation, centered household identity, and member count
- member list with roles
- invite member action lives inside the members section
- recent household spending activity sits in its own card/section
- delete household action for admins only
- destructive area stays visually prominent in warning red

## Routing implications

- Protected default entry should move from the old home/overview-first model to the Expense surface.
- Existing deeper routes can stay, but they are secondary flows, not top-level tabs.
- Analysis, Household, and Settings remain top-level surfaces.
- Budget and group/event management move under Settings and contextual drill-down flows.
- The current Stitch screens do not justify keeping `Overview/Home` as a separate top-level tab.

## Non-goals

- no auth page redesign in this decision
- no backend or domain contract change in this decision
- no custom replacement of current shadcn primitives
- no wireframe-specific visual skin yet

## Migration rules

When implementation starts:

1. Create the new shell-safe page wrappers first.
2. Move navigation to the 4-tab route model.
3. Switch protected default entry to Expense.
4. Rebuild the four tab surfaces to match the approved Stitch composition before polishing secondary routes.
5. Delete `page-shell.tsx` and `PageSection` only after all protected pages stop depending on them.

## Follow-up artifact

This design doc should be converted into one ExecPlan before code refactor starts.
