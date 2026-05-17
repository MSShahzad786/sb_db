import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ForeignKeySelectorProps {
  table: string
  column: string
  value: string
  onChange: (value: string) => void
}

export function ForeignKeySelector({ table, value, onChange }: ForeignKeySelectorProps) {
  const [options, setOptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOptions() {
      setLoading(true)
      // Try to find a name-like column to display
      // We'll fetch id and whatever looks like a name/title
      const { data: cols } = await supabase.rpc('get_table_schema', { t_name: table })
      const displayCol = cols?.find((c: any) => 
        ['sub_name', 'name', 'title', 'label', 'email'].includes(c.column_name)
      )?.column_name || 'id'

      const { data, error } = await supabase
        .from(table)
        .select(`id, ${displayCol}`)
        .order(displayCol, { ascending: true })
        .limit(100)

      if (!error && data) {
        setOptions((data as any[]).map(item => ({
          id: String(item.id),
          label: String(item[displayCol])
        })))
      }
      setLoading(false)
    }
    fetchOptions()
  }, [table])

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="h-8 text-xs bg-background/50">
        <SelectValue placeholder={loading ? "Loading..." : "Select relation..."} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.id} value={opt.id}>
            {opt.label} <span className="text-[10px] opacity-50 ml-2">({opt.id.slice(0, 8)}...)</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
