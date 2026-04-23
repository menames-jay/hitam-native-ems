"use client";

import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsChartsProps {
  trendData: any[];
  categoryData: any[];
  theme: any;
}

export function AnalyticsCharts({ trendData, categoryData, theme }: AnalyticsChartsProps) {
  const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* Participation Trends (Area Chart) */}
      <div className="lg:col-span-2 bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
           <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Participation Trends</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily Registration Volume • Last 30 Days</p>
           </div>
           <button className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <span className="material-symbols-outlined text-sm">filter_list</span>
           </button>
        </div>

        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.accent.replace('bg-[', '').replace(']', '') || '#10b981'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={theme.accent.replace('bg-[', '').replace(']', '') || '#10b981'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
                tickFormatter={(str) => new Date(str).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke={theme.accent.replace('bg-[', '').replace(']', '') || '#10b981'} 
                fillOpacity={1} 
                fill="url(#colorCount)" 
                strokeWidth={4}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Distribution (Pie Chart) */}
      <div className="bg-white dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/10 shadow-sm space-y-8 flex flex-col">
        <div>
           <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight italic uppercase">Event Mix</h3>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volume by Institutional Category</p>
        </div>

        <div className="flex-grow flex items-center justify-center">
           <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="count"
                    nameKey="category"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '1.5rem', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '10px', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="space-y-3">
           {categoryData.map((item, idx) => (
             <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.category}</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">{item.count}</span>
             </div>
           ))}
        </div>
      </div>

    </div>
  );
}
