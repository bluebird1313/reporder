/*
=============================================================================
DASHBOARD ANALYTICS SYSTEM FOR REPORDER
=============================================================================
Optimized materialized view and analytics for real-time dashboard performance.
Based on existing schema: customer_orders + order_line_items + products.
=============================================================================
*/

-- 1️⃣ SCHEMA VALIDATION & CLEANUP
-- Ensure all critical columns exist and have proper defaults

-- Check if total_amount exists in customer_orders (it does, but might be null)
-- No ALTER needed - columns already exist with proper types

-- 2️⃣ MATERIALIZED VIEW: mv_dashboard
-- Pre-aggregated view for lightning-fast dashboard queries

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard;

CREATE MATERIALIZED VIEW mv_dashboard AS
SELECT 
    co.id as order_id,
    co.order_number,
    co.customer_name,
    co.customer_category,
    co.sales_rep_name,
    co.order_date,
    co.order_status,
    co.ship_date,
    
    -- Order-level aggregations from line items (the real revenue source)
    COALESCE(SUM(oli.total_amount), 0) as order_revenue,
    COALESCE(SUM(oli.quantity), 0) as items_sold,
    COUNT(oli.id) as lines_per_order,
    COALESCE(AVG(oli.unit_price), 0) as avg_unit_price,
    
    -- Month/Year for time-based analytics
    DATE_TRUNC('month', co.order_date) as order_month,
    EXTRACT(YEAR FROM co.order_date) as order_year,
    EXTRACT(MONTH FROM co.order_date) as order_month_num,
    
    -- Categories for segmentation
    STRING_AGG(DISTINCT oli.category, ', ') as product_categories,
    STRING_AGG(DISTINCT oli.product_type, ', ') as product_types

FROM customer_orders co
LEFT JOIN order_line_items oli ON co.order_number = oli.order_number
WHERE co.order_date IS NOT NULL
GROUP BY 
    co.id, co.order_number, co.customer_name, co.customer_category,
    co.sales_rep_name, co.order_date, co.order_status, co.ship_date;

-- 3️⃣ INDEXES FOR PERFORMANCE
-- Optimized for dashboard queries: time-based, customer-based, rep-based

CREATE INDEX idx_mv_dashboard_customer_name ON mv_dashboard (customer_name);
CREATE INDEX idx_mv_dashboard_order_date ON mv_dashboard (order_date DESC);
CREATE INDEX idx_mv_dashboard_order_month ON mv_dashboard (order_month DESC);
CREATE INDEX idx_mv_dashboard_sales_rep ON mv_dashboard (sales_rep_name);
CREATE INDEX idx_mv_dashboard_revenue ON mv_dashboard (order_revenue DESC);
CREATE INDEX idx_mv_dashboard_status ON mv_dashboard (order_status);

-- Base table indexes for faster JOINs
CREATE INDEX IF NOT EXISTS idx_customer_orders_order_date ON customer_orders (order_date DESC);
CREATE INDEX IF NOT EXISTS idx_customer_orders_customer_name ON customer_orders (customer_name);
CREATE INDEX IF NOT EXISTS idx_order_line_items_order_number ON order_line_items (order_number);
CREATE INDEX IF NOT EXISTS idx_order_line_items_total_amount ON order_line_items (total_amount DESC);

-- 4️⃣ REFRESH COMMAND & SCHEDULING
-- Refresh materialized view (run this manually or schedule)

-- Manual refresh:
-- REFRESH MATERIALIZED VIEW mv_dashboard;

-- To schedule nightly refresh at 2 AM (requires pg_cron extension):
-- SELECT cron.schedule('refresh-dashboard', '0 2 * * *', 'REFRESH MATERIALIZED VIEW mv_dashboard;');

-- For Supabase, create an Edge Function and schedule it:
-- https://supabase.com/docs/guides/functions/schedule-functions

-- 5️⃣ ROW LEVEL SECURITY (RLS)
-- Enable RLS and create policies for dashboard access

ALTER TABLE mv_dashboard ENABLE ROW LEVEL SECURITY;

-- Policy for dashboard users to read all analytics data
CREATE POLICY select_dashboard_analytics 
ON mv_dashboard FOR SELECT 
TO authenticated 
USING (true);

-- Ensure base tables have RLS enabled
ALTER TABLE customer_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_line_items ENABLE ROW LEVEL SECURITY;

