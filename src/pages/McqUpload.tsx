import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { FileJson, Upload } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MCQ {
  question_text: string
  options: string[]
  correct_index: number
  explanation: string
}

interface Subject {
  id: string
  sub_name: string
}

export default function McqUpload() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedSubjectId, setSelectedSubjectId] = useState('')
  const [preview, setPreview] = useState<MCQ[]>([])
  const [uploading, setUploading] = useState(false)
  const [fetchingSubjects, setFetchingSubjects] = useState(true)

  // Fetch subjects on mount
  useEffect(() => {
    async function fetchSubjects() {
      setFetchingSubjects(true)
      const { data, error } = await supabase
        .from('subjects')
        .select('id, sub_name')
        .order('sub_name', { ascending: true })

      if (error) {
        toast.error('Failed to load subjects')
      } else {
        setSubjects(data || [])
      }
      setFetchingSubjects(false)
    }
    fetchSubjects()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const json = JSON.parse(event.target?.result as string)
          if (Array.isArray(json)) {
            setPreview(json)
          } else {
            toast.error('Invalid JSON format. Expected an array of questions.')
          }
        } catch (err) {
          toast.error('Failed to parse JSON file.')
        }
      }
      reader.readAsText(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject')
      return
    }
    if (preview.length === 0) {
      toast.error('No questions to upload')
      return
    }

    setUploading(true)
    const payload = preview.map(q => ({
      ...q,
      subject_id: selectedSubjectId
    }))

    const { error } = await supabase
      .from('mcqs')
      .insert(payload)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success(`Successfully uploaded ${preview.length} questions!`)
      setPreview([])
      setSelectedSubjectId('')
    }
    setUploading(false)
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">MCQ Upload Tool</h2>
        <p className="text-muted-foreground mt-2">
          Select a subject and upload your MCQ JSON array.
        </p>
      </div>

      <Card className="border-primary/10 glassmorphism">
        <CardHeader>
          <CardTitle>Step 1: Select Subject & Upload File</CardTitle>
          <CardDescription>
            Choose the target subject from your database.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Subject</label>
              <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder={fetchingSubjects ? "Loading subjects..." : "Choose a subject"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((sub) => (
                    <SelectItem key={sub.id} value={sub.id}>
                      {sub.sub_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">JSON File</label>
              <Input 
                type="file" 
                accept=".json"
                onChange={handleFileChange}
                className="bg-background/50"
              />
            </div>
          </div>

          <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
            <FileJson className="h-10 w-10 text-primary mb-4" />
            <h3 className="text-lg font-medium">Ready to Preview</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              Ensure your JSON matches the required schema before importing.
            </p>
          </div>

          {preview.length > 0 && (
            <div className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between border-b pb-4">
                <div className="flex flex-col">
                  <h3 className="font-bold text-lg">Preview</h3>
                  <p className="text-xs text-muted-foreground">
                    Subject ID: <span className="text-primary font-mono">{selectedSubjectId || 'None selected'}</span>
                  </p>
                </div>
                <Button onClick={handleUpload} disabled={uploading || !selectedSubjectId} size="lg" className="shadow-lg shadow-primary/20">
                  {uploading ? (
                    'Uploading...'
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Bulk Import {preview.length} MCQs
                    </>
                  )}
                </Button>
              </div>
              
              <div className="bg-card/50 border rounded-md h-80 overflow-auto p-4">
                <div className="space-y-4">
                  {preview.slice(0, 5).map((q, i) => (
                    <div key={i} className="p-3 border rounded bg-background/30 text-sm">
                      <p className="font-bold mb-2">Q{i+1}: {q.question_text}</p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`px-2 py-1 rounded border ${oi === q.correct_index ? 'bg-green-500/10 border-green-500/50 text-green-600' : 'bg-muted'}`}>
                            {String.fromCharCode(65 + oi)}. {opt}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">Explanation: {q.explanation}</p>
                    </div>
                  ))}
                  {preview.length > 5 && (
                    <p className="text-center text-muted-foreground text-xs py-4">
                      ... and {preview.length - 5} more questions
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
