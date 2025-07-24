-- RepOrder Dashboard MVP - Create core tables for rep goals, metrics, and alerts
-- Migration 005: Create rep_goals, sales_metrics, stock_alerts, historical_sales

-- Create rep_goals table for tracking rep performance goals
CREATE TABLE rep_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rep_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    goal_type TEXT NOT NULL CHECK (goal_type IN ('AO', 'Prebook')),
    goal_amount DECIMAL(12,2) NOT NULL,
    goal_month DATE NOT NULL, -- First day of the month for the goal period
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rep_id, store_id, brand, goal_type, goal_month)
);

-- Create sales_metrics table for daily sales roll-ups
CREATE TABLE sales_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    date DATE NOT NULL,
    ao_sales DECIMAL(12,2) DEFAULT 0, -- AO (At Once) sales
    prebook_sales DECIMAL(12,2) DEFAULT 0, -- Prebook sales
    total_units INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, brand, date)
);

-- Create stock_alerts table for inventory alerts
CREATE TABLE stock_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('low', 'out_of_stock')),
    quantity INTEGER NOT NULL DEFAULT 0,
    threshold INTEGER NOT NULL DEFAULT 0, -- The stock level that triggered the alert
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE NULL,
    UNIQUE(store_id, product_id, alert_type)
);

-- Create historical_sales table for past sales data
CREATE TABLE historical_sales (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    units INTEGER NOT NULL DEFAULT 0,
    revenue DECIMAL(12,2) NOT NULL DEFAULT 0,
    product_type TEXT, -- Optional grouping by product type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date, store_id, brand, product_type)
);

-- Create indexes for performance
CREATE INDEX idx_rep_goals_rep_id ON rep_goals(rep_id);
CREATE INDEX idx_rep_goals_store_id ON rep_goals(store_id);
CREATE INDEX idx_rep_goals_brand ON rep_goals(brand);
CREATE INDEX idx_rep_goals_month ON rep_goals(goal_month);

CREATE INDEX idx_sales_metrics_store_brand_date ON sales_metrics(store_id, brand, date);
CREATE INDEX idx_sales_metrics_date ON sales_metrics(date);
CREATE INDEX idx_sales_metrics_brand ON sales_metrics(brand);

CREATE INDEX idx_stock_alerts_store_id ON stock_alerts(store_id);
CREATE INDEX idx_stock_alerts_product_id ON stock_alerts(product_id);
CREATE INDEX idx_stock_alerts_type ON stock_alerts(alert_type);
CREATE INDEX idx_stock_alerts_unresolved ON stock_alerts(resolved_at) WHERE resolved_at IS NULL;

CREATE INDEX idx_historical_sales_date ON historical_sales(date);
CREATE INDEX idx_historical_sales_store_brand ON historical_sales(store_id, brand);
CREATE INDEX idx_historical_sales_brand ON historical_sales(brand);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_rep_goals_updated_at 
    BEFORE UPDATE ON rep_goals 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_metrics_updated_at 
    BEFORE UPDATE ON sales_metrics 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stock_alerts_updated_at 
    BEFORE UPDATE ON stock_alerts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_historical_sales_updated_at 
    BEFORE UPDATE ON historical_sales 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security on all tables
ALTER TABLE rep_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_sales ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for rep_goals (rep can only see/manage their own goals)
CREATE POLICY "Users can manage their own goals" ON rep_goals
    FOR ALL USING (auth.uid() = rep_id);

CREATE POLICY "Authenticated users can read goals for stores they have access to" ON rep_goals
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create RLS policies for sales_metrics (read access for authenticated users)
CREATE POLICY "Authenticated users can read sales metrics" ON sales_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage sales metrics" ON sales_metrics
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for stock_alerts (read access for authenticated users)
CREATE POLICY "Authenticated users can read stock alerts" ON stock_alerts
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage stock alerts" ON stock_alerts
    FOR ALL USING (auth.role() = 'authenticated');

-- Create RLS policies for historical_sales (read access for authenticated users)
CREATE POLICY "Authenticated users can read historical sales" ON historical_sales
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage historical sales" ON historical_sales
    FOR ALL USING (auth.role() = 'authenticated');

-- Create useful views for dashboard queries
CREATE OR REPLACE VIEW goal_progress_view AS
SELECT 
    rg.id,
    rg.rep_id,
    rg.store_id,
    s.name as store_name,
    rg.brand,
    rg.goal_type,
    rg.goal_amount,
    rg.goal_month,
    COALESCE(
        CASE 
            WHEN rg.goal_type = 'AO' THEN SUM(sm.ao_sales)
            WHEN rg.goal_type = 'Prebook' THEN SUM(sm.prebook_sales)
            ELSE 0
        END, 0
    ) as actual_sales,
    CASE 
        WHEN rg.goal_amount > 0 THEN 
            ROUND((COALESCE(
                CASE 
                    WHEN rg.goal_type = 'AO' THEN SUM(sm.ao_sales)
                    WHEN rg.goal_type = 'Prebook' THEN SUM(sm.prebook_sales)
                    ELSE 0
                END, 0
            ) / rg.goal_amount) * 100, 2)
        ELSE 0
    END as progress_percentage
FROM rep_goals rg
JOIN stores s ON rg.store_id = s.id
LEFT JOIN sales_metrics sm ON (
    rg.store_id = sm.store_id 
    AND rg.brand = sm.brand 
    AND sm.date >= rg.goal_month 
    AND sm.date < (rg.goal_month + INTERVAL '1 month')
)
GROUP BY rg.id, rg.rep_id, rg.store_id, s.name, rg.brand, rg.goal_type, rg.goal_amount, rg.goal_month;

-- Create view for active stock alerts
CREATE OR REPLACE VIEW active_stock_alerts_view AS
SELECT 
    sa.id,
    sa.store_id,
    s.name as store_name,
    sa.product_id,
    p.display_name as product_name,
    p.style_number,
    sa.alert_type,
    sa.quantity,
    sa.threshold,
    sa.created_at
FROM stock_alerts sa
JOIN stores s ON sa.store_id = s.id
JOIN products p ON sa.product_id = p.id
WHERE sa.resolved_at IS NULL
ORDER BY sa.created_at DESC;

-- Grant access to views
GRANT SELECT ON goal_progress_view TO authenticated;
GRANT SELECT ON active_stock_alerts_view TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE rep_goals IS 'Sales rep goals by store, brand, and goal type (AO/Prebook)';
COMMENT ON TABLE sales_metrics IS 'Daily sales metrics rolled up by store and brand';
COMMENT ON TABLE stock_alerts IS 'Inventory alerts for low stock and out-of-stock products';
COMMENT ON TABLE historical_sales IS 'Historical sales data for forecasting and trend analysis';

COMMENT ON VIEW goal_progress_view IS 'Combined view of rep goals with actual sales progress';
COMMENT ON VIEW active_stock_alerts_view IS 'View of unresolved stock alerts with product and store details'; 