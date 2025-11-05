"use client"

  import { useEffect, useMemo, useState } from "react"
  import { useRouter } from "next/navigation"
  import Image from "next/image"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Badge } from "@/components/ui/badge"
  import { Button } from "@/components/ui/button"
  import { Mail, Phone, MapPin, User, Briefcase,
  GraduationCap,
  Calendar, } from "lucide-react";
  import { jsPDF } from "jspdf";

  const SCAN_RESULT_KEY = "scan-result"
  const REPORT_DOWNLOAD_URL = "https://talentflowai.onrender.com/api/v1/generate-report"

  interface ReportResponse {
  generated_report_text: string;
}

  type KeywordItem = {
    keyword: string
    relevance_score: number
  }

  type Suggestion = {
    missing_skill: string
    suggested_action: string
    priority: "high" | "medium" | "low"
  }

  type WorkExperience = {
  company: string
  role: string
  duration: string
  years: number
}

type Education = {
  degree: string
  institution: string
  year: string
  field_of_study?: string | null
}

  type ApiResponse = {
    success: boolean
    resume_data: {
      job_role: string
      job_description: string
      candidate_details: {
        name: string
  email: string
  phone: string
  location?: string
  work_experience?: WorkExperience[]
  education?: Education[]
  total_experience_years?: number
      }
      keywords: {
        keywords: KeywordItem[]
      }
      extracted_at: string
    }
    screening: {
      summary: string
      ats_score: number
      grade: string
      suggestions: Suggestion[]
      analyzed_at: string
    }
    analyzed_at: string
  }


