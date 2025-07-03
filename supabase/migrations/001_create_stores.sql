-- Create stores table
CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS (Row Level Security)
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to have full access
CREATE POLICY "Authenticated users can manage stores" ON stores
  FOR ALL 
  TO authenticated 
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stores_updated_at 
  BEFORE UPDATE ON stores 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 