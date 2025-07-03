-- Create store_products junction table
CREATE TABLE store_products (
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  qty integer DEFAULT 0,
  min_qty integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (store_id, product_id)
);

-- Enable RLS (Row Level Security)
ALTER TABLE store_products ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to have full access
CREATE POLICY "Authenticated users can manage store products" ON store_products
  FOR ALL 
  TO authenticated 
  USING (true);

-- Create updated_at trigger
CREATE TRIGGER update_store_products_updated_at 
  BEFORE UPDATE ON store_products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_store_products_store_id ON store_products(store_id);
CREATE INDEX idx_store_products_product_id ON store_products(product_id);
CREATE INDEX idx_store_products_low_stock ON store_products(store_id, product_id) 
  WHERE qty <= min_qty; 