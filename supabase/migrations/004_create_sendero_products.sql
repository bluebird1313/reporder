-- Create comprehensive products table for Sendero merchandise
-- Based on SP26 UPC List data analysis

-- Drop existing products table if it exists (for fresh start)
DROP TABLE IF EXISTS products CASCADE;

-- Create the main products table
CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT NOT NULL UNIQUE, -- SPCA120P36AXX format
    upc_code BIGINT NOT NULL UNIQUE, -- UPC barcode number
    style_number TEXT NOT NULL, -- SPCA120P36 format
    display_name TEXT NOT NULL, -- Product display name
    style_name TEXT NOT NULL, -- Internal style name
    launch_season TEXT NOT NULL, -- Pre 2021, Fall 2021, etc.
    base_color TEXT, -- Primary color
    marketing_color TEXT, -- Marketing color name
    product_type TEXT NOT NULL, -- Accessory, Apparel, etc.
    msrp INTEGER NOT NULL, -- Retail price in cents
    wholesale_price DECIMAL(10,2) NOT NULL, -- Wholesale price
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_products_external_id ON products(external_id);
CREATE INDEX idx_products_upc_code ON products(upc_code);
CREATE INDEX idx_products_style_number ON products(style_number);
CREATE INDEX idx_products_product_type ON products(product_type);
CREATE INDEX idx_products_launch_season ON products(launch_season);
CREATE INDEX idx_products_base_color ON products(base_color);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (matching your current setup)
CREATE POLICY "Anonymous users can read products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage products" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Add comment
COMMENT ON TABLE products IS 'Sendero product catalog with pricing and inventory information';

-- Create a view for commonly used product information
CREATE OR REPLACE VIEW product_summary AS
SELECT 
    id,
    external_id,
    upc_code,
    style_number,
    display_name,
    product_type,
    base_color,
    marketing_color,
    launch_season,
    msrp / 100.0 as msrp_dollars, -- Convert cents to dollars
    wholesale_price,
    (msrp / 100.0) - wholesale_price as markup_amount,
    ROUND(((msrp / 100.0) - wholesale_price) / wholesale_price * 100, 2) as markup_percentage
FROM products;

-- Grant access to the view
GRANT SELECT ON product_summary TO PUBLIC; 