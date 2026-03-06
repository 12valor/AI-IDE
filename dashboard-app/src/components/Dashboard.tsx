"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

type Transaction = {
  "Date and Time": string;
  "Buyer User Id": number;
  "Asset Name": string;
  "Asset Type": string;
  "Price": number;
  "Revenue": number;
  "Location": string;
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
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading Analytics...</div>
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

  // Comparison Logic
  let comparisonStats = null;
  if (compareMonth !== 'None') {
    const compareData = monthly_data.filter((m: any) => m.month === compareMonth);
    const prevRevenue = compareData.reduce((sum: number, m: any) => sum + m.revenue, 0);
    const prevTransactions = compareData.reduce((sum: number, m: any) => sum + m.transactions, 0);
    
    // Calculate percentage change
    const revChange = prevRevenue ? ((currentTotalRevenue - prevRevenue) / prevRevenue) * 100 : 0;
    const txChange = prevTransactions ? ((currentTotalTransactions - prevTransactions) / prevTransactions) * 100 : 0;
    
    comparisonStats = {
      isComparing: true,
      revenueChange: revChange,
      txChange: txChange,
      prevRevenue
    };
  }

  const COLORS = ['#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db'];

  return (
    <div className="p-8 max-w-[1400px] mx-auto bg-white text-gray-900 min-h-screen font-sans">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end border-b border-gray-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 uppercase">Sales Intelligence</h1>
          <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Comprehensive Analysis & Transactions</p>
        </div>
        
        <div className="flex items-center space-x-6 mt-6 md:mt-0">
          <div className="flex flex-col space-y-1">
             <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Primary Filter</label>
             <select 
                className="appearance-none border-0 border-b-2 border-gray-300 py-1 pr-8 bg-transparent text-sm font-medium focus:ring-0 focus:border-gray-900 outline-none cursor-pointer"
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
                className="appearance-none border-0 border-b-2 border-gray-300 py-1 pr-8 bg-transparent text-sm font-medium focus:ring-0 focus:border-gray-900 outline-none cursor-pointer"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Revenue</h3>
          <div className="flex items-baseline space-x-3">
             <span className="text-3xl font-light text-gray-900">${currentTotalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
             {comparisonStats && (
                <span className={`text-sm font-medium ${comparisonStats.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparisonStats.revenueChange >= 0 ? '+' : ''}{comparisonStats.revenueChange.toFixed(1)}%
                </span>
             )}
          </div>
          {comparisonStats && <div className="text-xs text-gray-400 mt-1 uppercase">vs. ${comparisonStats.prevRevenue.toLocaleString()} in {compareMonth}</div>}
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Total Transactions</h3>
          <div className="flex items-baseline space-x-3">
             <span className="text-3xl font-light text-gray-900">{currentTotalTransactions.toLocaleString()}</span>
             {comparisonStats && (
                <span className={`text-sm font-medium ${comparisonStats.txChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {comparisonStats.txChange >= 0 ? '+' : ''}{comparisonStats.txChange.toFixed(1)}%
                </span>
             )}
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Top Performer</h3>
          <span className="text-lg font-medium text-gray-900 block truncate">{top_items[0]?.[`Asset Name`]}</span>
          <span className="text-sm text-gray-500 block">Sales: {top_items[0]?.sales} units</span>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 border border-gray-200 p-6 bg-white">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest">Revenue Growth Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={filteredMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                <YAxis tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '0', border: '1px solid #e5e7eb', boxShadow: 'none', padding: '12px', fontSize: '12px', fontWeight: 500 }}
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                  cursor={{stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4'}}
                />
                <Area type="monotone" dataKey="revenue" stroke="#111827" strokeWidth={2} fillOpacity={0.05} fill="#111827" activeDot={{r: 4, strokeWidth: 0}} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="border border-gray-200 p-6 bg-white flex flex-col items-center">
          <h2 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-widest self-start">Category Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={category_revenue}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={1}
                  dataKey="revenue"
                  nameKey="category"
                  stroke="none"
                >
                  {category_revenue.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '0', border: '1px solid #e5e7eb', boxShadow: 'none', padding: '10px', fontSize: '12px' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }} iconType="square" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tabular Data Section */}
      <div className="border border-gray-200 bg-white">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Recent Transactions Log</h2>
          <p className="text-xs text-gray-500 mt-1">Raw dataset preview showing latest sales records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-900 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Date & Time</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Buyer ID</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Asset Name</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Category</th>
                <th scope="col" className="px-6 py-4 font-bold tracking-widest">Location</th>
                <th scope="col" className="px-6 py-4 text-right font-bold tracking-widest">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {recent_transactions.slice(0, 15).map((tx: Transaction, i: number) => (
                <tr key={i} className="bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 whitespace-nowrap text-xs">{tx["Date and Time"]}</td>
                  <td className="px-6 py-3 font-mono text-xs">{tx["Buyer User Id"]}</td>
                  <td className="px-6 py-3 font-medium text-gray-900">{tx["Asset Name"]}</td>
                  <td className="px-6 py-3">{tx["Asset Type"]}</td>
                  <td className="px-6 py-3">{tx["Location"]}</td>
                  <td className="px-6 py-3 text-right font-medium text-gray-900">${tx["Revenue"].toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-4 bg-gray-50 text-center text-xs text-gray-500 border-t border-gray-200 uppercase tracking-widest">
            Showing top 15 recent transactions
          </div>
        </div>
      </div>
    </div>
  );
}
