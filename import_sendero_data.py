#!/usr/bin/env python3
"""
Import Sendero Product Data to Supabase
Reads the exported CSV and imports all 1530 products into the database
"""

import pandas as pd
import os
import sys
from supabase import create_client, Client
from typing import List, Dict
import json
from decimal import Decimal

# Supabase configuration
SUPABASE_URL = "https://yceygbsmguybkekaahva.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljZXlnYnNtZ3V5Ymtla2FhaHZhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTkzNDQ3MSwiZXhwIjoyMDUxNTEwNDcxfQ.qubOlUQo-YnlHz6wP1VDp9VNUsWzHcW30BUUPzPv1AE"

def connect_to_supabase() -> Client:
    """Create Supabase client connection"""
    try:
        client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        print("✅ Connected to Supabase")
        return client
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {e}")
        sys.exit(1)

def prepare_product_data(df: pd.DataFrame) -> List[Dict]:
    """Transform pandas DataFrame to Supabase-ready format"""
    products = []
    
    for _, row in df.iterrows():
        # Convert pricing to proper format (MSRP in cents, wholesale as decimal)
        msrp_cents = int(row['MSRP'] * 100) if pd.notna(row['MSRP']) else 0
        wholesale_price = float(row['WHLS']) if pd.notna(row['WHLS']) else 0.0
        
        product = {
            'external_id': str(row['External ID']).strip(),
            'upc_code': int(row['UPC Code']) if pd.notna(row['UPC Code']) else None,
            'style_number': str(row['Style Number']).strip(),
            'display_name': str(row['Display Name']).strip(),
            'style_name': str(row['Style Name']).strip(),
            'launch_season': str(row['Launch Season']).strip(),
            'base_color': str(row['Base Color']).strip() if pd.notna(row['Base Color']) else None,
            'marketing_color': str(row['Marketing Color']).strip() if pd.notna(row['Marketing Color']) else None,
            'product_type': str(row['Product Type']).strip(),
            'msrp': msrp_cents,
            'wholesale_price': wholesale_price
        }
        
        products.append(product)
    
    return products

def import_products_to_supabase(client: Client, products: List[Dict]) -> bool:
    """Import products to Supabase in batches"""
    
    batch_size = 100  # Import in batches of 100
    total_products = len(products)
    imported_count = 0
    
    print(f"📦 Importing {total_products} products in batches of {batch_size}...")
    
    for i in range(0, total_products, batch_size):
        batch = products[i:i + batch_size]
        batch_num = (i // batch_size) + 1
        total_batches = (total_products + batch_size - 1) // batch_size
        
        try:
            print(f"   📤 Uploading batch {batch_num}/{total_batches} ({len(batch)} products)...")
            
            result = client.table('products').insert(batch).execute()
            
            if result.data:
                imported_count += len(batch)
                print(f"   ✅ Batch {batch_num} imported successfully")
            else:
                print(f"   ⚠️  Batch {batch_num} returned no data")
                
        except Exception as e:
            print(f"   ❌ Error importing batch {batch_num}: {e}")
            # Continue with next batch instead of stopping
            continue
    
    print(f"\n🎉 Import completed! {imported_count}/{total_products} products imported")
    return imported_count == total_products

def verify_import(client: Client) -> None:
    """Verify the import was successful"""
    try:
        print("\n🔍 Verifying import...")
        
        # Count total products
        result = client.table('products').select('id', count='exact').execute()
        total_count = len(result.data) if result.data else 0
        
        print(f"   📊 Total products in database: {total_count}")
        
        # Get sample products
        sample_result = client.table('products').select('*').limit(5).execute()
        
        if sample_result.data:
            print(f"   📋 Sample products:")
            for product in sample_result.data[:3]:
                print(f"      • {product['display_name']} (${product['msrp']/100:.2f})")
        
        # Check product types
        types_result = client.table('products').select('product_type').execute()
        if types_result.data:
            product_types = list(set([p['product_type'] for p in types_result.data]))
            print(f"   🏷️  Product types: {', '.join(product_types)}")
        
    except Exception as e:
        print(f"   ❌ Error during verification: {e}")

def main():
    """Main import process"""
    print("🚀 Starting Sendero Product Data Import")
    
    # Check if CSV file exists
    csv_path = "sendero_products.csv"
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        print("   Please run 'python analyze_sendero_data.py' first")
        sys.exit(1)
    
    # Read the CSV data
    print(f"📄 Reading product data from {csv_path}...")
    try:
        df = pd.read_csv(csv_path)
        print(f"   📊 Loaded {len(df)} products from CSV")
    except Exception as e:
        print(f"❌ Error reading CSV: {e}")
        sys.exit(1)
    
    # Connect to Supabase
    client = connect_to_supabase()
    
    # Prepare data for import
    print("🔄 Preparing data for Supabase...")
    products = prepare_product_data(df)
    print(f"   ✅ Prepared {len(products)} product records")
    
    # Import to Supabase
    success = import_products_to_supabase(client, products)
    
    if success:
        # Verify the import
        verify_import(client)
        print("\n🎉 Sendero product data import completed successfully!")
        print("   🔗 Your UI can now connect to real product data!")
    else:
        print("\n⚠️  Import completed with some errors. Check the output above.")

if __name__ == "__main__":
    # Install required package if not present
    try:
        import supabase
    except ImportError:
        print("📦 Installing Supabase Python client...")
        os.system("python -m pip install supabase")
        import supabase
    
    main() 