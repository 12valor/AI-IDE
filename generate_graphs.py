import pandas as pd
import json
import glob
import os

def generate_graphs():
    output_data = {}

    print("Loading CSV files...")
    # Load the CSV files and combine them dynamically
    csv_files = glob.glob('data/*sales.csv')
    dfs = [pd.read_csv(f) for f in csv_files]
    df = pd.concat(dfs, ignore_index=True)

    # Convert Date and Time to datetime objects
    df['Date and Time'] = pd.to_datetime(df['Date and Time'])
    # Add a Year-Month column for easier grouping
    df['Month'] = df['Date and Time'].dt.to_period('M').astype(str)
    
    # Sort dataset chronologically
    df = df.sort_values('Date and Time')

    print("Processing Monthly Data...")
    # Basic monthly groupings
    monthly_grouped = df.groupby('Month')
    
    monthly_data = []
    for month, group in monthly_grouped:
        revenue = group['Revenue'].sum()
        transactions = len(group)
        unique_buyers = group['Buyer User Id'].nunique()
        location_sales = group.groupby('Location')['Revenue'].sum().to_dict()
        
        monthly_data.append({
            'month': month,
            'revenue': revenue,
            'transactions': transactions,
            'unique_buyers': unique_buyers,
            'location_sales': location_sales
        })
        
    output_data['monthly_data'] = monthly_data

    print("Processing Item Data...")
    item_stats = df.groupby(['Asset Name', 'Asset Type']).agg(
        sales=('Asset Name', 'count'),
        revenue=('Revenue', 'sum')
    ).reset_index().sort_values('revenue', ascending=False)
    
    output_data['top_items'] = item_stats.head(50).to_dict(orient='records')
    
    print("Processing Category Data...")
    category_revenue = df.groupby('Asset Type')['Revenue'].sum().sort_values(ascending=False).to_dict()
    output_data['category_revenue'] = [{'category': k, 'revenue': v} for k, v in category_revenue.items()]
    
    print("Processing Recent Transactions...")
    df_recent = df.sort_values('Date and Time', ascending=False).head(100)
    # Convert datetime back to string for JSON serialization
    df_recent['Date and Time'] = df_recent['Date and Time'].dt.strftime('%Y-%m-%d %H:%M:%S')
    output_data['recent_transactions'] = df_recent.to_dict(orient='records')

    # Save to Next.js public directory
    output_path = 'dashboard-app/public/dashboard_data.json'
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(output_data, f, indent=4)
        
    print(f"All tracking data successfully saved to {output_path}.")

if __name__ == "__main__":
    generate_graphs()
