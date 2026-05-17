import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RefreshCw, Plus, Search, Trash2, Edit, Download, MoreHorizontal, Database } from 'lucide-react'
import toast from 'react-hot-toast'
import { useTableSchema } from '@/hooks/useTableSchema'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DatabaseExplorer() {
  const { tableName } = useParams()
  const navigate = useNavigate()
  
  const [tables, setTables] = useState<string[]>([])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  
  const { columns, loading: schemaLoading } = useTableSchema(tableName)
  
  // CRUD States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [currentRow, setCurrentRow] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  const fetchTables = async () => {
    const { data, error } = await supabase.rpc('get_tables')
    if (error) {
      console.error(error)
      setTables(['users', 'posts', 'products']) 
    } else if (data) {
      setTables(data)
    }
  }

  // Fetch all tables
  useEffect(() => {
    fetchTables()
  }, [])

  // Fetch table data
  const fetchData = async () => {
    if (!tableName) return
    setLoading(true)
    
    let query = supabase.from(tableName).select('*')
    
    if (search) {
      // Basic search on first text column if available
      const textCol = columns.find(c => c.data_type.includes('text') || c.data_type.includes('char'))?.column_name
      if (textCol) {
        query = query.ilike(textCol, `%${search}%`)
      }
    }

    const { data: tableData, error } = await query.limit(100)

    if (error) {
      toast.error(error.message)
    } else {
      setData(tableData || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [tableName, search])

  const handleDelete = async (row: any) => {
    if (!window.confirm('Are you sure you want to delete this row?')) return
    
    // Attempt to find primary key, default to 'id'
    const pk = columns.find(c => c.column_name === 'id' || c.column_name === 'uuid')?.column_name || columns[0].column_name
    
    const { error } = await supabase
      .from(tableName!)
      .delete()
      .eq(pk, row[pk])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Row deleted')
      fetchData()
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const { error } = await supabase
      .from(tableName!)
      .insert(formData)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Row added successfully')
      setIsAddModalOpen(false)
      setFormData({})
      fetchData()
    }
    setLoading(false)
  }

  const handleUpdate = async () => {
    setLoading(true)
    const pk = columns.find(c => c.column_name === 'id' || c.column_name === 'uuid')?.column_name || columns[0].column_name
    
    const { error } = await supabase
      .from(tableName!)
      .update(formData)
      .eq(pk, currentRow[pk])

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Row updated successfully')
      setIsEditModalOpen(false)
      setCurrentRow(null)
      setFormData({})
      fetchData()
    }
    setLoading(false)
  }

  const exportData = (format: 'json' | 'csv') => {
    const blob = format === 'json' 
      ? new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      : new Blob([data.map(r => Object.values(r).join(',')).join('\n')], { type: 'text/csv' })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${tableName}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex h-full gap-6">
      {/* Tables Sidebar */}
      <Card className="w-64 flex-shrink-0 h-[calc(100vh-8rem)] flex flex-col glassmorphism border-primary/20">
        <CardHeader className="py-4 border-b">
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} onClick={fetchTables} />
            Tables
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto p-2 space-y-1">
          {tables.map(table => (
            <button
              key={table}
              onClick={() => navigate(`/explorer/${table}`)}
              className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-all ${
                tableName === table 
                  ? 'bg-primary text-primary-foreground shadow-md scale-[1.02]' 
                  : 'hover:bg-muted/50'
              }`}
            >
              {table}
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Main Data Area */}
      <Card className="flex-1 h-[calc(100vh-8rem)] flex flex-col overflow-hidden glassmorphism">
        {tableName ? (
          <>
            <CardHeader className="py-4 border-b space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl">{tableName}</CardTitle>
                  <span className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
                    {data.length} rows
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => exportData('json')}>JSON</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportData('csv')}>CSV</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button size="sm" onClick={() => { setFormData({}); setIsAddModalOpen(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Row
                  </Button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search records..."
                    className="pl-8 bg-background/50"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto p-0">
              {loading || schemaLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground animate-pulse">Fetching records...</p>
                </div>
              ) : data.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                  <Search className="h-12 w-12 opacity-20" />
                  <p>No data found in {tableName}</p>
                </div>
              ) : (
                <div className="relative">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background/80 backdrop-blur-sm z-10">
                      <TableRow>
                        {columns.map(col => (
                          <TableHead key={col.column_name} className="font-bold">
                            <div className="flex flex-col">
                              <span>{col.column_name}</span>
                              <span className="text-[10px] font-normal text-muted-foreground uppercase">{col.data_type}</span>
                            </div>
                          </TableHead>
                        ))}
                        <TableHead className="w-[100px] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((row, i) => (
                        <TableRow key={i} className="group hover:bg-primary/5 transition-colors">
                          {columns.map(col => (
                            <TableCell key={col.column_name} className="max-w-[250px] truncate py-3">
                              {typeof row[col.column_name] === 'object' 
                                ? <code className="text-[10px] bg-muted p-1 rounded">{JSON.stringify(row[col.column_name])}</code>
                                : String(row[col.column_name] ?? '')
                              }
                            </TableCell>
                          ))}
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => { setCurrentRow(row); setFormData(row); setIsEditModalOpen(true); }}>
                                  <Edit className="h-4 w-4 mr-2" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(row)}>
                                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-4">
            <Database className="h-16 w-16 opacity-10" />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground">No Table Selected</h3>
              <p>Select a table from the sidebar to start exploring your data</p>
            </div>
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={(open) => { if(!open) { setIsAddModalOpen(false); setIsEditModalOpen(false); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isAddModalOpen ? 'Add New Row' : 'Edit Row'}</DialogTitle>
            <DialogDescription>
              {tableName}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {columns.map(col => {
              if (col.column_name === 'created_at' || col.column_name === 'id' && isAddModalOpen) return null;
              return (
                <div key={col.column_name} className="grid gap-2">
                  <label className="text-sm font-medium leading-none">{col.column_name}</label>
                  <Input
                    placeholder={col.data_type}
                    value={formData[col.column_name] || ''}
                    onChange={(e) => setFormData({ ...formData, [col.column_name]: e.target.value })}
                  />
                </div>
              )
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</Button>
            <Button onClick={isAddModalOpen ? handleSave : handleUpdate}>{isAddModalOpen ? 'Save Row' : 'Update Row'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
