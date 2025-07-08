#!/usr/bin/env python3
"""
Sendero Product Data Analyzer
Reads the SP26 UPC List Excel file and analyzes its structure for Supabase database design
"""

import pandas as pd
import json
import os
from pathlib import Path

def analyze_sendero_data():
    """Analyze the Sendero product data Excel file"""
    
    # Path to the Excel file
    excel_path = r"C:\Users\tglas\OneDrive\Desktop\reporder\SP26 UPC List (2).xlsx"
    
    if not os.path.exists(excel_path):
        print(f"❌ File not found: {excel_path}")
        return None
    
    try:
        print("📊 Reading Sendero Product Data Excel file...")
        
        # Read the Excel file
        # Try to read all sheets first to see the structure
        xl_file = pd.ExcelFile(excel_path)
        print(f"📄 Found {len(xl_file.sheet_names)} sheet(s): {xl_file.sheet_names}")
        
        # Read the first sheet (assuming it contains the main data)
        df = pd.read_excel(excel_path, sheet_name=0)
        
        print(f"\n📈 Data Overview:")
        print(f"   • Total rows: {len(df)}")
        print(f"   • Total columns: {len(df.columns)}")
        
        print(f"\n🏗️  Column Structure:")
        for i, col in enumerate(df.columns):
            print(f"   {i+1}. {col} ({df[col].dtype})")
        
        print(f"\n🔍 Sample Data (first 5 rows):")
        print(df.head().to_string())
        
        print(f"\n📊 Data Analysis:")
        print(f"   • Non-null counts per column:")
        for col in df.columns:
            non_null = df[col].notna().sum()
            print(f"     - {col}: {non_null}/{len(df)} ({non_null/len(df)*100:.1f}%)")
        
        # Export sample data as JSON for analysis
        sample_data = df.head(10).fillna("").to_dict(orient='records')
        
        # Create analysis report
        analysis = {
            "file_info": {
                "path": excel_path,
                "sheets": xl_file.sheet_names,
                "total_rows": len(df),
                "total_columns": len(df.columns)
            },
            "columns": [
                {
                    "name": col,
                    "dtype": str(df[col].dtype),
                    "non_null_count": int(df[col].notna().sum()),
                    "null_percentage": round((df[col].isna().sum() / len(df)) * 100, 2),
                    "unique_values": int(df[col].nunique()) if df[col].dtype != 'object' or df[col].nunique() < 50 else "50+"
                }
                for col in df.columns
            ],
            "sample_data": sample_data
        }
        
        # Save analysis to JSON file
        output_path = "sendero_data_analysis.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Analysis saved to: {output_path}")
        
        # Export full data as CSV for easier processing
        csv_path = "sendero_products.csv"
        df.to_csv(csv_path, index=False)
        print(f"✅ Full data exported to: {csv_path}")
        
        return analysis
        
    except Exception as e:
        print(f"❌ Error reading Excel file: {str(e)}")
        return None

if __name__ == "__main__":
    print("🔍 Analyzing Sendero Product Data...")
    analysis = analyze_sendero_data()
    
    if analysis:
        print("\n🎯 Recommendations for Supabase Schema:")
        print("   1. Create 'products' table with columns based on Excel structure")
        print("   2. Add proper data types and constraints")
        print("   3. Create indexes for frequently queried fields (SKU, UPC)")
        print("   4. Consider normalization for categories/brands if needed")
        print("\n✅ Ready to create Supabase database schema!")
    else:
        print("\n❌ Analysis failed - please check file path and permissions") 