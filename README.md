# 🏪 RepOrder Dashboard MVP

A comprehensive sales rep dashboard with goal tracking, forecasting, inventory alerts, and CRM integration. Built with Next.js 15, Supabase, React Query, and modern TypeScript.

## ✨ Features

### 🎯 Goal Tracking
- **Goal Progress Cards**: Visual KPI tracking with traffic-light colors
- **Goal Breakdown**: Detailed drill-down by accounts and performance
- **Multi-period Views**: Day, week, month, and year-to-date tracking
- **Brand-specific Goals**: AO (At Once) and Prebook goal types

### 📊 Sales Forecasting  
- **Responsive Charts**: Recharts with mobile-optimized area charts
- **Confidence Intervals**: Predictive modeling with uncertainty ranges
- **Brand Filtering**: Multi-select brand context switching
- **Historical Analysis**: 2+ years of sales data for trend analysis

### ⚠️ Inventory Management
- **Real-time Stock Alerts**: Low stock and out-of-stock notifications
- **Brand-specific Monitoring**: Filter alerts by selected brands
- **Quick Resolution**: One-click alert resolution workflow
- **Health Indicators**: Green/Yellow/Red status for sell-through rates

### 🤝 CRM Integration
- **Streak API**: Native integration with Streak CRM
- **Contact Tracking**: Last contact dates and email open rates
- **Task Management**: Create and complete tasks from dashboard
- **Opportunity Pipeline**: View store-specific sales opportunities

### 🎨 User Experience
- **Responsive Design**: Mobile-first with breakpoint optimization
- **Accessibility**: WCAG-compliant with screen reader support
- **Real-time Updates**: React Query for optimistic UI updates
- **Brand Context**: Persistent brand filtering via URL state

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Optional: Streak API key for CRM features

### 1. Environment Setup

Clone the repository and install dependencies:
```bash
git clone <your-repo-url>
cd reporder
npm install
```

Create `.env.local` with required variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CRM Integration (Optional)
NEXT_PUBLIC_STREAK_API_KEY=your_streak_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3003
```

### 2. Database Setup

Run the migrations to set up the database schema:
```bash
# Apply all migrations including the new MVP tables
npx supabase db push

# Or manually apply the migration
psql -h your-host -U postgres -d postgres -f supabase/migrations/005_create_rep_dashboard_tables.sql
```

### 3. Seed Sample Data

Populate the database with realistic sample data:
```bash
# Install tsx for running TypeScript scripts
npm install -g tsx

# Run the seed script
tsx scripts/seed_goals.ts
```

This will create:
- **Rep goals** for 6 months across multiple brands and stores
- **Daily sales metrics** for the last 90 days
- **Historical sales data** for 2 years (weekly aggregation)
- **Sample stock alerts** for testing inventory features

### 4. Start Development

Run the development server:
```bash
npm run dev
```

Visit [http://localhost:3003/dashboard](http://localhost:3003/dashboard) to see the dashboard.

### 5. Optional: Configure CRM

To enable Streak CRM integration:
1. Get your Streak API key from [Streak Settings](https://www.streak.com/api)
2. Add it to your `.env.local` as `NEXT_PUBLIC_STREAK_API_KEY`
3. Restart the development server

## 📁 Project Structure

```
reporder/
├── src/
│   ├── app/dashboard/                    # Main dashboard pages
│   ├── components/dashboard/             # Dashboard components
│   │   ├── GoalProgressCard.tsx         # KPI tracking cards
│   │   ├── LowStockAlert.tsx           # Inventory alerts
│   │   ├── ForecastWidget.tsx          # Sales forecasting charts
│   │   ├── BrandFilter.tsx             # Multi-select brand filter
│   │   └── StoreCRMPane.tsx            # CRM integration panel
│   ├── lib/services/                    # Data services
│   │   ├── dashboard-goals.ts          # Goal tracking & React Query hooks
│   │   └── dashboard.ts                # Existing sales analytics
│   └── lib/streak.ts                   # Streak CRM API wrapper
├── supabase/
│   ├── migrations/                     # Database schema
│   │   └── 005_create_rep_dashboard_tables.sql
│   └── functions/                      # Edge Functions
│       ├── syncBrandWebhook/           # Brand data ingestion
│       └── syncBuyerFeed/              # CSV stock alert processing
└── scripts/
    └── seed_goals.ts                   # Database seeding script
```

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server (port 3003)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run quality      # Run linting + TypeScript checks
```

### Testing the Dashboard

1. **Goal Progress**: View goal tracking cards with realistic completion percentages
2. **Brand Filtering**: Use the multi-select filter to switch dashboard context
3. **Forecasting**: View 30-day revenue and unit predictions with confidence intervals
4. **Stock Alerts**: See sample low-stock and out-of-stock notifications
5. **CRM Features**: Connect Streak to see contact history and task management

### API Endpoints

The dashboard provides several API endpoints for data management:

- `POST /functions/v1/syncBrandWebhook` - Ingest brand sales data (JSON)
- `POST /functions/v1/syncBuyerFeed` - Process stock alerts (CSV)
- Internal React Query hooks handle all dashboard data fetching

## 🔧 Configuration

### Database Tables

The MVP adds four core tables:

1. **`rep_goals`** - Goal tracking by rep, store, brand, and type
2. **`sales_metrics`** - Daily sales roll-ups from brand feeds  
3. **`stock_alerts`** - Inventory alerts with resolution tracking
4. **`historical_sales`** - 2+ years of sales data for forecasting

### Row-Level Security