-- Basic policies for authenticated users
CREATE POLICY IF NOT EXISTS select_customer_orders 
ON customer_orders FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY IF NOT EXISTS select_order_line_items 
ON order_line_items FOR SELECT 
TO authenticated 
USING (true);

-- 6️⃣ ANALYTICS VIEWS FOR SPECIFIC DASHBOARD CARDS

-- View: Last Month Revenue
CREATE OR REPLACE VIEW vw_last_month_revenue AS
SELECT 
    COALESCE(SUM(order_revenue), 0) as revenue_last_month,
    COUNT(*) as orders_last_month,
    COALESCE(SUM(items_sold), 0) as items_last_month
FROM mv_dashboard
WHERE order_month = DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');

-- View: Current Month Revenue
CREATE OR REPLACE VIEW vw_current_month_revenue AS
SELECT 
    COALESCE(SUM(order_revenue), 0) as revenue_current_month,
    COUNT(*) as orders_current_month,
    COALESCE(SUM(items_sold), 0) as items_current_month
FROM mv_dashboard
WHERE order_month = DATE_TRUNC('month', CURRENT_DATE);

-- View: Top Customers (last 12 months)
CREATE OR REPLACE VIEW vw_top_customers AS
SELECT 
    customer_name,
    customer_category,
    COUNT(*) as total_orders,
    SUM(order_revenue) as total_revenue,
    SUM(items_sold) as total_items,
    AVG(order_revenue) as avg_order_value,
    MAX(order_date) as last_order_date
FROM mv_dashboard
WHERE order_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY customer_name, customer_category
ORDER BY total_revenue DESC;

-- View: Sales Rep Performance
CREATE OR REPLACE VIEW vw_sales_rep_performance AS
SELECT 
    sales_rep_name,
    COUNT(*) as total_orders,
    SUM(order_revenue) as total_revenue,
    AVG(order_revenue) as avg_order_value,
    COUNT(DISTINCT customer_name) as unique_customers
FROM mv_dashboard
WHERE sales_rep_name IS NOT NULL
    AND order_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY sales_rep_name
ORDER BY total_revenue DESC;

-- View: Recent Orders (last 30 days)
CREATE OR REPLACE VIEW vw_recent_orders AS
SELECT 
    order_number,
    customer_name,
    order_date,
    order_status,
    order_revenue,
    items_sold
FROM mv_dashboard
WHERE order_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY order_date DESC;

-- 7️⃣ DASHBOARD SUMMARY STATS
-- Single query for main dashboard metrics

CREATE OR REPLACE VIEW vw_dashboard_summary AS
SELECT 
    -- All-time totals
    (SELECT COALESCE(SUM(order_revenue), 0) FROM mv_dashboard) as total_revenue,
    (SELECT COUNT(*) FROM mv_dashboard) as total_orders,
    (SELECT COALESCE(SUM(items_sold), 0) FROM mv_dashboard) as total_items_sold,
    (SELECT COALESCE(AVG(order_revenue), 0) FROM mv_dashboard) as avg_order_value,
    
    -- Last month
    (SELECT COALESCE(revenue_last_month, 0) FROM vw_last_month_revenue) as revenue_last_month,
    (SELECT COALESCE(orders_last_month, 0) FROM vw_last_month_revenue) as orders_last_month,
    
    -- Current month
    (SELECT COALESCE(revenue_current_month, 0) FROM vw_current_month_revenue) as revenue_current_month,
    (SELECT COALESCE(orders_current_month, 0) FROM vw_current_month_revenue) as orders_current_month,
    
    -- Active customers (ordered in last 90 days)
    (SELECT COUNT(DISTINCT customer_name) FROM mv_dashboard 
     WHERE order_date >= CURRENT_DATE - INTERVAL '90 days') as active_customers;

/*
=============================================================================
USAGE EXAMPLES:
=============================================================================

-- Get dashboard summary:
SELECT * FROM vw_dashboard_summary;

-- Get last month revenue only:
SELECT revenue_last_month FROM vw_last_month_revenue;

-- Get top 10 customers:
SELECT * FROM vw_top_customers LIMIT 10;

-- Get recent orders:
SELECT * FROM vw_recent_orders LIMIT 20;

-- Refresh materialized view:
REFRESH MATERIALIZED VIEW mv_dashboard;

=============================================================================
*/ 