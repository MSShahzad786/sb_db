import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, Database, Table as TableIcon, Users, ArrowUpRight, TrendingUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const data = [
  { name: 'Mon', queries: 400 },
  { name: 'Tue', queries: 300 },
  { name: 'Wed', queries: 200 },
  { name: 'Thu', queries: 278 },
  { name: 'Fri', queries: 189 },
  { name: 'Sat', queries: 239 },
  { name: 'Sun', queries: 349 },
]

export default function Dashboard() {
  const [stats, setStats] = useState({
    tables: 0,
    rows: 0,
    storageSize: '124 MB',
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: tables } = await supabase.rpc('get_tables')
        if (tables) {
          setStats(s => ({ ...s, tables: tables.length }))
        }
      } catch (e) {
        console.error('Could not fetch stats', e)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: 'Total Tables',
      value: stats.tables.toString(),
      icon: TableIcon,
      trend: '+12%',
      color: 'text-blue-500',
    },
    {
      title: 'API Requests',
      value: '2.4k',
      icon: Activity,
      trend: '+5.4%',
      color: 'text-green-500',
    },
    {
      title: 'Database Size',
      value: stats.storageSize,
      icon: Database,
      trend: '+0.2%',
      color: 'text-purple-500',
    },
    {
      title: 'Active Users',
      value: '842',
      icon: Users,
      trend: '+18%',
      color: 'text-orange-500',
    },
  ]

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Project Overview
        </h2>
        <p className="text-muted-foreground">
          Real-time insights and system health for your Supabase project.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, i) => (
          <Card key={i} className="hover:shadow-lg transition-all duration-300 border-primary/10 glassmorphism group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-background/50 group-hover:scale-110 transition-transform ${card.color}`}>
                <card.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{card.value}</div>
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-medium text-green-500 flex items-center">
                  <ArrowUpRight className="h-3 w-3" />
                  {card.trend}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">vs last week</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-primary/10 glassmorphism">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>API Traffic</CardTitle>
                <CardDescription>Database requests over the last 7 days</CardDescription>
              </div>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="queries" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorQueries)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 border-primary/10 glassmorphism">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Live status monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Database Connectivity</span>
                <span className="text-green-500 font-medium">Healthy</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[98%] transition-all" />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Storage Utilization</span>
                <span>84%</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 w-[84%] transition-all" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>API Latency</span>
                <span>42ms</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[30%] transition-all" />
              </div>
            </div>

            <div className="pt-4 border-t border-primary/10">
              <h4 className="text-sm font-semibold mb-3">Recent Logs</h4>
              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">Successfully synced table "users"</span>
                    <span className="ml-auto text-[10px] opacity-50">2m ago</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