All tables implement RLS policies:
- Reps can only see their own goals (`auth.uid() = rep_id`)
- Authenticated users can read sales metrics and alerts
- Proper isolation for multi-tenant scenarios

### React Query Integration

The dashboard uses React Query for:
- **Optimistic Updates**: Immediate UI feedback
- **Background Refresh**: Automatic data sync
- **Caching Strategy**: 2-15 minute cache times based on data type
- **Error Handling**: Automatic retry with user feedback

## 🎨 UI Components

### Goal Progress Cards
- **Traffic Light Colors**: Green (100%+), Yellow (75%+), Orange (50%+), Red (<50%)
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Click Actions**: Drill-down to goal breakdown (placeholder for future modal)

### Forecast Widget  
- **Responsive Charts**: Line charts on desktop, area charts on mobile (<640px)
- **Confidence Intervals**: Visual uncertainty ranges with dashed lines
- **Interactive Tooltips**: Hover for detailed predictions
- **View Switching**: Toggle between revenue and units forecasting

### Brand Filter
- **Multi-select**: Checkbox-based selection with search
- **Presets**: Quick select for "All", "Favorites", "Top 5", "None"
- **URL Persistence**: Brand selection persisted in URL parameters
- **Favorites**: Star system for frequently used brands

### Stock Alerts
- **Priority Sorting**: Out-of-stock alerts first, then by creation date
- **Resolution Actions**: One-click alert resolution with optimistic updates
- **Real-time Updates**: Auto-refresh every 2 minutes
- **Visual Hierarchy**: Color-coded alert types with clear iconography

## 🔗 Integrations

### Streak CRM
The dashboard integrates with Streak CRM for:
- **Contact History**: Last contact dates and email engagement
- **Task Management**: Create and complete tasks from the dashboard
- **Opportunity Tracking**: View store-specific sales pipeline
- **Activity Timeline**: Recent CRM activity for each store

To configure Streak:
1. Get API key from Streak settings
2. Add to environment variables
3. Test connection via the dashboard

### Edge Functions
Two Supabase Edge Functions handle data ingestion:

1. **Brand Webhook** (`/functions/syncBrandWebhook`)
   - Accepts JSON payloads with sales data
   - Validates store existence
   - Upserts to `sales_metrics` table

2. **Buyer Feed** (`/functions/syncBuyerFeed`)
   - Processes CSV with inventory data
   - Creates/resolves stock alerts automatically
   - Handles product lookup by ID, SKU, or UPC

## 🧪 Testing

### Manual Testing
1. Run the seed script to populate sample data
2. Navigate to the dashboard and verify all components load
3. Test brand filtering and URL persistence
4. Try resolving stock alerts
5. If Streak is configured, test CRM features

### Data Validation
- Goals show realistic progress percentages
- Forecast charts display 30-day predictions
- Stock alerts prioritize out-of-stock items
- Brand filtering affects forecast context

## 🚀 Deployment

### Production Setup
1. Set up Supabase production project
2. Configure environment variables on your hosting platform
3. Run migrations against production database
4. Deploy Edge Functions to Supabase
5. Optional: Set up Streak integration

### Environment Variables
```env
# Production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=prod_service_role_key
NEXT_PUBLIC_STREAK_API_KEY=prod_streak_key
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## 📊 Performance

### Optimization Features
- **React Query Caching**: Reduces API calls with smart cache invalidation
- **Responsive Charts**: Mobile-optimized visualizations switch automatically
- **Lazy Loading**: Components load data on-demand
- **Optimistic Updates**: UI responds immediately to user actions

### Bundle Size
- Recharts adds ~100KB for chart functionality
- React Query adds ~40KB for state management
- Total dashboard overhead: ~150KB gzipped

## 🐛 Troubleshooting

### Common Issues

**Dashboard shows no data:**
- Run the seed script: `tsx scripts/seed_goals.ts`
- Check Supabase connection and table creation
- Verify environment variables are loaded

**Forecast widget empty:**
- Ensure historical sales data exists (seeded)
- Check browser console for API errors
- Verify brand filtering isn't excluding all data

**CRM panel not working:**
- Confirm `NEXT_PUBLIC_STREAK_API_KEY` is set
- Test API key at `https://www.streak.com/api/v1/me`
- Check browser console for authentication errors

**Charts not responsive:**
- Test window resize behavior
- Check that Recharts is properly installed
- Verify mobile breakpoint logic (640px)

### Debug Mode
Set `NODE_ENV=development` to enable:
- React Query DevTools
- Detailed console logging
- Error boundary details

## 🛣️ Roadmap

### Phase 2 Features
- [ ] Goal breakdown modal with account-level details
- [ ] Health indicator component for sell-through rates
- [ ] Advanced forecasting with seasonality detection
- [ ] Real-time data sync via Supabase subscriptions
- [ ] Mobile app companion for on-the-go access

### Data Enhancements
- [ ] Integration with additional CRM platforms
- [ ] Automated goal setting based on historical performance
- [ ] Machine learning for improved forecasting accuracy
- [ ] Inventory optimization recommendations

## 📞 Support

- **Documentation**: Check `PROJECT_OVERVIEW.md` for detailed architecture
- **Issues**: Open GitHub issues for bugs or feature requests
- **Supabase**: [Dashboard](https://app.supabase.com) for database management
- **React Query**: [DevTools](https://tanstack.com/query) for debugging queries

---

**Built with Next.js 15, Supabase, React Query, Recharts, and TypeScript**  
*RepOrder Dashboard MVP - Empowering sales reps with data-driven insights* 