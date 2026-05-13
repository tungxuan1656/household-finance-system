# Shadcn-style UI Composition System

## Purpose

This document defines the structural composition system commonly used in modern shadcn/ui-inspired SaaS dashboards and applications.

It focuses on:

* card composition
* component arrangement
* layout hierarchy
* interaction grouping
* feature mapping
* dashboard architecture
* AI generation rules

It does NOT describe:

* typography
* colors
* themes
* shadows
* aesthetics

The goal is to create a reusable interface grammar that both humans and AI agents can use consistently.

---

# 1. Core Principles

## 1.1 Modular Interface

Interfaces are built from independent functional cards.

Each card should:

* solve one primary task
* remain reusable
* communicate clear intent
* function independently

Examples:

| Purpose          | Card Type      |
| ---------------- | -------------- |
| View metrics     | Analytics Card |
| Submit data      | Form Card      |
| Execute action   | Action Card    |
| Track progress   | Progress Card  |
| Configure state  | Settings Card  |
| Summarize status | Summary Card   |

---

## 1.2 One Primary Intent Per Card

Avoid mixing unrelated purposes.

Bad:

* analytics + onboarding + settings

Good:

* one dominant interaction
* one workflow surface
* one semantic purpose

---

## 1.3 Vertical Composition

Most cards follow:

Header
↓
Context
↓
Primary Interaction
↓
Secondary Controls
↓
Actions
↓
Metadata

This creates predictable scanning.

---

# 2. Card Anatomy

## 2.1 Standard Zones

| Zone           | Purpose                  |
| -------------- | ------------------------ |
| Header         | Title, status, identity  |
| Context        | Description, helper text |
| Primary Zone   | Main interaction/content |
| Secondary Zone | Supporting controls      |
| Action Zone    | CTA actions              |
| Footer         | Metadata, support info   |

---

## 2.2 Header Rules

Header may contain:

* title
* badge
* state
* filter
* menu
* status

Patterns:

### Left-weighted

Used for:

* forms
* analytics
* settings

### Split Header

Used when:

* quick actions matter
* state visibility matters

Example:

Title                 Status / Action
Description           Meta

---

## 2.3 Primary Zone

Contains the dominant interaction.

Examples:

* chart
* upload area
* form group
* metric
* onboarding block
* progress visualization

Rules:

* only one dominant focus
* receives most spacing
* highest hierarchy

---

## 2.4 Secondary Zone

Contains:

* filters
* toggles
* dropdowns
* chips
* helper actions

Rules:

* grouped semantically
* lower emphasis
* compact layout

---

## 2.5 Action Zone

Contains:

* submit
* confirm
* continue
* execute actions

Patterns:

### Full-width CTA

Used for:

* onboarding
* workflows
* forms
* transactions

### Split Actions

Used for:

* save/cancel
* destructive actions
* branching workflows

---

# 3. Layout Patterns

## 3.1 Stacked Layout

Most common.

Structure:

Header
↓
Description
↓
Inputs / Visualization
↓
Actions

Used for:

* forms
* uploads
* onboarding
* settings

---

## 3.2 Split Metrics Layout

Used for:

* analytics
* financial summaries
* progress tracking

Structure:

Metric
Visualization
Supporting Metrics
CTA

---

## 3.3 Embedded Card Layout

Cards may contain sub-cards.

Purpose:

* isolate sections
* reduce complexity
* create semantic grouping

Examples:

* savings goals
* warning panels
* onboarding states

---

## 3.4 Utility Strip

Horizontal grouped controls.

Examples:

* icon rows
* segmented controls
* tabs
* variant selectors

Rules:

* equal spacing
* consistent sizing
* grouped frequency

---

# 4. Composition Rules

## 4.1 Action Locality

Actions should remain near their related context.

Good:

* upload button inside upload card
* chart filters inside chart card
* toggle beside setting

---

## 4.2 Functional Grouping

Group controls by semantic purpose.

Examples:

Scheduling:

* date
* time
* availability
* confirm

Financial:

* amount
* account
* payment
* confirmation

Security:

* password
* verification
* danger zone

---

## 4.3 Progressive Density

Cards should increase density gradually.

Typical flow:

Context
↓
Interaction
↓
Dense Information
↓
Focused Actions

---

## 4.4 Hierarchical Weight

Importance determines:

* card size
* spacing
* grouping
* alignment
* isolation

Large:

* charts
* onboarding
* workflows

Small:

