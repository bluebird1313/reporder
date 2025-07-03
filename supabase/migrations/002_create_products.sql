-- Create products table
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sku text UNIQUE NOT NULL,
  name text NOT NULL,
  brand text,
  default_min_stock integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to have full access
CREATE POLICY "Authenticated users can manage products" ON products
  FOR ALL 
  TO authenticated 
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create index on sku for faster lookups
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_brand ON products(brand); 