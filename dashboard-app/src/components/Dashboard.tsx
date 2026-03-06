"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

type Transaction = {
  "Date and Time": string;
  "Buyer User Id": number;
  "Asset Name": string;
  "Asset Type": string;
  "Price": number;
  "Revenue": number;
  "Location": string;
};

const MetricCard = ({ title, value, change, sparklineData, format = 'number', prefix = '' }: any) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
       <div className="flex justify-between items-start mb-4 relative z-10">
         <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{title}</h3>
         {change !== undefined && (
           <div className={`px-2 py-1 rounded-full flex items-center text-[10px] font-bold ${change >= 0 ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
             {change >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
             {Math.abs(change).toFixed(1)}%
           </div>
         )}
       </div>
       <div className="flex items-baseline space-x-2 relative z-10">
         <span className="text-3xl font-semibold text-gray-900 tracking-tight">
           {prefix}{format === 'number' ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : value.toFixed(2)}
         </span>
       </div>
       
       {sparklineData && (
         <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none">
           <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={sparklineData}>
               <defs>
                 <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                   <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.3}/>
                   <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                 </linearGradient>
               </defs>
               <Area type="monotone" dataKey="value" stroke="#1e3a8a" strokeWidth={2} fill={`url(#gradient-${title.replace(/\s+/g, '')})`} isAnimationActive={true} />
             </AreaChart>
           </ResponsiveContainer>
         </div>
       )}
    </div>
  );
};

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [compareMonth, setCompareMonth] = useState('None');

  useEffect(() => {
    fetch('/dashboard_data.json')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50/50">
      <div className="text-sm font-medium text-gray-400 uppercase tracking-widest flex items-center">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-800 rounded-full animate-spin mr-3"></div>
        Loading Analytics...
      </div>
    </div>
  );

  const { monthly_data, top_items, category_revenue, recent_transactions } = data;

  // Filter Data
  const filteredMonthly = selectedMonth === 'All' 
    ? monthly_data 
    : monthly_data.filter((m: any) => m.month === selectedMonth);

  // Totals for selected month(s)
  const currentTotalRevenue = filteredMonthly.reduce((sum: number, m: any) => sum + m.revenue, 0);
  const currentTotalTransactions = filteredMonthly.reduce((sum: number, m: any) => sum + m.transactions, 0);
  const currentUniqueBuyers = filteredMonthly.reduce((sum: number, m: any) => sum + m.unique_buyers, 0);
  const currentAOV = currentTotalTransactions ? currentTotalRevenue / currentTotalTransactions : 0;

  // Sparkline Data
  const revenueSparkline = monthly_data.map((d: any) => ({ value: d.revenue }));
  const txSparkline = monthly_data.map((d: any) => ({ value: d.transactions }));
  const aovSparkline = monthly_data.map((d: any) => ({ value: d.transactions ? d.revenue / d.transactions : 0 }));

  // Comparison Logic
  let comparisonStats = null;
  if (compareMonth !== 'None') {
    const compareData = monthly_data.filter((m: any) => m.month === compareMonth);
    const prevRevenue = compareData.reduce((sum: number, m: any) => sum + m.revenue, 0);
    const prevTransactions = compareData.reduce((sum: number, m: any) => sum + m.transactions, 0);
    const prevAOV = prevTransactions ? prevRevenue / prevTransactions : 0;
    
    // Calculate percentage change
    const revChange = prevRevenue ? ((currentTotalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const txChange = prevTransactions ? ((currentTotalTransactions - prevTransactions) / prevTransactions) * 100 : 0;
    const aovChange = prevAOV ? ((currentAOV - prevAOV) / prevAOV) * 100 : 0;
    
    comparisonStats = {
      isComparing: true,
      revChange, txChange, aovChange,
      prevRevenue, prevTransactions, prevAOV
    };
  }

  const COLORS = ['#1e3a8a', '#0f766e', '#6d28d9', '#475569', '#3b82f6'];

  // YoY Line Chart Data
  const yoyData = (() => {
    const months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return months.map((m, i) => {
      const dataPoint: any = { name: monthNames[i] };
      monthly_data.forEach((d: any) => {
        const parts = d.month.split('-');
        if (parts.length === 2) {
          const year = parts[0];
          const month = parts[1];
          if (month === m) {
            dataPoint[year] = d.revenue;
          }
        }
      });
      return dataPoint;
    });
  })();

  const locationTrendData = monthly_data.map((d: any) => ({
    month: d.month,
    Game: d.location_sales?.Game || 0,
    Website: d.location_sales?.Website || d.revenue - (d.location_sales?.Game || 0),
  }));

  const topProductsData = top_items.slice(0, 5).map((d: any) => ({
    name: d['Asset Name'].length > 20 ? d['Asset Name'].substring(0, 20) + '...' : d['Asset Name'],
    Revenue: d.revenue,
    Sales: d.sales
  }));

  return (
    <div className="p-8 max-w-[1500px] mx-auto bg-white text-gray-900 min-h-screen font-sans">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-100 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sales Intelligence</h1>
          <p className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-semibold block">Comprehensive Analysis & Transactions</p>
        </div>
        
        <div className="flex items-center space-x-6 mt-6 md:mt-0">
          <div className="flex flex-col space-y-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Filter</label>
             <select 
                className="appearance-none border-0 border-b-2 border-gray-200 py-1.5 pr-8 bg-transparent text-sm font-semibold text-gray-700 focus:ring-0 focus:border-gray-900 outline-none cursor-pointer transition-colors"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
             >
                <option value="All">All Time</option>
                {monthly_data.map((d: any) => (
                  <option key={d.month} value={d.month}>{d.month}</option>
                ))}
             </select>
          </div>

          <div className="flex flex-col space-y-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Compare Against</label>
             <select 
                className="appearance-none border-0 border-b-2 border-gray-200 py-1.5 pr-8 bg-transparent text-sm font-semibold text-gray-700 focus:ring-0 focus:border-gray-900 outline-none cursor-pointer transition-colors"
                value={compareMonth}
                onChange={(e) => setCompareMonth(e.target.value)}
             >
                <option value="None">None</option>
                {monthly_data.map((d: any) => (
                  <option key={d.month + "_comp"} value={d.month}>{d.month}</option>
                ))}
             </select>
          </div>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Revenue" 
          value={currentTotalRevenue} 
          change={comparisonStats?.revChange} 
          prefix="$" 
          format="number"
          sparklineData={revenueSparkline}
        />
        <MetricCard 
          title="Total Transactions" 
          value={currentTotalTransactions} 
          change={comparisonStats?.txChange} 
          format="number"
          sparklineData={txSparkline}
        />
        <MetricCard 
          title="Avg Order Value" 
          value={currentAOV} 
          change={comparisonStats?.aovChange} 
          prefix="$" 
          format="decimal"
          sparklineData={aovSparkline}
        />
        <MetricCard 
          title="Unique Buyers" 
          value={currentUniqueBuyers} 
          format="number"
          sparklineData={txSparkline}
        />
      </div>

      {/* Dedicated Comparison Section */}
      {comparisonStats && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-teal-600"></div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Period Comparison</h2>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-50 text-slate-600 rounded-full border border-slate-100">
              {selectedMonth === 'All' ? 'All Time' : selectedMonth} <span className="text-slate-400 font-normal mx-1">vs.</span> {compareMonth}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                <span className="text-sm font-medium text-gray-500">Revenue</span>
                <span className={`text-sm font-bold ${comparisonStats.revChange >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                  {comparisonStats.revChange >= 0 ? '+' : ''}{comparisonStats.revChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] uppercase text-gray-400 font-bold">{selectedMonth === 'All' ? 'All' : selectedMonth}</div>
                    <div className="text-xs font-semibold text-gray-900">${currentTotalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(100, (currentTotalRevenue / Math.max(currentTotalRevenue, comparisonStats.prevRevenue)) * 100)}%`}}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                     <div className="text-[10px] uppercase text-gray-400 font-bold">{compareMonth}</div>
                     <div className="text-xs font-semibold text-gray-900">${comparisonStats.prevRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.min(100, (comparisonStats.prevRevenue / Math.max(currentTotalRevenue, comparisonStats.prevRevenue)) * 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                <span className="text-sm font-medium text-gray-500">Transactions</span>
                <span className={`text-sm font-bold ${comparisonStats.txChange >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                  {comparisonStats.txChange >= 0 ? '+' : ''}{comparisonStats.txChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] uppercase text-gray-400 font-bold">{selectedMonth === 'All' ? 'All' : selectedMonth}</div>
                    <div className="text-xs font-semibold text-gray-900">{currentTotalTransactions.toLocaleString()}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(100, (currentTotalTransactions / Math.max(currentTotalTransactions, comparisonStats.prevTransactions)) * 100)}%`}}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] uppercase text-gray-400 font-bold">{compareMonth}</div>
                    <div className="text-xs font-semibold text-gray-900">{comparisonStats.prevTransactions.toLocaleString()}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.min(100, (comparisonStats.prevTransactions / Math.max(currentTotalTransactions, comparisonStats.prevTransactions)) * 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-end border-b border-gray-50 pb-2">
                <span className="text-sm font-medium text-gray-500">Avg Order Value</span>
                <span className={`text-sm font-bold ${comparisonStats.aovChange >= 0 ? 'text-teal-600' : 'text-rose-600'}`}>
                  {comparisonStats.aovChange >= 0 ? '+' : ''}{comparisonStats.aovChange.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] uppercase text-gray-400 font-bold">{selectedMonth === 'All' ? 'All' : selectedMonth}</div>
                    <div className="text-xs font-semibold text-gray-900">${currentAOV.toFixed(2)}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-teal-600 rounded-full" style={{ width: `${Math.min(100, (currentAOV / Math.max(currentAOV, comparisonStats.prevAOV)) * 100)}%`}}></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <div className="text-[10px] uppercase text-gray-400 font-bold">{compareMonth}</div>
                    <div className="text-xs font-semibold text-gray-900">${comparisonStats.prevAOV.toFixed(2)}</div>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                     <div className="h-full bg-slate-300 rounded-full" style={{ width: `${Math.min(100, (comparisonStats.prevAOV / Math.max(currentAOV, comparisonStats.prevAOV)) * 100)}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue YoY & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Revenue YoY Trend</h2>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yoyData} margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="name" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '13px', fontWeight: 500 }}
                  formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, String(name)]}
                  cursor={{stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                <Line type="monotone" dataKey="2024" stroke="#94a3b8" strokeWidth={2} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="2025" stroke="#1e3a8a" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                <Line type="monotone" dataKey="2026" stroke="#0f766e" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-center relative">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest self-start">Category Distribution</h2>
          <div className="flex-1 min-h-[250px] w-full relative -mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_revenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={2}
                  dataKey="revenue"
                  nameKey="category"
                  stroke="none"
                >
                  {category_revenue.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '10px', fontSize: '13px', fontWeight: 500 }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-[-20px]">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Top Cat</span>
              <span className="text-xl font-bold text-gray-900 leading-none mt-1">{category_revenue[0]?.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Analytics: Stacked Area & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Location Revenue Over Time</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={locationTrendData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                <XAxis dataKey="month" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} dy={10} tickFormatter={(val) => val.substring(2)} />
                <YAxis tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val/1000}k`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '13px', fontWeight: 500 }}
                  formatter={(value: any, name: any) => [`$${Number(value).toLocaleString()}`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                <Area type="monotone" dataKey="Website" stackId="1" stroke="#1e3a8a" fill="#1e3a8a" fillOpacity={0.8} />
                <Area type="monotone" dataKey="Game" stackId="1" stroke="#0f766e" fill="#0f766e" fillOpacity={0.8} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Top Products by Revenue & Sales</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f8fafc" />
                <XAxis type="number" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{fill: '#64748b', fontSize: 11, fontWeight: 500}} axisLine={false} tickLine={false} dx={-10} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px', fontSize: '13px', fontWeight: 500 }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                <Bar dataKey="Revenue" fill="#6d28d9" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="Sales" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabular Data Section */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Transactions Log</h2>
            <p className="text-xs text-gray-500 mt-1 font-medium">Detailed breakdown of the most recent sales</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-400 uppercase bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Date & Time</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Buyer ID</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Asset Name</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Category</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Location</th>
                <th scope="col" className="px-6 py-4 text-right font-bold tracking-widest">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recent_transactions.slice(0, 15).map((tx: Transaction, i: number) => (
                <tr key={i} className="bg-white hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">{tx["Date and Time"]}</td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-500 group-hover:text-blue-600 transition-colors cursor-pointer">{tx["Buyer User Id"]}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{tx["Asset Name"]}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      tx["Asset Type"] === 'Pants' ? 'bg-purple-50 text-purple-700' :
                      tx["Asset Type"] === 'Shirt' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {tx["Asset Type"]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      tx["Location"] === 'Website' ? 'bg-teal-50 text-teal-700' : 'bg-orange-50 text-orange-700'
                    }`}>
                      {tx["Location"]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">${tx["Revenue"].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50/50 text-center text-xs text-gray-400 font-semibold border-t border-gray-100 uppercase tracking-widest">
            Showing top 15 recent transactions
          </div>
        </div>
      </div>
    </div>
  );
}