* filters
* toggles
* metadata
* shortcuts

---

# 5. Component Arrangement Patterns

## 5.1 Inline Pairing

Used for related inputs.

Examples:

* city / state
* zip / country
* severity / component

---

## 5.2 Segmented Rows

Used for:

* tabs
* variants
* modes
* role selection

Purpose:

* localized context switching

---

## 5.3 Embedded Status

Status should live near its affected interaction.

Examples:

* Pending
* Locked
* Warning
* Live

---

## 5.4 Nested Actions

Primary actions:

* larger
* isolated
* bottom aligned

Secondary actions:

* inline
* grouped
* lower emphasis

---

# 6. Widget Taxonomy

## Analytics Widget

Contains:

* chart
* metrics
* filters
* CTA

Examples:

* browser share
* analytics overview
* contribution history

---

## Form Widget

Contains:

* field groups
* validation
* confirmation actions

Examples:

* shipping address
* transfer funds
* payout threshold

---

## Action Widget

Purpose:

* execute one primary action

Examples:

* connect bank
* invite members
* upload files

---

## Progress Widget

Purpose:

* communicate completion
* motivate continuation

Examples:

* savings goals
* sleep report
* fitness summary

---

## Summary Widget

Purpose:

* fast scanning
* low interaction

Examples:

* balance
* payment due
* invoice summary

---

# 7. Feature → Layout Mapping

| Feature           | Recommended Layout       |
| ----------------- | ------------------------ |
| Analytics         | Split Metrics Layout     |
| Upload            | Stacked Layout           |
| Security          | Dense Form Layout        |
| Team Management   | Nested Action Layout     |
| Billing           | Summary + CTA            |
| Monitoring        | Visualization Card       |
| Settings          | Utility Form Layout      |
| Scheduling        | Selection + Confirmation |
| Progress Tracking | Progress Widget          |

---

# 8. Dashboard-Level Rules

## 8.1 Dashboard as Ecosystem

A dashboard is:

* not a random card collection
* but a coordinated system of workflow surfaces

Each card should:

* support surrounding context
* maintain independent utility
* contribute to overall workflow

---

## 8.2 Size Reflects Importance

Large cards:

* analytics
* workflows
* onboarding

Small cards:

* utilities
* shortcuts
* summaries

---

## 8.3 Avoid Equal Weight Everywhere

Not every card should compete equally.

Good dashboards create:

* rhythm
* pacing
* scan hierarchy
* focus

---

# 9. AI Agent Generation Protocol

## 9.1 Required Inputs

An AI agent should receive:

### A. Component Inventory

Example:

* Card
* Button
* Input
* Select
* Tabs
* Dialog
* Badge
* Table
* Chart
* Progress
* DropdownMenu
* Accordion

Including:

* available variants
* usage constraints
* interaction priority

---

### B. Design Preset

Project-level tokens:

* spacing scale
* radius scale
* typography scale
* theme mode
* sizing conventions

The AI should NOT invent new visual systems.

---

### C. Composition Rules

This document.

Defines:

* hierarchy
* grouping
* layout patterns
* workflow mapping
* card structure

---

### D. Page Intent

Example:

"Billing dashboard for SaaS users"

"Security settings page"

"AI workflow management panel"

The AI should infer:

* user tasks
* required widgets
* layout priority
* interaction density

---

# 10. AI Page Generation Rules

## 10.1 Generate Pages as Functional Systems

Pages should contain:

* primary workflow
* supporting widgets
* contextual actions
* summaries
* operational tools

NOT random cards.

---

## 10.2 Map Features to Known Patterns

Examples:

Billing:

* usage summary
* invoices
* payment method
* plan controls

Analytics:

* charts
* filters
* metrics
* export actions

Settings:

* grouped forms
* section cards
* save/cancel zones

---

## 10.3 Respect Interaction Hierarchy

Priority order:

Primary Workflow
↓
Supporting Context
↓
Secondary Actions
↓
Metadata

---

## 10.4 Use Existing Components Only

The AI should:

* compose
* arrange
* structure
* reuse

NOT invent arbitrary components.

---

# 11. Final Mental Model

This system treats interfaces as:

* composable operational surfaces
* modular workflow tools
* vertically structured interaction systems

The design language prioritizes:

* workflow clarity
* scan efficiency
* composability
* contextual actions
* reusable interaction patterns

The result is an interface system optimized for:

* SaaS dashboards
* AI tools
* developer platforms
* operational products
* modular applications
