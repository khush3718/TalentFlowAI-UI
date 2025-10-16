import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LightRays } from "@/components/ui/light-rays"
import { BorderBeam } from "@/components/ui/border-beam"

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0">
          <div className="relative h-[480px] w-full overflow-hidden rounded-xl border">
  <LightRays />
</div>  
          {/* <Image
            src="/images/hero-reference.png"
            alt="Hiring flow reference background"
            fill
            priority
            className="object-cover opacity-30"
          /> */}
          <div className="absolute inset-0 bg-background/60" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-30 text-center">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight md:text-6xl">
            Streamline Your Hiring with AI‑Powered Resume Screening
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">
            Automate resume analysis, identify top candidates, and accelerate your recruitment process.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button variant="default" asChild >
              <Link href="/scan">Start Scanning</Link>
            </Button>
            {/* <Button variant="secondary" asChild>
              <Link href="/#features">Learn More</Link>
            </Button> */}
          </div>
        </div>
      </section>

      {/* Features */}
      
      {/* <section id="features" className="bg-card">
        
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-16 md:grid-cols-3">
          {[
            {
              title: "Intelligent Matching",
              desc: "Our AI goes beyond keywords to match candidates by skills, experience, and potential fit.",
              icon: "🔎",
            },
            {
              title: "Accelerated Screening",
              desc: "Cut review time from hours to minutes. Evaluate more candidates, faster.",
              icon: "⚡",
            },
            {
              title: "Actionable Insights",
              desc: "Get concise reports and analytics to improve hiring quality and reduce bias.",
              icon: "📈",
            },
          ].map((f) => (
            <Card key={f.title} className="bg-muted/30">
              
              <CardContent className="p-6">
                
                <div className="mb-3 text-2xl" aria-hidden>
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section> */}
    </div>
  )
}
