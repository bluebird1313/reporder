# 🏪 RepOrder Dashboard - Project Overview

## 📋 Quick Summary
A Next.js 15 + Supabase RepOrder dashboard system with **dual user interfaces** for companies and sales reps. Connects to multiple e-commerce platforms (Shopify, Lightspeed) via OAuth and provides product sharing permissions and inventory management.

## 🏗️ Architecture
- **Frontend**: Next.js 15 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query + React Query DevTools
- **Forms**: React Hook Form + Zod validation
- **Authentication**: OAuth 2.0 (Shopify, Lightspeed)
- **UI Components**: Heroicons + clsx utilities
- **Deployment**: Ready for Vercel/Netlify

## 🎭 User Personas & Interfaces

### 1. **Company/Store Owner Interface** (`/dashboard/company`)
**Role**: Business owners who grant and manage rep access
- Store connection health monitoring
- Product collection management with thumbnails
- Rep invitation and permission granting
- Permission matrix visualization (rep × collection)
- Analytics overview of shared inventory

### 2. **Sales Rep Interface** (`/dashboard/rep`)
**Role**: Sales reps managing multiple store relationships
- Multi-store navigation and switching
- Inventory data table with search and filtering
- Sales performance KPIs and analytics
- Store relationship status monitoring
- Quick action tools (export, orders, comparisons)

## 📁 Project Structure
```
react test/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── page.tsx                 # Homepage with RepOrder branding
│   │   ├── layout.tsx               # Root layout + React Query providers
│   │   ├── globals.css              # Global styles
│   │   ├── connect-store/           # Store connection flow
│   │   │   └── page.tsx
│   │   ├── connected/               # Success page
│   │   │   └── page.tsx
│   │   └── dashboard/               # 🆕 Dashboard interfaces
│   │       ├── company/             # Company dashboard
│   │       │   └── page.tsx
│   │       └── rep/                 # Rep dashboard
│   │           └── page.tsx
│   ├── components/                   # 🆕 UI Components
│   │   ├── company/                 # Company-specific components
│   │   │   ├── StoreHealthCard.tsx
│   │   │   ├── PermissionMatrix.tsx
│   │   │   ├── ProductCollectionSelector.tsx
│   │   │   ├── RepInvitationFlow.tsx
│   │   │   └── AnalyticsOverview.tsx
│   │   └── rep/                     # Rep-specific components
│   │       ├── MultiStoreNavigation.tsx
│   │       ├── InventoryDataTable.tsx
│   │       ├── SalesPerformanceCards.tsx
│   │       ├── StoreRelationshipCards.tsx
│   │       └── QuickActionsPanel.tsx
│   ├── pages/api/                   # API endpoints
│   │   ├── test-env.ts              # Environment testing (dev only)
│   │   ├── dashboard/               # 🆕 Dashboard APIs
│   │   │   ├── store-owner/
│   │   │   │   └── me.ts           # Company dashboard data
│   │   │   └── rep/
│   │   │       └── me.ts           # Rep dashboard data
│   │   ├── permissions/             # 🆕 Permission management
│   │   │   └── grant.ts            # Grant rep permissions
│   │   └── oauth/                   # OAuth flow handlers
│   │       └── shopify/
│   │           ├── start.ts        # OAuth initiation
│   │           └── callback.ts     # OAuth completion
│   └── lib/
│       ├── providers.tsx            # 🆕 React Query provider wrapper
│       ├── supabaseAdmin.ts         # Database client
│       ├── database.types.ts        # 🆕 Generated Supabase types
│       └── database.helpers.ts      # Database utility functions
├── supabase/
│   └── migrations/
│       ├── 20250701025655_oauth.sql         # OAuth schema
│       └── 20250701025656_product_sharing.sql # 🆕 Rep permissions schema
├── .env.local                       # Environment variables (NOT in git)
├── .gitignore                       # Security (protects secrets)
├── package.json                     # Dependencies
├── next.config.js                   # Next.js configuration
├── tailwind.config.js               # Styling configuration
└── tsconfig.json                    # TypeScript configuration
```

## 🔐 Security Configuration

### Environment Variables (.env.local)
```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ0eXAiOiJKV1Q...

# Shopify OAuth
SHOPIFY_CLIENT_ID=your_client_id
SHOPIFY_CLIENT_SECRET=your_client_secret

# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3003
```

