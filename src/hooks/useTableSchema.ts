import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export interface ColumnDefinition {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
  foreign_key_table?: string
  foreign_key_column?: string
}

export function useTableSchema(tableName: string | undefined) {
  const [columns, setColumns] = useState<ColumnDefinition[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!tableName) {
      setColumns([])
      return
    }

    async function fetchSchema() {
      setLoading(true)
      try {
        // This RPC needs to be created in Supabase
        /*
          CREATE OR REPLACE FUNCTION get_table_schema(t_name text)
          RETURNS TABLE (
            column_name text,
            data_type text,
            is_nullable text,
            column_default text,
            foreign_key_table text,
            foreign_key_column text
          ) AS $$
          BEGIN
            RETURN QUERY
            SELECT 
                cols.column_name::text, 
                cols.data_type::text, 
                cols.is_nullable::text,
                cols.column_default::text,
                fks.foreign_table_name::text as foreign_key_table,
                fks.foreign_column_name::text as foreign_key_column
            FROM 
                information_schema.columns cols
            LEFT JOIN (
                SELECT
                    tc.table_name, 
                    kcu.column_name, 
                    ccu.table_name AS foreign_table_name,
                    ccu.column_name AS foreign_column_name 
                FROM 
                    information_schema.table_constraints AS tc 
                    JOIN information_schema.key_column_usage AS kcu
                      ON tc.constraint_name = kcu.constraint_name
                      AND tc.table_schema = kcu.table_schema
                    JOIN information_schema.constraint_column_usage AS ccu
                      ON ccu.constraint_name = tc.constraint_name
                      AND ccu.table_schema = tc.table_schema
                WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public'
            ) fks ON cols.table_name = fks.table_name AND cols.column_name = fks.column_name
            WHERE 
                cols.table_schema = 'public' 
                AND cols.table_name = t_name;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        */
        const { data, error } = await supabase.rpc('get_table_schema', { t_name: tableName })
        
        if (error) {
          console.error('Error fetching schema:', error)
          // Fallback if RPC is missing: try to guess from data
          if (tableName) {
            const { data: sampleData } = await supabase.from(tableName).select('*').limit(1)
            if (sampleData && sampleData.length > 0) {
              const guessedCols = Object.keys(sampleData[0]).map(key => ({
                column_name: key,
                data_type: typeof sampleData[0][key] === 'number' ? 'integer' : 'text',
                is_nullable: 'YES',
                column_default: null
              }))
              setColumns(guessedCols)
            }
          }
        } else if (data) {
          setColumns(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSchema()
  }, [tableName])

  return { columns, loading }
}