function getScoreRingClasses(score: number): string {
    const s = Math.round(Number.isFinite(score) ? score : 0)
    if (s >= 85) return "border-emerald-500 text-emerald-600"
    if (s >= 70) return "border-green-500 text-green-600"
    if (s >= 50) return "border-yellow-500 text-yellow-600"
    if (s >= 30) return "border-orange-500 text-orange-600"
    return "border-red-500 text-red-600"
  }



  export default function ResultsPage() {
    const router = useRouter()
    const [data, setData] = useState<ApiResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      // Load the response saved by /scan
      try {
        const raw = sessionStorage.getItem(SCAN_RESULT_KEY)
        if (!raw) {
          router.replace("/scan")
          return
        }
        const parsed = JSON.parse(raw) as ApiResponse
        setData(parsed)
      } catch {
        router.replace("/scan")
        return
      } finally {
        setLoading(false)
      }
    }, [router])

    const atsScore = data?.screening?.ats_score ?? 0
    const atsScoreRounded = useMemo(() => Math.round(atsScore ?? 0),[atsScore])
    const ringClasses = useMemo(() => getScoreRingClasses(atsScoreRounded),[atsScoreRounded])
    const candidate = data?.resume_data?.candidate_details
    const keywords = data?.resume_data?.keywords?.keywords ?? []
    const summary = data?.screening?.summary ?? ""
    const grade = data?.screening?.grade ?? ""
    const jobRole = data?.resume_data?.job_role ?? ""
    const jobDesc = data?.resume_data?.job_description ?? ""
    const suggestions = data?.screening?.suggestions ?? []

    const sortedKeywords = useMemo(() => {
      return [...keywords].sort((a, b) => b.relevance_score - a.relevance_score)
    }, [keywords])

    const keywordBadgeClass = (score: number) => {
      if (score >= 85) return "bg-emerald-600/20 text-emerald-300"
      if (score >= 60) return "bg-yellow-600/20 text-yellow-300"
      return "bg-red-600/20 text-red-300"
    }

    const priorityBadgeClass = (priority: Suggestion["priority"]) => {
      switch (priority) {
        case "high":
          return "bg-red-600/20 text-red-300"
        case "medium":
          return "bg-yellow-600/20 text-yellow-300"
        default:
          return "bg-emerald-600/20 text-emerald-300"
      }
    }

    const downloadReport = async (): Promise<void> => {
  if (!data) return;

  setLoading(true);

  try {
    // 1️⃣ Call backend to generate report text
    const response = await fetch(REPORT_DOWNLOAD_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ analysis_data: data }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate report: ${response.statusText}`);
    }

    const result: ReportResponse = await response.json();

    if (!result?.generated_report_text) {
      throw new Error("No report text returned from API");
    }

    // 2️⃣ Initialize jsPDF instance
    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
      compress: true,
    });

    const margin: number = 40;
    const lineHeight: number = 16;
    const pageWidth: number = doc.internal.pageSize.getWidth();
    const maxLineWidth: number = pageWidth - margin * 2;

    // 3️⃣ Add title and metadata
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("AI-Powered Resume Screening Report", margin, 60);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, 80);

    doc.setDrawColor(200);
    doc.line(margin, 90, pageWidth - margin, 90);

    // 4️⃣ Prepare report body
    const reportText: string = result.generated_report_text;

    const splitText: string[] = doc.splitTextToSize(reportText, maxLineWidth);
    let y: number = 120;

    splitText.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        y = 60;
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    // 5️⃣ Footer
    const footerY: number = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Confidential Candidate Evaluation – Powered by Gemini AI", margin, footerY);

    // 6️⃣ Save PDF
    doc.save(`candidate-report-${Date.now()}.pdf`);
  } catch (error) {
    console.error("Error downloading report:", error);
    alert("Failed to generate or download report. Please try again.");
  }finally{
    setLoading(false);
  }
};

    if (loading) {
      return (
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="grid h-[50vh] place-items-center">
            <div className="flex items-center space-x-3">
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
              <span className="text-sm">Loading results...</span>
            </div>
          </div>
        </div>
      )
    }

    if (!data) return null

    return (
      <div className="relative mx-auto max-w-6xl px-4 py-8">

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold">Scan Analysis</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push("/scan")}>
              New Scan
            </Button>
            <Button onClick={downloadReport}>Download Report</Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-6 md:col-span-1">
            {/* <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-base">ATS Score</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center gap-2 py-10">
        <div
          className={`grid h-32 w-32 place-items-center rounded-full border-8 text-3xl font-bold ${ringClasses}`}
          aria-label={`ATS score ${atsScoreRounded} percent`}
        >
          {atsScoreRounded}%
        </div>
        {grade ? (
          <div className="text-xs text-muted-foreground">Grade: {grade}</div>
        ) : null}
        <p className="text-xs text-muted-foreground text-center">
          This score represents the resume&apos;s compatibility with the job description.
        </p>
      </CardContent>
            </Card> */}

            <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-primary">
          Candidate Details
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 text-sm">
        {candidate?.name && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{candidate.name}</span>
          </div>
        )}

        {candidate?.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{candidate.email}</span>
          </div>
        )}

        {candidate?.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{candidate.phone}</span>
          </div>
        )}

        {candidate?.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{candidate.location}</span>
          </div>
        )}
        {/* Work Experience */}
{candidate?.work_experience && (
  <div className="pt-2">
    <h4 className="font-medium text-primary flex items-center gap-2">
      <Briefcase className="h-4 w-4 text-muted-foreground" />
      Work Experience
    </h4>
    <div className="mt-2 space-y-2">
      {candidate.work_experience?.map((exp, index) => (
        <div key={index} className="border-l-2 border-border pl-3">
          <p className="font-medium">{exp.role}</p>
          <p className="text-muted-foreground text-xs">
            {exp.company} • {exp.duration}
          </p>
          {exp.years && (
            <p className="text-muted-foreground text-xs">
              ({exp.years} years)
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}

{/* Education */}
{candidate?.education && (
  <div className="pt-2">
    <h4 className="font-medium text-primary flex items-center gap-2">
      <GraduationCap className="h-4 w-4 text-muted-foreground" />
      Education
    </h4>
    <div className="mt-2 space-y-2">
      {candidate.education?.map((edu, index) => (
        <div key={index} className="border-l-2 border-border pl-3">
          <p className="font-medium">{edu.degree}</p>
          <p className="text-muted-foreground text-xs">{edu.institution}</p>
          <p className="text-muted-foreground text-xs">{edu.year}</p>
          {edu.field_of_study && (
            <p className="text-muted-foreground text-xs">
              Field: {edu.field_of_study}
            </p>
          )}
        </div>
      ))}
    </div>
  </div>
)}

{candidate?.total_experience_years && (
                <div className="flex items-center gap-2 pt-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Total Experience: {candidate.total_experience_years} years</span>
                </div>
              )}

      </CardContent>
    </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="text-base">Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {jobRole && <div className="font-medium">{jobRole}</div>}
                {jobDesc && (
                  <p className="text-muted-foreground whitespace-pre-line">
                    {jobDesc}
                  </p>
                )}
              </CardContent>
            </Card> */}
          </div>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <section>
                <h3 className="mb-2 text-sm font-semibold">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {sortedKeywords.length ? (
                    sortedKeywords.map((k) => (
                      <Badge
                        key={k.keyword}
                        className={keywordBadgeClass(k.relevance_score)}
                        title={`Relevance: ${k.relevance_score}`}
                      >
                        {k.keyword}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No keywords extracted.</p>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Green indicates a high match, yellow a partial match, and red a missing or
                  low‑  relevance keyword.
                </p>
              </section>

              <section>
                <h3 className="mb-2 text-l font-semibold">Summary</h3>
                {summary ? (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {summary}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">No summary available.</p>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-l font-semibold">Things candidate lacks:</h3>
                {suggestions.length ? (
                  <ul className="space-y-3 text-sm">
                    {suggestions.map((sug, i) => (
                      <li key={`${sug.missing_skill}-${i}`} className="rounded-lg border p-3">
                        <div className="mb-1 flex items-center justify-between">
                          <div className="font-medium">{sug.missing_skill}</div>
                          <Badge className={priorityBadgeClass(sug.priority)}>
                            {sug.priority}
                          </Badge>
                        </div>
                        {/* <p className="text-muted-foreground">{sug.suggested_action}</p> */}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground">No recommendations.</p>
                )}
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }





// "use client"

//   import { useEffect, useMemo, useState } from "react"
//   import { useRouter } from "next/navigation"
//   import Image from "next/image"
//   import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
//   import { Badge } from "@/components/ui/badge"
//   import { Button } from "@/components/ui/button"
//   import { Mail, Phone, MapPin, User, Briefcase,
//   GraduationCap,
//   Calendar, } from "lucide-react";

//   const SCAN_RESULT_KEY = "scan-result"

//   type KeywordItem = {
//     keyword: string
//     relevance_score: number
//   }

//   type Suggestion = {
//     missing_skill: string
//     suggested_action: string
//     priority: "high" | "medium" | "low"
//   }

//   type WorkExperience = {
//   company: string
//   role: string
//   duration: string
//   years: number
// }

// type Education = {
//   degree: string
//   institution: string
//   year: string
//   field_of_study?: string | null
// }

//   type ApiResponse = {
//     success: boolean
//     resume_data: {
//       job_role: string
//       job_description: string
//       candidate_details: {
//         name: string
//   email: string
//   phone: string
//   location?: string
//   work_experience?: WorkExperience[]
//   education?: Education[]
//   total_experience_years?: number
//       }
//       keywords: {
//         keywords: KeywordItem[]
//       }
//       extracted_at: string
//     }
//     screening: {
//       summary: string
//       ats_score: number
//       grade: string
//       suggestions: Suggestion[]
//       analyzed_at: string
//     }
//     analyzed_at: string
//   }


// function getScoreRingClasses(score: number): string {
//     const s = Math.round(Number.isFinite(score) ? score : 0)
//     if (s >= 85) return "border-emerald-500 text-emerald-600"
//     if (s >= 70) return "border-green-500 text-green-600"
//     if (s >= 50) return "border-yellow-500 text-yellow-600"
//     if (s >= 30) return "border-orange-500 text-orange-600"
//     return "border-red-500 text-red-600"
//   }



//   export default function ResultsPage() {
//     const router = useRouter()
//     const [data, setData] = useState<ApiResponse | null>(null)
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//       // Load the response saved by /scan
//       try {
//         const raw = sessionStorage.getItem(SCAN_RESULT_KEY)
//         if (!raw) {
//           router.replace("/scan")
//           return
//         }
//         const parsed = JSON.parse(raw) as ApiResponse
//         setData(parsed)
//       } catch {
//         router.replace("/scan")
//         return
//       } finally {
//         setLoading(false)
//       }
//     }, [router])

//     const atsScore = data?.screening?.ats_score ?? 0
//     const atsScoreRounded = useMemo(() => Math.round(atsScore ?? 0),[atsScore])
//     const ringClasses = useMemo(() => getScoreRingClasses(atsScoreRounded),[atsScoreRounded])
//     const candidate = data?.resume_data?.candidate_details
//     const keywords = data?.resume_data?.keywords?.keywords ?? []
//     const summary = data?.screening?.summary ?? ""
//     const grade = data?.screening?.grade ?? ""
//     const jobRole = data?.resume_data?.job_role ?? ""
//     const jobDesc = data?.resume_data?.job_description ?? ""
//     const suggestions = data?.screening?.suggestions ?? []

//     const sortedKeywords = useMemo(() => {
//       return [...keywords].sort((a, b) => b.relevance_score - a.relevance_score)
//     }, [keywords])

//     const keywordBadgeClass = (score: number) => {
//       if (score >= 85) return "bg-emerald-600/20 text-emerald-300"
//       if (score >= 60) return "bg-yellow-600/20 text-yellow-300"
//       return "bg-red-600/20 text-red-300"
//     }

//     const priorityBadgeClass = (priority: Suggestion["priority"]) => {
//       switch (priority) {
//         case "high":
//           return "bg-red-600/20 text-red-300"
//         case "medium":
//           return "bg-yellow-600/20 text-yellow-300"
//         default:
//           return "bg-emerald-600/20 text-emerald-300"
//       }
//     }

//     const downloadReport = () => {
//       if (!data) return
//       const blob = new Blob([JSON.stringify(data, null, 2)], {
//         type: "application/json",
//       })
//       const url = URL.createObjectURL(blob)
//       const a = document.createElement("a")
//       a.href = url
//       a.download = `scan-report-${Date.now()}.json`
//       a.click()
//       URL.revokeObjectURL(url)
//     }

//     if (loading) {
//       return (
//         <div className="mx-auto max-w-6xl px-4 py-8">
//           <div className="grid h-[50vh] place-items-center">
//             <div className="flex items-center space-x-3">
//               <svg
//                 className="h-5 w-5 animate-spin"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 xmlns="http://www.w3.org/2000/svg"
//                 aria-hidden="true"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 />
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
//                 />
//               </svg>
//               <span className="text-sm">Loading results...</span>
//             </div>
//           </div>
//         </div>
//       )
//     }

//     if (!data) return null

//     return (
//       <div className="relative mx-auto max-w-6xl px-4 py-8">

//         <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
//           <h1 className="text-2xl font-semibold">Scan Analysis</h1>
//           <div className="flex gap-2">
//             <Button variant="secondary" onClick={() => router.push("/scan")}>
//               New Scan
//             </Button>
//             <Button onClick={downloadReport}>Download Report</Button>
//           </div>
//         </div>

//         <div className="grid gap-6 md:grid-cols-3">
//           <div className="space-y-6 md:col-span-1">
//             {/* <Card className="bg-card">
//               <CardHeader>
//                 <CardTitle className="text-base">ATS Score</CardTitle>
//               </CardHeader>
//               <CardContent className="flex flex-col items-center justify-center gap-2 py-10">
//         <div
//           className={`grid h-32 w-32 place-items-center rounded-full border-8 text-3xl font-bold ${ringClasses}`}
//           aria-label={`ATS score ${atsScoreRounded} percent`}
//         >
//           {atsScoreRounded}%
//         </div>
//         {grade ? (
//           <div className="text-xs text-muted-foreground">Grade: {grade}</div>
//         ) : null}
//         <p className="text-xs text-muted-foreground text-center">
//           This score represents the resume&apos;s compatibility with the job description.
//         </p>
//       </CardContent>
//             </Card> */}

//             <Card className="shadow-sm">
//       <CardHeader>
//         <CardTitle className="text-base font-semibold text-primary">
//           Candidate Details
//         </CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-3 text-sm">
//         {candidate?.name && (
//           <div className="flex items-center gap-2">
//             <User className="h-4 w-4 text-muted-foreground" />
//             <span>{candidate.name}</span>
//           </div>
//         )}

//         {candidate?.email && (
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <Mail className="h-4 w-4" />
//             <span>{candidate.email}</span>
//           </div>
//         )}

//         {candidate?.phone && (
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <Phone className="h-4 w-4" />
//             <span>{candidate.phone}</span>
//           </div>
//         )}

//         {candidate?.location && (
//           <div className="flex items-center gap-2 text-muted-foreground">
//             <MapPin className="h-4 w-4" />
//             <span>{candidate.location}</span>
//           </div>
//         )}
//         {/* Work Experience */}
// {candidate?.work_experience && (
//   <div className="pt-2">
//     <h4 className="font-medium text-primary flex items-center gap-2">
//       <Briefcase className="h-4 w-4 text-muted-foreground" />
//       Work Experience
//     </h4>
//     <div className="mt-2 space-y-2">
//       {candidate.work_experience?.map((exp, index) => (
//         <div key={index} className="border-l-2 border-border pl-3">
//           <p className="font-medium">{exp.role}</p>
//           <p className="text-muted-foreground text-xs">
//             {exp.company} • {exp.duration}
//           </p>
//           {exp.years && (
//             <p className="text-muted-foreground text-xs">
//               ({exp.years} years)
//             </p>
//           )}
//         </div>
//       ))}
//     </div>
//   </div>
// )}

// {/* Education */}
// {candidate?.education && (
//   <div className="pt-2">
//     <h4 className="font-medium text-primary flex items-center gap-2">
//       <GraduationCap className="h-4 w-4 text-muted-foreground" />
//       Education
//     </h4>
//     <div className="mt-2 space-y-2">
//       {candidate.education?.map((edu, index) => (
//         <div key={index} className="border-l-2 border-border pl-3">
//           <p className="font-medium">{edu.degree}</p>
//           <p className="text-muted-foreground text-xs">{edu.institution}</p>
//           <p className="text-muted-foreground text-xs">{edu.year}</p>
//           {edu.field_of_study && (
//             <p className="text-muted-foreground text-xs">
//               Field: {edu.field_of_study}
//             </p>
//           )}
//         </div>
//       ))}
//     </div>
//   </div>
// )}

// {candidate?.total_experience_years && (
//                 <div className="flex items-center gap-2 pt-2">
//                   <Calendar className="h-4 w-4 text-muted-foreground" />
//                   <span>Total Experience: {candidate.total_experience_years} years</span>
//                 </div>
//               )}

//       </CardContent>
//     </Card>

//             {/* <Card>
//               <CardHeader>
//                 <CardTitle className="text-base">Job</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-2 text-sm">
//                 {jobRole && <div className="font-medium">{jobRole}</div>}
//                 {jobDesc && (
//                   <p className="text-muted-foreground whitespace-pre-line">
//                     {jobDesc}
//                   </p>
//                 )}
//               </CardContent>
//             </Card> */}
//           </div>

//           <Card className="md:col-span-2">
//             <CardHeader>
//               <CardTitle className="text-base">Insights</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-6">
//               <section>
//                 <h3 className="mb-2 text-sm font-semibold">Keywords</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {sortedKeywords.length ? (
//                     sortedKeywords.map((k) => (
//                       <Badge
//                         key={k.keyword}
//                         className={keywordBadgeClass(k.relevance_score)}
//                         title={`Relevance: ${k.relevance_score}`}
//                       >
//                         {k.keyword}
//                       </Badge>
//                     ))
//                   ) : (
//                     <p className="text-xs text-muted-foreground">No keywords extracted.</p>
//                   )}
//                 </div>
//                 <p className="mt-2 text-xs text-muted-foreground">
//                   Green indicates a high match, yellow a partial match, and red a missing or
//                   low‑  relevance keyword.
//                 </p>
//               </section>

//               <section>
//                 <h3 className="mb-2 text-l font-semibold">Summary</h3>
//                 {summary ? (
//                   <p className="text-sm text-muted-foreground whitespace-pre-line">
//                     {summary}
//                   </p>
//                 ) : (
//                   <p className="text-xs text-muted-foreground">No summary available.</p>
//                 )}
//               </section>

//               <section>
//                 <h3 className="mb-2 text-l font-semibold">Things candidate lacks:</h3>
//                 {suggestions.length ? (
//                   <ul className="space-y-3 text-sm">
//                     {suggestions.map((sug, i) => (
//                       <li key={`${sug.missing_skill}-${i}`} className="rounded-lg border p-3">
//                         <div className="mb-1 flex items-center justify-between">
//                           <div className="font-medium">{sug.missing_skill}</div>
//                           <Badge className={priorityBadgeClass(sug.priority)}>
//                             {sug.priority}
//                           </Badge>
//                         </div>
//                         {/* <p className="text-muted-foreground">{sug.suggested_action}</p> */}
//                       </li>
//                     ))}
//                   </ul>
//                 ) : (
//                   <p className="text-xs text-muted-foreground">No recommendations.</p>
//                 )}
//               </section>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     )
//   }