### Security Rules
- ✅ Server-only variables: `SUPABASE_SERVICE_ROLE_KEY`, `SHOPIFY_CLIENT_SECRET`
- ✅ Client-safe variables: `NEXT_PUBLIC_BASE_URL` (prefixed with `NEXT_PUBLIC_`)
- ✅ Environment files in `.gitignore`
- ✅ HMAC verification for webhooks
- ✅ State parameter for OAuth CSRF protection

## 🗄️ Database Schema

### OAuth Tables
#### oauth_states
Stores temporary OAuth state for CSRF protection
```sql
CREATE TABLE oauth_states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    state UUID NOT NULL UNIQUE,
    shop_domain TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### retailer_tokens  
Stores OAuth tokens for each connected platform
```sql
CREATE TABLE retailer_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform TEXT NOT NULL,
    shop_domain TEXT NOT NULL,
    access_token TEXT NOT NULL,
    scope TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 🆕 RepOrder Permission Tables
#### product_sharing_permissions
Controls which product collections reps can access
```sql
CREATE TABLE product_sharing_permissions (
    id bigserial PRIMARY KEY,
    shop_domain text NOT NULL,
    rep_email text NOT NULL,
    collection_id text,     -- Shopify collection ID (null = all products)
    collection_name text,   -- Human readable collection name
    product_line text,      -- Custom product line identifier
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

#### rep_access
Links reps to stores with access levels
```sql
CREATE TABLE rep_access (
    id bigserial PRIMARY KEY,
    rep_email text NOT NULL,
    shop_domain text NOT NULL,
    access_level text CHECK (access_level IN ('full', 'limited', 'collection_only')) DEFAULT 'limited',
    is_active boolean DEFAULT true,
    granted_by text,        -- Email of store owner who granted access
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);
```

## 🔄 OAuth Flow

### Shopify Integration
1. **Initiation** (`/api/oauth/shopify/start`)
   - Generate UUID state
   - Store state + shop_domain in database
   - Redirect to Shopify OAuth URL

2. **Callback** (`/api/oauth/shopify/callback`)
   - Verify state parameter (CSRF protection)
   - Verify HMAC signature (authenticity)
   - Exchange authorization code for access token
   - Store token in database
   - Redirect to success page

### Required OAuth Scopes
- `read_products` - Product catalog access
- `read_inventory` - Inventory levels
- `read_orders` - Order history and analytics

## 🎨 UI Design System

### Design Principles
- **Brand**: RepOrder - Professional, trustworthy B2B SaaS
- **Style**: Clean, minimal, data-dense but readable
- **Colors**: Professional blue/gray palette with status indicators
- **Typography**: Inter font family
- **Components**: Tailwind CSS with consistent spacing and shadows
- **Layout**: Responsive, mobile-first approach

### Component Library
- **Forms**: React Hook Form + Zod validation with error states
- **Data Display**: Sortable tables, KPI cards, status indicators
- **Navigation**: Multi-tab interfaces, breadcrumbs
- **Feedback**: Loading states, error boundaries, success messages
- **Icons**: Heroicons for consistent iconography

## 🔧 Development Workflow

### Environment Setup
1. Create `.env.local` with required variables
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server (port 3003)
4. Visit `http://localhost:3003/api/test-env` to verify environment

### Database Setup
1. Link Supabase project: `npx supabase link`
2. Apply migrations: `npx supabase db push`
3. Verify tables in Supabase dashboard
4. Generate types: `npx supabase gen types typescript --local > src/lib/database.types.ts`

### Testing Dashboards
1. **Company Dashboard**: `http://localhost:3003/dashboard/company`
2. **Rep Dashboard**: `http://localhost:3003/dashboard/rep`
3. Both dashboards use mock data from API endpoints for development

### Testing OAuth
1. Create Shopify Partner account (free)
2. Create development app with localhost URLs
3. Use development store for testing
4. Test full OAuth flow end-to-end

## 📊 API Endpoints

### Dashboard APIs
#### GET `/api/dashboard/store-owner/me`
Returns company dashboard data
```json
{
  "storeStatus": { "status": "connected", "lastSync": "2024-01-15T10:30:00Z" },
  "reps": [{ "id": "rep1", "name": "John Smith" }],
  "collections": [{ "id": "col1", "name": "Outdoor Gear", "productsCount": 45 }],
  "permissions": { "rep1": { "col1": "write" } },
  "analytics": { "sharedValue": 45000, "sharedVolume": 280, "topReps": [...] }
}
```

