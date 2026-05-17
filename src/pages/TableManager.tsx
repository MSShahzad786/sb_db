import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { TableProperties } from 'lucide-react'

export default function TableManager() {
  const [tables, setTables] = useState<string[]>([])
  const [newTableName, setNewTableName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchTables()
  }, [])

  const fetchTables = async () => {
    const { data, error } = await supabase.rpc('get_tables')
    if (!error && data) {
      setTables(data)
    }
  }

  const handleCreateTable = async () => {
    if (!newTableName.trim()) return
    setLoading(true)

    // Using exec_sql RPC
    const query = `CREATE TABLE IF NOT EXISTS public."${newTableName}" (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, created_at timestamp with time zone DEFAULT now());`
    const { error } = await supabase.rpc('exec_sql', { query })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Table ${newTableName} created`)
      setNewTableName('')
      fetchTables()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Table Manager</h2>
        <p className="text-muted-foreground mt-2">
          Create and manage database tables and schemas.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Table</CardTitle>
            <CardDescription>
              Create a new table with an auto-generated UUID primary key and created_at timestamp.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Table Name</label>
              <Input 
                placeholder="e.g. products" 
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateTable} disabled={loading}>
              <TableProperties className="h-4 w-4 mr-2" />
              {loading ? 'Creating...' : 'Create Table'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Tables</CardTitle>
            <CardDescription>
              Select a table from Database Explorer to view or alter its columns.
            </CardDescription>
          </CardHeader>
          <CardContent>
             {tables.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                 {tables.map(t => (
                   <div key={t} className="px-3 py-1 bg-muted rounded-full text-sm">
                     {t}
                   </div>
                 ))}
               </div>
             ) : (
               <p className="text-sm text-muted-foreground">No tables found or get_tables RPC not configured.</p>
             )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
