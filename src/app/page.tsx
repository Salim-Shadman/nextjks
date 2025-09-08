import { LandingHeader } from "@/components/layout/LandingHeader";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, FileUp, Zap } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <LandingHeader />
      
      <main className="flex-1">
        <section className="container mx-auto text-center py-20 md:py-32 relative">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-primary/10 to-transparent -z-10" />
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter mb-4">
            Turn Data into a Story
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Insight Flow is an online tool that lets you transform boring datasets into beautiful, animated, and interactive stories that captivate your audience.
          </p>
          <Button size="lg" asChild>
            <Link href="/dashboard">Get Started for Free</Link>
          </Button>
        </section>

        <section className="py-20">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Powerful Features, Simple Interface
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <BarChart2 className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Interactive Charts</CardTitle>
                  <CardDescription>
                    Easily create beautiful bar charts from your own data. Select your columns and watch your data come to life.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <FileUp className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Simple Data Upload</CardTitle>
                  <CardDescription>
                    Upload your CSV or text files in seconds. Our powerful parser handles the rest, making your data ready for visualization.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-primary/20 hover:border-primary transition-colors">
                <CardHeader>
                  <Zap className="h-8 w-8 mb-4 text-primary" />
                  <CardTitle>Animated Storytelling</CardTitle>
                  <CardDescription>
                    Engage your audience with smooth, scroll-based animations that reveal your story block by block.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t">
        <div className="container mx-auto text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} Insight Flow. Built by Salim Shadman.
        </div>
      </footer>
    </div>
  );
}