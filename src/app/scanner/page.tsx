"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAnalyze } from "@/hooks/use-analyze"
import { Search, Info, Leaf, AlertCircle } from "lucide-react"

export default function ScannerPage() {
  const [query, setQuery] = React.useState("")
  const { data, loading, error, analyzeFood } = useAnalyze()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    analyzeFood({ foodName: query })
  }

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Food Scanner</h1>
        <p className="text-muted-foreground">Instantly analyze any food for its health score and nutritional value.</p>
      </div>

      <Card className="border-2 border-primary/20 shadow-lg shadow-primary/5">
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g., Grilled Salmon, Pizza, Avocado Toast..." 
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" disabled={loading} className="h-12 px-8">
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </form>
          
          <div className="mt-4 flex gap-2">
            <span className="text-sm text-muted-foreground">Try:</span>
            {['Oatmeal', 'Burger', 'Salmon', 'Donut'].map(q => (
              <Badge 
                key={q} 
                variant="secondary" 
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => {
                  setQuery(q)
                  analyzeFood({ foodName: q })
                }}
              >
                {q}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-destructive/15 p-4 text-destructive flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      )}

      {loading && !data && (
        <Card className="flex flex-col items-center justify-center p-12 text-center animate-pulse">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4"></div>
          <h3 className="text-xl font-medium">Analyzing with NutriSense AI...</h3>
          <p className="text-muted-foreground mt-2">Checking heuristics and generating nutritional assessment</p>
        </Card>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="md:col-span-1 border-t-4" style={{ borderTopColor: data.healthLabel.color }}>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-muted-foreground text-sm uppercase tracking-wider">Health Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-8 bg-card" style={{ borderColor: `${data.healthLabel.color}33` }}>
                <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    className="transition-all duration-1000 ease-out"
                    cx="50" cy="50" r="46" fill="transparent"
                    stroke={data.healthLabel.color} strokeWidth="8"
                    strokeDasharray={`${(data.score || 0) * 2.89} 289`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex flex-col items-center text-center">
                  <span className="text-5xl font-black tabular-nums">{data.score || '?'}</span>
                  <span className="text-2xl font-bold mt-1" style={{ color: data.healthLabel.color }}>{data.healthLabel.grade}</span>
                </div>
              </div>
              <Badge className="mt-6 text-sm py-1 px-3" style={{ backgroundColor: data.healthLabel.color }}>
                {data.healthLabel.emoji} {data.healthLabel.label}
              </Badge>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{data.name}</CardTitle>
                  <p className="text-muted-foreground capitalize mt-1">Category: {data.category}</p>
                </div>
                {data.aiGenerated && (
                  <Badge variant="outline" className="border-blue-500 text-blue-500 bg-blue-500/10">
                    ✨ AI Generated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted/50 p-4 rounded-lg flex gap-4 items-start">
                <Info className="h-6 w-6 text-primary shrink-0 mt-0.5" />
                <p className="text-base leading-relaxed">{data.summary}</p>
              </div>
              
              <div className="bg-emerald-500/10 p-4 rounded-lg flex gap-4 items-start">
                <Leaf className="h-6 w-6 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-emerald-500 mb-1">Healthier Alternative</h4>
                  <p className="text-base text-emerald-500/90">{data.suggestion}</p>
                </div>
              </div>

              {data.details && (
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-4">Macro Breakdown (per serving)</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="bg-muted rounded-lg p-3">
                      <div className="text-2xl font-bold">{data.details.calories}</div>
                      <div className="text-xs text-muted-foreground uppercase mt-1">Calories</div>
                    </div>
                    <div className="bg-indigo-500/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-indigo-500">{data.details.protein}g</div>
                      <div className="text-xs text-indigo-500/70 uppercase mt-1">Protein</div>
                    </div>
                    <div className="bg-emerald-500/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-emerald-500">{data.details.carbs}g</div>
                      <div className="text-xs text-emerald-500/70 uppercase mt-1">Carbs</div>
                    </div>
                    <div className="bg-amber-500/10 rounded-lg p-3">
                      <div className="text-2xl font-bold text-amber-500">{data.details.fat}g</div>
                      <div className="text-xs text-amber-500/70 uppercase mt-1">Fat</div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