#### GET `/api/dashboard/rep/me`
Returns rep dashboard data
```json
{
  "stores": [{ "id": "store1", "name": "Tucker's Store", "status": "connected" }],
  "inventory": [{ "id": "inv1", "sku": "TB-001", "name": "Trail Shoes", "stock": 25, "price": 89.99 }],
  "sales": { "totalSales": 12450, "averageOrderValue": 124.50, "ordersCount": 100, "target": 15000 },
  "relationships": [{ "storeId": "store1", "storeName": "Tucker's Store", "permission": "full", "status": "connected" }]
}
```

#### POST `/api/permissions/grant`
Grants permissions to reps
```json
{
  "email": "rep@example.com",
  "permission": "limited" | "full" | "collection_only"
}
```

### Legacy APIs
#### GET `/api/test-env` (Development Only)
Returns environment variable status without exposing values

#### GET `/api/oauth/shopify/start?shop=store.myshopify.com`
Initiates Shopify OAuth flow

#### GET `/api/oauth/shopify/callback`
Handles Shopify OAuth callback

## 🚀 Deployment Considerations

### Production Environment Variables
```env
# Production URLs (NOTE: Port changed to 3003)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
SHOPIFY_CLIENT_ID=prod_client_id
SHOPIFY_CLIENT_SECRET=prod_client_secret
```

### Platform Configuration
- **Vercel**: Add environment variables in dashboard
- **Netlify**: Configure in site settings
- **Shopify App**: Update redirect URLs to production domain

### Security Checklist
- [ ] Environment variables configured on hosting platform
- [ ] `.env.local` not committed to git
- [ ] Production OAuth app created with proper URLs
- [ ] HTTPS enabled for production
- [ ] Database access restricted to application
- [ ] Rep permission validation on all API endpoints

## 🔮 Future Enhancements

### Planned Features
- [ ] Lightspeed POS integration
- [ ] Real-time analytics dashboard with charts
- [ ] Webhook endpoints for live data sync
- [ ] Multi-tenant support
- [ ] Advanced reporting and exports
- [ ] Rep notification system
- [ ] Bulk permission management
- [ ] Inventory alerts and automation

### Technical Debt
- [ ] Replace mock APIs with real Supabase queries
- [ ] Add comprehensive error handling
- [ ] Implement proper logging
- [ ] Add unit and integration tests
- [ ] Set up CI/CD pipeline
- [ ] Add rate limiting for APIs
- [ ] Implement real-time subscriptions

## 📚 Key Dependencies
```json
{
  "next": "15.3.4",
  "@supabase/supabase-js": "^2.50.2", 
  "@tanstack/react-query": "^5.25.0",
  "@tanstack/react-query-devtools": "^5.25.0",
  "react-hook-form": "^7.51.2",
  "zod": "^3.23.8",
  "@hookform/resolvers": "^3.2.1",
  "@heroicons/react": "^2.0.18",
  "clsx": "^1.2.1",
  "tailwindcss": "^3.4.0",
  "typescript": "^5",
  "dotenv": "^16.6.1"
}
```

## 🐛 Common Issues & Solutions

### Port Configuration
```bash
# Server runs on port 3003 (configured in package.json)
# Update NEXT_PUBLIC_BASE_URL accordingly: http://localhost:3003
```

### Environment Variables Not Loading
```bash
# Restart dev server after changing .env.local
npm run dev
```

### Dashboard API Failures
```bash
# Check mock API endpoints are working:
# http://localhost:3003/api/dashboard/store-owner/me
# http://localhost:3003/api/dashboard/rep/me
```

### Component Import Errors
```bash
# Install missing dependencies:
npm install @tanstack/react-query react-hook-form zod @heroicons/react clsx @hookform/resolvers
```

### OAuth Redirect Mismatch
```bash
# Ensure redirect URL in Shopify app matches exactly:
# http://localhost:3003/api/oauth/shopify/callback
```

### Database Connection Issues
```bash
# Verify Supabase connection:
npx supabase status
# Regenerate types if schema changed:
npx supabase gen types typescript --local > src/lib/database.types.ts
```

## 🆘 Emergency Contacts
- **Supabase Dashboard**: https://app.supabase.com
- **Shopify Partners**: https://partners.shopify.com
- **Next.js Docs**: https://nextjs.org/docs
- **React Query Docs**: https://tanstack.com/query

---
*Last Updated: January 2025*
*Next.js 15.3.4 | Supabase | TanStack React Query | RepOrder Dashboard System* 