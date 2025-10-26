# Design Guidelines: X Video Upload Application

## Design Approach

**Selected Approach:** Design System - Linear + Stripe Hybrid
- **Justification:** Developer-focused tool requiring clarity, efficiency, and excellent documentation presentation
- **Key Principles:** 
  - Information hierarchy through typography and spacing
  - Scannable layouts for quick status checks
  - Clean, professional aesthetic that builds trust
  - Minimal animations to maintain focus on content

## Core Design Elements

### Typography System

**Font Families:**
- Primary: Inter (via Google Fonts CDN)
- Monospace: JetBrains Mono (for code snippets, API endpoints)

**Type Scale:**
- Page Titles: text-3xl font-semibold (Dashboard, Authentication, API Docs headers)
- Section Headers: text-xl font-semibold
- Subsection Headers: text-lg font-medium
- Body Text: text-base font-normal
- Secondary Text: text-sm (timestamps, metadata)
- Code/Endpoints: text-sm font-mono
- Captions: text-xs

### Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-6
- Section spacing: space-y-6
- Card padding: p-6
- Table cell padding: p-4
- Button padding: px-6 py-2
- Input padding: px-4 py-2

**Grid Structure:**
- Container: max-w-7xl mx-auto px-6
- Dashboard grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 for stats cards
- Responsive breakpoints: mobile-first, md (768px), lg (1024px)

## Component Library

### Navigation
- **Top Navigation Bar:**
  - Height: h-16
  - Three tabs: Dashboard, Authentication, API Documentation
  - Tab spacing: px-6 py-4
  - Active tab indicator: bottom border (border-b-2)
  - Icons from Heroicons (via CDN): ChartBarIcon, KeyIcon, DocumentTextIcon

### Dashboard Tab

**Stats Overview Section:**
- Grid of 3 cards (responsive: single column mobile, 3 columns desktop)
- Each card: rounded-lg border with p-6
- Card content: Large number (text-3xl font-bold), label (text-sm)
- Metrics: Total Uploads, Successful, Failed

**Upload History Table:**
- Full-width table with alternating row treatment
- Columns: Status (icon + text), Video Title, Description (truncated), Uploaded At, Actions
- Status indicators: 
  - Success: CheckCircleIcon
  - Failed: XCircleIcon
  - Processing: Clock icon with subtle rotating animation
- Row spacing: py-4
- Pagination controls at bottom: Previous/Next buttons

**Empty State:**
- Centered content when no uploads exist
- Icon (CloudArrowUpIcon) at large size
- Heading: "No uploads yet"
- Subtext with upload endpoint info

### Authentication Tab

**Two-Column Layout (desktop):**
- Left column: Instructions and status (max-w-md)
- Right column: OAuth flow visualization/action buttons

**OAuth Connection Card:**
- Bordered card with p-8
- Large Twitter/X icon at top
- Connection status section:
  - If connected: User handle display (@username) + green indicator
  - If not connected: "Connect your X account" prompt
- Primary action button: "Connect X Account" (large, w-full on mobile)
- Disconnect option (text button, small) when authenticated

**Required Credentials List:**
- Bulleted list format with monospace font
- Items: API Key, API Secret, OAuth 2.0 Client ID, Bearer Token
- Each with brief description below

### API Documentation Tab

**Sidebar Navigation (desktop only, sticky):**
- Fixed left sidebar (w-64)
- Sections: Overview, Authentication, Endpoints, Examples, Error Codes
- Smooth scroll links

**Main Documentation Area:**

**Section Structure:**
- Each section with anchor ID for navigation
- Section header: text-2xl font-semibold mb-6
- Subsections with clear hierarchy

**Endpoint Documentation Cards:**
- Bordered cards with rounded corners
- Header row: HTTP method badge (POST) + endpoint path in monospace
- Request section:
  - Headers table (Name, Value, Required columns)
  - Body parameters table with type indicators
  - Example request in code block with syntax highlighting
- Response section:
  - Success response example (JSON formatted)
  - Response fields table
- All code blocks: Monospace font, p-4, rounded, with copy button (top-right corner)

**HTTP Method Badges:**
- Inline badges with rounded-full px-3 py-1
- Monospace text-xs font-semibold
- POST, GET, PUT indicators

**Code Blocks:**
- Use Pre + Code elements with lang attribute
- Syntax highlighting via Prism.js (CDN)
- Copy button icon (ClipboardIcon) absolute positioned top-2 right-2

**Three-Step Upload Flow Visualization:**
- Vertical stepper component
- Steps: 1. Initialize, 2. Append Chunks, 3. Finalize
- Each step: circle number indicator, title, description
- Connecting lines between steps

## Form Elements

**Text Inputs:**
- Border with rounded corners
- Padding: px-4 py-2
- Focus: ring treatment (ring-2)
- Label above: text-sm font-medium mb-2

**Buttons:**
- Primary: px-6 py-2 rounded font-medium
- Secondary: border variant with same padding
- Text buttons: px-4 py-2 no background
- Icon buttons: p-2 square
- Hover/active states: subtle transform and opacity changes

**File Upload Component:**
- Dashed border area for drag-and-drop
- CloudArrowUpIcon centered
- "Drop video here or click to browse" text
- File size limit info (text-xs)

## Tables

**Standard Table Pattern:**
- Full width with border
- Header row: font-medium, border-bottom
- Cell padding: px-4 py-3
- Hover state on rows for interactivity
- Responsive: stack on mobile with custom card layout

## Status Indicators

**Badge Components:**
- Inline-flex items-center
- Rounded-full px-3 py-1
- Icon + text combination
- Size variants: sm (text-xs), md (text-sm)

## Accessibility

- All interactive elements keyboard navigable
- Focus visible states with ring treatment
- ARIA labels on icon-only buttons
- Semantic HTML throughout (nav, main, section, article)
- Form labels properly associated with inputs
- Table headers properly marked with th elements
- Skip navigation link at top of page

## Animation Guidelines

**Minimal Animation Philosophy:**
- Page transitions: None (instant tab switching)
- Loading states: Simple rotating spinner (1s rotation) for processing uploads only
- Hover states: opacity changes (opacity-80), no transforms
- Focus states: ring appearance (no animation)
- Avoid scroll-triggered animations entirely

## Responsive Behavior

**Mobile (<768px):**
- Single column layouts throughout
- Stacked navigation tabs (full width)
- Tables transform to card-based lists
- Sidebar navigation becomes collapsible drawer
- Reduced padding: p-4 instead of p-6

**Tablet (768px-1024px):**
- Two-column grids where appropriate
- Side navigation visible but narrower
- Maintain desktop-like table structure

**Desktop (>1024px):**
- Full multi-column layouts
- Fixed sidebar navigation
- Wider containers (max-w-7xl)
- Optimal reading width for documentation (max-w-3xl)

## Icons

**Library:** Heroicons (outline style via CDN)
**Usage:**
- Navigation: ChartBarIcon, KeyIcon, DocumentTextIcon
- Status: CheckCircleIcon, XCircleIcon, ClockIcon
- Actions: CloudArrowUpIcon, ClipboardIcon, ArrowPathIcon
- Size: w-5 h-5 for inline icons, w-8 h-8 for feature icons