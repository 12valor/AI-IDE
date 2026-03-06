with open('sales_analysis.ipynb', 'r', encoding='utf-8') as f:
    content = f.read()

target1 = '"# Sales Analysis for Dec, Jan, Feb, Jun, Jul, Aug, Sep, Oct, Nov\\n",'
replacement1 = '"# Comprehensive Sales Analysis\\n",'

target2 = '"This notebook analyzes the sales files, and provides insights into monthly trends, top items, and categories."'
replacement2 = '"This notebook analyzes all historical sales files, and provides insights into monthly trends, top items, and categories."'

target3 = """   "source": [
    "import pandas as pd\\n",
    "import matplotlib.pyplot as plt\\n",
    "import seaborn as sns\\n",
    "\\n",
    "# Set plot style\\n",
    "sns.set_theme(style=\\"whitegrid\\")\\n",
    "\\n",
    "# Load the CSV files and combine them\\n",
    "df_dec = pd.read_csv('data/dec_sales.csv')\\n",
    "df_jan = pd.read_csv('data/jan_sales.csv')\\n",
    "df_feb = pd.read_csv('data/feb_sales.csv')\\n",
    "df_jun = pd.read_csv('data/jun_sales.csv')\\n",
    "df_jul = pd.read_csv('data/jul_sales.csv')\\n",
    "df_aug = pd.read_csv('data/aug_sales.csv')\\n",
    "df_sep = pd.read_csv('data/sep_sales.csv')\\n",
    "df_oct = pd.read_csv('data/oct_sales.csv')\\n",
    "df_nov = pd.read_csv('data/nov_sales.csv')\\n",
    "df = pd.concat([df_dec, df_jan, df_feb, df_jun, df_jul, df_aug, df_sep, df_oct, df_nov], ignore_index=True)\\n",
    "\\n",
    "# Convert Date and Time to datetime objects\\n",
    "df['Date and Time'] = pd.to_datetime(df['Date and Time'])\\n",
    "# Add a Year-Month column for easier grouping\\n",
    "df['Month'] = df['Date and Time'].dt.to_period('M').astype(str)"
   ]"""

replacement3 = """   "source": [
    "import pandas as pd\\n",
    "import matplotlib.pyplot as plt\\n",
    "import seaborn as sns\\n",
    "import glob\\n",
    "\\n",
    "# Set plot style\\n",
    "sns.set_theme(style=\\"whitegrid\\")\\n",
    "\\n",
    "# Load the CSV files and combine them\\n",
    "csv_files = glob.glob('data/*sales.csv')\\n",
    "dfs = [pd.read_csv(f) for f in csv_files]\\n",
    "df = pd.concat(dfs, ignore_index=True)\\n",
    "\\n",
    "# Convert Date and Time to datetime objects\\n",
    "df['Date and Time'] = pd.to_datetime(df['Date and Time'])\\n",
    "# Add a Year-Month column for easier grouping\\n",
    "df['Month'] = df['Date and Time'].dt.to_period('M').astype(str)"
   ]"""

content = content.replace(target1, replacement1)
content = content.replace(target2, replacement2)
content = content.replace(target3, replacement3)

with open('sales_analysis.ipynb', 'w', encoding='utf-8') as f:
    f.write(content)
