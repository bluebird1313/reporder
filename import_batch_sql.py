#!/usr/bin/env python3
"""
Generate SQL INSERT statements for Sendero products
Creates batches of SQL for manual execution in Supabase
"""

import pandas as pd
import os

def escape_sql_string(value):
    """Escape single quotes for SQL strings"""
    if pd.isna(value):
        return 'NULL'
    escaped_value = str(value).replace("'", "''")
    return f"'{escaped_value}'"

def generate_insert_statements():
    """Generate SQL INSERT statements from CSV"""
    
    csv_path = "sendero_products.csv"
    if not os.path.exists(csv_path):
        print(f"❌ CSV file not found: {csv_path}")
        return
    
    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"📄 Reading {len(df)} products from CSV...")
    
    # Generate INSERT statements in batches
    batch_size = 50
    batch_num = 1
    
    for i in range(0, len(df), batch_size):
        batch = df.iloc[i:i + batch_size]
        
        # Create SQL file for this batch
        sql_file = f"import_batch_{batch_num:02d}.sql"
        
        with open(sql_file, 'w', encoding='utf-8') as f:
            f.write(f"-- Sendero Products Import Batch {batch_num}\n")
            f.write(f"-- Products {i+1} to {min(i + batch_size, len(df))}\n\n")
            
            f.write("INSERT INTO products (\n")
            f.write("  external_id, upc_code, style_number, display_name, style_name,\n")
            f.write("  launch_season, base_color, marketing_color, product_type, msrp, wholesale_price\n")
            f.write(") VALUES\n")
            
            values = []
            for _, row in batch.iterrows():
                # Handle potential data issues
                upc_code = int(row['UPC Code']) if pd.notna(row['UPC Code']) else 0
                msrp_cents = int(row['MSRP'] * 100) if pd.notna(row['MSRP']) else 0
                wholesale = float(row['WHLS']) if pd.notna(row['WHLS']) else 0.0
                
                # Build value string
                value_parts = [
                    escape_sql_string(row['External ID']),
                    str(upc_code),
                    escape_sql_string(row['Style Number']),
                    escape_sql_string(row['Display Name']),
                    escape_sql_string(row['Style Name']),
                    escape_sql_string(row['Launch Season']),
                    escape_sql_string(row['Base Color']),
                    escape_sql_string(row['Marketing Color']),
                    escape_sql_string(row['Product Type']),
                    str(msrp_cents),
                    str(wholesale)
                ]
                
                values.append(f"({', '.join(value_parts)})")
            
            f.write(',\n'.join(values))
            f.write(';\n\n')
            f.write(f"-- Batch {batch_num} complete\n")
        
        print(f"✅ Generated {sql_file} with {len(batch)} products")
        batch_num += 1
    
    print(f"\n🎉 Generated {batch_num - 1} SQL batch files")
    print("📝 To import:")
    print("   1. Copy the contents of each SQL file")
    print("   2. Run them in order in Supabase SQL editor")
    print("   3. Or use the mcp_supabase_execute_sql function")

if __name__ == "__main__":
    generate_insert_statements() 