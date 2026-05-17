import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { UploadCloud, Upload, Settings2, FileText, Table as TableIcon, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'
import { useTableSchema } from '@/hooks/useTableSchema'
import { ForeignKeySelector } from '@/components/ForeignKeySelector'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type FileType = 'json' | 'csv' | 'md'

export default function FileUpload() {
  const [fileType, setFileType] = useState<FileType>('json')
  const [tables, setTables] = useState<string[]>([])
  const [selectedTable, setSelectedTable] = useState('')
  const [preview, setPreview] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [pastedContent, setPastedContent] = useState('')

  const { columns } = useTableSchema(selectedTable)
  const [defaultValues, setDefaultValues] = useState<Record<string, any>>({})

  useEffect(() => {
    async function fetchTables() {
      const { data } = await supabase.rpc('get_tables')
      if (data) setTables(data)
    }
    fetchTables()
  }, [])

  const parseMarkdown = (text: string) => {
    const questions: any[] = []
    // Split by either horizontal rules or question numbers
    const blocks = text.split(/---|\n\s*?\n(?=\*\*Q)/).filter(b => b.trim().length > 10)

    blocks.forEach(block => {
      // 1. Extract Question
      const qMatch = block.match(/(?:\*\*Q|Q)\d+\.?\s*\*\*\s*(.*?)\s*(?:\n|$)/) || block.match(/(?:\*\*Q|Q)\d+\.?\s*(.*?)\s*(?:\n|$)/)

      // 2. Extract Options
      const optionsMatch = [...block.matchAll(/^\s*?[A-D][\.\)]\s*(.*?)(?:\n|$)/gm)]

      // 3. Extract Answer and Explanation
      // We look for the Answer line and take everything after it
      const ansMatch = block.match(/\*\*Answer:\s*(\d+)\*\*/i) || block.match(/Answer:\s*(\d+)/i)

      if (qMatch && optionsMatch.length > 0) {
        let explanation = ''
        if (ansMatch) {
          // Find the index of the answer line and slice everything after it
          const answerString = ansMatch[0]
          const answerPos = block.indexOf(answerString)
          explanation = block.substring(answerPos + answerString.length).trim()
        }

        questions.push({
          question_text: qMatch[1].trim(),
          options: optionsMatch.map(m => m[1].trim()),
          correct_index: ansMatch ? parseInt(ansMatch[1]) : 0,
          explanation: explanation
        })
      }
    })
    return questions
  }

  const processContent = (content: string, filename?: string) => {
    let parsedData: any[] = []

    try {
      if (fileType === 'json') {
        const json = JSON.parse(content)
        parsedData = Array.isArray(json) ? json : [json]
      } else if (fileType === 'csv') {
        const results = Papa.parse(content, { header: true, skipEmptyLines: true })
        parsedData = results.data
      } else if (fileType === 'md') {
        parsedData = parseMarkdown(content)
      }

      if (parsedData.length > 0) {
        setPreview(parsedData)
        if (filename) {
          toast.success(`Successfully parsed ${parsedData.length} records from ${filename}`)
        } else {
          toast.success(`Successfully parsed ${parsedData.length} records`)
        }
      } else {
        toast.error('No valid records found. Check format.')
        setPreview([])
      }
    } catch (err) {
      toast.error('Critical Error: Could not parse data.')
      setPreview([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      processContent(content, selectedFile.name)
    }
    reader.readAsText(selectedFile)
    e.target.value = ''
  }

  const handleParsePaste = () => {
    if (!pastedContent.trim()) {
      toast.error('Please paste some content first')
      return
    }
    processContent(pastedContent)
  }

  const handleUpload = async () => {
    if (!selectedTable) return toast.error('Select a target table')
    if (preview.length === 0) return toast.error('No data found in file')

    setUploading(true)

    const finalData = preview.map(record => ({
      ...record,
      ...Object.fromEntries(
        Object.entries(defaultValues).filter(([_, v]) => v !== '' && v !== undefined)
      )
    }))

    const { error } = await supabase.from(selectedTable).insert(finalData)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Imported ${preview.length} records to ${selectedTable}`)
      setPreview([])
    }
    setUploading(false)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Bulk Import Engine
        </h2>
        <p className="text-muted-foreground">
          Advanced parser for complex data imports.
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-primary/10 glassmorphism shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Step 1: File Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Source Format</label>
                  <div className="flex p-1 bg-muted/50 rounded-lg gap-1 border border-primary/5">
                    {(['json', 'csv', 'md'] as FileType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => { setFileType(t); setPreview([]); }}
                        className={`flex-1 py-2 rounded-md text-xs font-bold uppercase transition-all ${fileType === t
                            ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]'
                            : 'text-muted-foreground hover:bg-muted/80'
                          }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Target Table</label>
                  <Select onValueChange={setSelectedTable} value={selectedTable}>
                    <SelectTrigger className="bg-background/50 h-11 border-primary/10">
                      <SelectValue placeholder="Select table..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tables.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Tabs defaultValue="file" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="file">Upload File</TabsTrigger>
                  <TabsTrigger value="paste">Direct Paste</TabsTrigger>
                </TabsList>

                <TabsContent value="file" className="mt-4">
                  <div className="relative border-2 border-dashed border-primary/20 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:bg-primary/5 transition-all group">
                    <div className="p-5 bg-primary/10 rounded-full mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="font-bold text-xl uppercase tracking-tighter">Click or Drop .{fileType} file</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-2">
                      Ensure your file matches the {fileType.toUpperCase()} schema
                    </p>
                    <input
                      type="file"
                      accept={`.${fileType}`}
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="paste" className="mt-4 space-y-4">
                  <Textarea
                    placeholder={`Paste your ${fileType.toUpperCase()} content here...`}
                    className="min-h-[250px] font-mono text-xs p-4 resize-y bg-background/50 border-primary/20 focus:border-primary/50"
                    value={pastedContent}
                    onChange={(e) => setPastedContent(e.target.value)}
                  />
                  <div className="flex justify-end">
                    <Button onClick={handleParsePaste} variant="secondary">
                      Parse & Preview Data
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {preview.length > 0 ? (
            <Card className="border-primary/10 glassmorphism animate-in slide-in-from-bottom-4 shadow-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b border-primary/5 pb-4 bg-primary/5">
                <div>
                  <CardTitle className="text-lg">Parsed {fileType.toUpperCase()} Preview</CardTitle>
                  <CardDescription>{preview.length} valid records ready for {selectedTable || 'database'}</CardDescription>
                </div>
                <Button onClick={handleUpload} disabled={uploading || !selectedTable} size="lg" className="shadow-lg shadow-primary/25 px-8">
                  {uploading ? 'Uploading...' : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Import to Supabase
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-auto text-xs font-mono p-6 bg-muted/5">
                  <pre className="text-primary/70">{JSON.stringify(preview.slice(0, 10), null, 2)}</pre>
                  {preview.length > 10 && (
                    <div className="text-center py-4 border-t border-primary/5 mt-4 text-muted-foreground italic">
                      + {preview.length - 10} more records in buffer
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="p-12 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-muted-foreground opacity-20">
              <AlertCircle className="h-12 w-12 mb-2" />
              <p>No preview available yet</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="border-primary/10 glassmorphism h-full shadow-xl sticky top-8">
            <CardHeader className="bg-primary/5 border-b border-primary/5">
              <CardTitle className="text-md flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-primary" />
                Smart Injection
              </CardTitle>
              <CardDescription className="text-[11px]">
                Add values missing in your file.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-6">
              {!selectedTable ? (
                <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground opacity-30">
                  <TableIcon className="h-16 w-16 mb-4" />
                  <p className="text-sm font-medium">Select a table first</p>
                </div>
              ) : (
                <div className="space-y-5 max-h-[calc(100vh-300px)] overflow-y-auto pr-2 scrollbar-thin">
                  {columns.map(col => {
                    const isBool = col.data_type === 'boolean'
                    const isFK = !!col.foreign_key_table

                    return (
                      <div key={col.column_name} className="space-y-2 group">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                            {col.column_name}
                          </label>
                          {isFK && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-primary/10 text-primary rounded-full">
                              FK: {col.foreign_key_table}
                            </span>
                          )}
                        </div>

                        {isFK ? (
                          <ForeignKeySelector
                            table={col.foreign_key_table!}
                            column={col.foreign_key_column!}
                            value={defaultValues[col.column_name] || ''}
                            onChange={(val) => setDefaultValues(prev => ({ ...prev, [col.column_name]: val }))}
                          />
                        ) : isBool ? (
                          <Select
                            onValueChange={(val) => setDefaultValues(prev => ({ ...prev, [col.column_name]: val === 'true' }))}
                            value={defaultValues[col.column_name] !== undefined ? String(defaultValues[col.column_name]) : ''}
                          >
                            <SelectTrigger className="h-8 text-xs bg-background/50">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">True</SelectItem>
                              <SelectItem value="false">False</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            placeholder={col.data_type}
                            className="h-8 text-xs bg-background/50 border-primary/5 focus:border-primary/20"
                            value={defaultValues[col.column_name] || ''}
                            onChange={(e) => setDefaultValues(prev => ({ ...prev, [col.column_name]: e.target.value }))}
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
