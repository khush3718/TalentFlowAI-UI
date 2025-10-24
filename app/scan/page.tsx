"use client"

  import { useEffect, useRef, useState } from "react"
  import { useRouter } from "next/navigation"
  import { Button } from "@/components/ui/button"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Input } from "@/components/ui/input"
  import { Textarea } from "@/components/ui/textarea"

  // Key used to pass the API response to the results page
  const SCAN_RESULT_KEY = "scan-result"

  // Configure your backend endpoint (client-visible env var)
  const BACKEND_SCAN_URL = "https://talentflowai.onrender.com/api/v1/complete-analysis"

  export default function ScanPage() {
    const router = useRouter()

    const [fileName, setFileName] = useState<string | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    const [jobRole, setJobRole] = useState("")
    const [jobDesc, setJobDesc] = useState("")

    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const isPdf = (f: File | null) => {
      if (!f) return false
      return f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")
    }

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
      const f = e.target.files?.[0] ?? null
      setError(null)

      if (!f) {
        setFile(null)
        setFileName(null)
        return
      }

      if (f.size > 5 * 1024 * 1024) {
        setError("File is larger than 5MB.")
        setFile(null)
        setFileName(null)
        return
      }

      setFile(f)
      setFileName(f.name)
    }

    // Create/revoke object URL for PDF preview
    useEffect(() => {
      if (file && isPdf(file)) {
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
        return () => {
          URL.revokeObjectURL(url)
        }
      } else {
        setPreviewUrl(null)
      }
    }, [file])

    const handleScan = async () => {
      setError(null)

      // Basic validation
      if (!file) {
        setError("Please upload a resume file.")
        return
      }
      if (!jobDesc.trim()) {
        setError("Please paste the job description.")
        return
      }

      try {
        setIsLoading(true)

        const form = new FormData()
        // Adjust field names to match your backend expectations
        form.append("resume", file) // e.g., "resume" or "file"
        form.append("job_role", jobRole)
        form.append("job_description", jobDesc)

        const res = await fetch(BACKEND_SCAN_URL, {
          method: "POST",
          body: form,
        })

        if (!res.ok) {
          const text = await res.text().catch(() => "")
          throw new Error(text || `Request failed with status ${res.status}`)
        }

        const data = await res.json()

        // Store result for the results page to consume
        sessionStorage.setItem(SCAN_RESULT_KEY, JSON.stringify(data))

        // Navigate to results page
        router.push("/results")
      } catch (err: any) {
        setError(err?.message || "Something went wrong while scanning the resume.")
      } finally {
        setIsLoading(false)
      }
    }

    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-semibold">Resume Scanner</h1>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Left: Upload + Job description */}
          <div className="space-y-6 md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">1. Upload Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <label className="flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed bg-muted/30 hover:bg-muted/40">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="sr-only"
                    onChange={onFileChange}
                  />
                  <div className="text-center">
                    <div className="mx-auto mb-2 h-8 w-8" aria-hidden />
                    <p className="text-sm">Drag & Drop or Browse</p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX. Max 5MB.</p>
                    {fileName && <p className="mt-2 text-xs">Selected: {fileName}</p>}
                  </div>
                </label>
                <Button
                  variant="link"
                  className="px-0 text-xs text-muted-foreground"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">2. Job Description</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground" htmlFor="role">
                    Job Role
                  </label>
                  <Input
                    id="role"
                    placeholder="e.g. Senior Frontend Developer"
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground" htmlFor="desc">
                    Job Description
                  </label>
                  <Textarea
                    id="desc"
                    placeholder="Paste the job description here..."
                    rows={6}
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                  />
                </div>

                {error && (
                  <p className="text-xs text-destructive">
                    {error}
                  </p>
                )}

                <Button
                  onClick={handleScan}
                  disabled={isLoading}
                  variant="default"
                  className="w-full"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="mr-2 h-4 w-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>
                      Scanning...
                    </span>
                  ) : (
                    "Scan Resume"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right: Preview / Results */}
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-base">3. Scan Results</CardTitle>
              </CardHeader>
              <CardContent className="relative h-[560px] rounded-lg bg-muted/20 p-2">
                {previewUrl ? (
                  <iframe
                    src={previewUrl}
                    title="Resume preview"
                    className="h-full w-full rounded-md border"
                  />
                ) : fileName && !isPdf(file) ? (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <div className="mx-auto mb-4 h-10 w-10 rounded bg-muted" aria-hidden />
                      <p className="text-sm">Preview not available for DOC/DOCX files.</p>
                      <p className="text-xs text-muted-foreground">
                        Please upload a PDF to see an inline preview.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full place-items-center text-center">
                    <div>
                      <div className="mx-auto mb-4 h-10 w-10" aria-hidden />
                      <p className="text-sm">Upload a resume and enter job details to start</p>
                      <p className="text-xs text-muted-foreground">
                        The AI-powered analysis will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full-screen overlay loader during processing */}
        {isLoading && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-background/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3 rounded-md border bg-background px-4 py-3 shadow-md">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              <span className="text-sm">Analyzing resume...</span>
            </div>
          </div>
        )}
      </div>
    )
  }
