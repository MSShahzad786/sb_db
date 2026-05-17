import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Play, Save, History, Trash2, Search, Terminal } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface SavedQuery {
  id: string
  name: string
  sql: string
}

export default function SqlEditor() {
  const [query, setQuery] = useState('SELECT * FROM information_schema.tables LIMIT 10;')
  const [results, setResults] = useState<any[]>([])
  const [columns, setColumns] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([])
  const [queryHistory, setQueryHistory] = useState<string[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('sb_admin_saved_queries')
    if (saved) setSavedQueries(JSON.parse(saved))
    
    const history = localStorage.getItem('sb_admin_query_history')
    if (history) setQueryHistory(JSON.parse(history))
  }, [])

  const saveToHistory = (sql: string) => {
    const newHistory = [sql, ...queryHistory.filter(h => h !== sql)].slice(0, 19)
    setQueryHistory(newHistory)
    localStorage.setItem('sb_admin_query_history', JSON.stringify(newHistory))
  }

  const deleteFromHistory = (indexToDelete: number) => {
    const newHistory = queryHistory.filter((_, i) => i !== indexToDelete)
    setQueryHistory(newHistory)
    localStorage.setItem('sb_admin_query_history', JSON.stringify(newHistory))
  }

  const clearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all history?')) {
      setQueryHistory([])
      localStorage.setItem('sb_admin_query_history', JSON.stringify([]))
    }
  }

  const executeQuery = async () => {
    if (!query.trim()) return
    setLoading(true)
    saveToHistory(query)

    try {
      const { data, error } = await supabase.rpc('exec_sql', { query })

      if (error) {
        toast.error(error.message)
        setResults([])
        setColumns([])
      } else {
        toast.success('Query executed successfully')
        if (data && data.length > 0) {
          setResults(data)
          setColumns(Object.keys(data[0]))
        } else {
          setResults([])
          setColumns([])
        }
      }
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveQuery = () => {
    const name = window.prompt('Enter a name for this query')
    if (!name) return

    const newQuery = { id: Date.now().toString(), name, sql: query }
    const updated = [...savedQueries, newQuery]
    setSavedQueries(updated)
    localStorage.setItem('sb_admin_saved_queries', JSON.stringify(updated))
    toast.success('Query saved')
  }

  const deleteSavedQuery = (id: string) => {
    const updated = savedQueries.filter(q => q.id !== id)
    setSavedQueries(updated)
    localStorage.setItem('sb_admin_saved_queries', JSON.stringify(updated))
  }

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-y-auto pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">SQL Editor</h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Powerful SQL interface to manage your database directly.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveQuery} className="flex-1 sm:flex-none">
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          <Button onClick={executeQuery} disabled={loading} className="flex-1 sm:flex-none shadow-lg shadow-primary/20">
            <Play className={`h-4 w-4 mr-2 ${loading ? 'animate-pulse' : ''}`} />
            {loading ? 'Executing...' : 'Run'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="col-span-1 lg:col-span-9 flex flex-col gap-6">
          <Card className="flex-1 flex flex-col border-primary/10 glassmorphism overflow-hidden">
            <CardHeader className="py-3 border-b bg-muted/30">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Terminal className="h-4 w-4 text-primary" />
                Editor
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-full p-6 bg-transparent font-mono text-sm resize-none focus:outline-none leading-relaxed"
                spellCheck={false}
                placeholder="SELECT * FROM table_name..."
              />
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden flex flex-col border-primary/10 glassmorphism">
            <CardHeader className="py-3 border-b bg-muted/30 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Results {results.length > 0 && `(${results.length})`}</CardTitle>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setResults([])}>Clear</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-auto">
              {results.length > 0 ? (
                <Table>
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
                    <TableRow>
                      {columns.map(col => (
                        <TableHead key={col} className="whitespace-nowrap">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((row, i) => (
                      <TableRow key={i}>
                        {columns.map(col => (
                          <TableCell key={col} className="max-w-[300px] truncate">
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? '')}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 gap-3 opacity-50">
                  <Search className="h-10 w-10" />
                  <p>Run a query to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 lg:col-span-3 flex flex-col gap-6 lg:overflow-hidden h-[600px] lg:h-auto">
          <Card className="border-primary/10 glassmorphism flex flex-col max-h-[50%] shrink-0">
            <CardHeader className="py-3 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Save className="h-4 w-4" />
                Saved Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 overflow-y-auto">
              <div className="space-y-1">
                {savedQueries.map(q => (
                  <div key={q.id} className="group flex items-center justify-between p-2 hover:bg-muted rounded-md transition-colors cursor-pointer" onClick={() => setQuery(q.sql)}>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium truncate">{q.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive" onClick={(e) => { e.stopPropagation(); deleteSavedQuery(q.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {savedQueries.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">No saved queries</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/10 glassmorphism flex flex-col flex-1 overflow-hidden min-h-[300px]">
            <CardHeader className="py-3 border-b flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </CardTitle>
              {queryHistory.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={clearAllHistory}>
                  Clear All
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-2 overflow-y-auto">
              <div className="space-y-1">
                {queryHistory.map((sql, i) => (
                  <div key={i} className="group flex items-start justify-between p-2 hover:bg-muted rounded-md transition-colors cursor-pointer" onClick={() => setQuery(sql)}>
                    <p className="text-xs font-mono text-muted-foreground line-clamp-2 pr-2 break-all">{sql}</p>
                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-100 lg:opacity-0 group-hover:opacity-100 text-destructive shrink-0" onClick={(e) => { e.stopPropagation(); deleteFromHistory(i); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {queryHistory.length === 0 && <p className="text-xs text-muted-foreground p-4 text-center">No history yet</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
