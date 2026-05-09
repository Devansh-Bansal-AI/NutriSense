"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useRecommendations } from "@/hooks/use-recommendations"
import { useHistory } from "@/hooks/use-history"
import { useProfile } from "@/context/profile-context"
import { toast } from "sonner"
import { HealthGoal, MealWindow, ActivityLevel, BudgetLevel } from "@/types/profile"
import { Sparkles, CheckCircle2, Clock, DollarSign, Leaf } from "lucide-react"

export default function PlannerPage() {
  const { profile } = useProfile()
  
  const [goal, setGoal] = React.useState<HealthGoal>(profile?.goal || "generalHealth")
  const [mealWindow, setMealWindow] = React.useState<MealWindow>("lunch")
  const [activityLevel, setActivityLevel] = React.useState<ActivityLevel>(profile?.activityLevel || "moderate")
  const [budget, setBudget] = React.useState<BudgetLevel>(profile?.budget || "medium")

  // Sync state if profile loads slightly later
  React.useEffect(() => {
    if (profile) {
      setGoal(profile.goal)
      setActivityLevel(profile.activityLevel)
      setBudget(profile.budget)
    }
  }, [profile])

  const { data, loading, getRecommendations } = useRecommendations()
  const { logMeal } = useHistory("demo-user") // Using demo user
  const [loggingIds, setLoggingIds] = React.useState<Set<string>>(new Set())

  const handleGenerate = () => {
    getRecommendations({ goal, mealWindow, activityLevel, budget, userId: "demo-user" })
  }

  const handleLogMeal = async (food: any) => {
    setLoggingIds(prev => new Set(prev).add(food.id))
    const success = await logMeal({
      id: Date.now().toString(),
      foodId: food.id,
      foodName: food.name,
      emoji: food.emoji,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      mealWindow: mealWindow,
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0]
    })

    if (success) {
      toast.success(`Logged ${food.name} for ${mealWindow}!`)
    } else {
      toast.error("Failed to log meal. Backend might not be configured.")
    }
    setLoggingIds(prev => {
      const next = new Set(prev)
      next.delete(food.id)
      return next
    })
  }

  return (
    <div className="mx-auto max-w-5xl flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Smart Meal Planner</h1>
        <p className="text-indigo-200">Personalized recommendations based on your goals, time, and budget.</p>
      </div>

      <Card className="glass border-0 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
        <CardContent className="pt-8 relative z-10">
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <div className="space-y-3">
              <label className="text-sm font-bold text-indigo-300 uppercase tracking-wider">🎯 Goal</label>
              <Select value={goal} onValueChange={(v) => setGoal(v as HealthGoal)}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus:ring-indigo-500"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="weightLoss">Weight Loss</SelectItem>
                  <SelectItem value="muscleGain">Muscle Gain</SelectItem>
                  <SelectItem value="generalHealth">General Health</SelectItem>
                  <SelectItem value="energyBoost">Energy Boost</SelectItem>
                  <SelectItem value="heartHealth">Heart Health</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-indigo-300 uppercase tracking-wider">🕐 Meal Time</label>
              <Select value={mealWindow} onValueChange={(v) => setMealWindow(v as MealWindow)}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus:ring-indigo-500"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="breakfast">Breakfast</SelectItem>
                  <SelectItem value="morningSnack">Morning Snack</SelectItem>
                  <SelectItem value="lunch">Lunch</SelectItem>
                  <SelectItem value="afternoonSnack">Afternoon Snack</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="lateNight">Late Night Snack</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-indigo-300 uppercase tracking-wider">🏃 Activity</label>
              <Select value={activityLevel} onValueChange={(v) => setActivityLevel(v as ActivityLevel)}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus:ring-indigo-500"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="intense">Intense</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <label className="text-sm font-bold text-indigo-300 uppercase tracking-wider">💰 Budget</label>
              <Select value={budget} onValueChange={(v) => setBudget(v as BudgetLevel)}>
                <SelectTrigger className="bg-black/20 border-white/10 text-white h-12 rounded-xl focus:ring-indigo-500"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Budget Friendly</SelectItem>
                  <SelectItem value="medium">Standard</SelectItem>
                  <SelectItem value="high">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={loading} className="w-full md:w-auto text-lg h-14 px-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-[0_0_30px_rgba(139,92,246,0.3)] transition-all hover:scale-105 font-bold">
            {loading ? (
              <span className="flex items-center gap-3"><div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Analyzing 10k+ Combinations...</span>
            ) : (
              <span className="flex items-center gap-3"><Sparkles className="h-6 w-6" /> Generate Smart Recommendations</span>
            )}
          </Button>
        </CardContent>
      </Card>

      {loading && !data && (
        <div className="flex flex-col items-center justify-center p-20 text-center text-indigo-200 animate-pulse bg-white/5 rounded-3xl border border-white/5">
          <Sparkles className="h-16 w-16 mb-6 text-indigo-400 opacity-50 animate-bounce" />
          <p className="text-2xl font-bold text-white">Synthesizing nutrition data...</p>
          <p className="text-sm mt-2 opacity-70">Cross-referencing your goals with metabolic profiles.</p>
        </div>
      )}

      {data && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-3xl font-black text-white">Top Matches</h2>
            <div className="flex gap-3 text-sm text-indigo-200">
              <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 px-3 py-1 text-sm">{data.context.mealLabel}</Badge>
              <Badge variant="outline" className="border-white/10 bg-white/5 px-3 py-1 text-sm">Analyzed {data.meta.totalCandidates} foods</Badge>
            </div>
          </div>

          <div className="grid gap-8">
            {data.recommendations.map((rec, i) => (
              <Card key={rec.food.id} className="overflow-hidden glass border-0 border-l-4 shadow-2xl transition-transform hover:scale-[1.01]" style={{ borderLeftColor: rec.healthLabel.color }}>
                <div className="grid md:grid-cols-3">
                  <div className="p-8 md:col-span-2 border-r border-white/5 relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                    
                    <div className="flex items-start justify-between relative z-10">
                      <div className="flex gap-6">
                        <span className="text-6xl drop-shadow-xl">{rec.food.emoji}</span>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-0 px-2 py-0.5 text-lg font-black">#{rec.rank}</Badge>
                            <h3 className="text-2xl font-black text-white">{rec.food.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {rec.food.tags.map(tag => (
                              <span key={tag} className="text-xs font-bold uppercase tracking-wider bg-white/10 px-3 py-1 rounded-full text-indigo-100">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-center bg-black/40 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/5 shadow-inner">
                        <div className="text-4xl font-black" style={{ color: rec.healthLabel.color }}>{rec.compositeScore}</div>
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Match Score</div>
                      </div>
                    </div>

                    <div className="mt-8 bg-black/20 rounded-2xl p-6 border border-white/5 relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">🧠</span>
                        <h4 className="font-bold text-lg text-white">Why this recommendation</h4>
                        <Badge variant="outline" className="ml-auto text-xs font-bold uppercase tracking-wider border-amber-500/30 text-amber-400 bg-amber-500/10">
                          {rec.confidence.icon} {rec.confidence.label}
                        </Badge>
                      </div>
                      <ul className="space-y-3">
                        {rec.explanation.map((exp, j) => (
                          <li key={j} className="flex items-start gap-3 text-sm text-indigo-100">
                            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                            <span className="leading-relaxed">{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="p-8 bg-black/40 flex flex-col justify-between border-l border-white/5">
                    <div>
                      <h4 className="font-bold mb-6 text-xs text-indigo-300 uppercase tracking-widest">Macro Breakdown</h4>
                      <div className="flex gap-4 text-center mb-6">
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="font-black text-2xl text-white">{rec.food.calories}</div>
                          <div className="text-[10px] font-bold uppercase text-muted-foreground mt-1">Calories</div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="font-black text-2xl" style={{ color: rec.macroBreakdown.protein.color }}>{rec.food.protein}g</div>
                          <div className="text-[10px] font-bold uppercase mt-1" style={{ color: rec.macroBreakdown.protein.color }}>Protein</div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="font-black text-2xl" style={{ color: rec.macroBreakdown.carbs.color }}>{rec.food.carbs}g</div>
                          <div className="text-[10px] font-bold uppercase mt-1" style={{ color: rec.macroBreakdown.carbs.color }}>Carbs</div>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-xl p-3 border border-white/5">
                          <div className="font-black text-2xl" style={{ color: rec.macroBreakdown.fat.color }}>{rec.food.fat}g</div>
                          <div className="text-[10px] font-bold uppercase mt-1" style={{ color: rec.macroBreakdown.fat.color }}>Fat</div>
                        </div>
                      </div>
                      
                      <div className="flex w-full h-3 rounded-full overflow-hidden mb-8 bg-black/50 shadow-inner">
                        <div style={{ width: `${rec.macroBreakdown.protein.percent}%`, backgroundColor: rec.macroBreakdown.protein.color }} />
                        <div style={{ width: `${rec.macroBreakdown.carbs.percent}%`, backgroundColor: rec.macroBreakdown.carbs.color }} />
                        <div style={{ width: `${rec.macroBreakdown.fat.percent}%`, backgroundColor: rec.macroBreakdown.fat.color }} />
                      </div>

                      <div className="flex justify-between items-center text-xs font-semibold tracking-wider text-indigo-200 mb-8 px-2">
                        <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-indigo-400"/> {rec.food.prepTime} min</span>
                        <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-emerald-400"/> {rec.food.budget}</span>
                        <span className="flex items-center gap-1.5"><Leaf className="h-4 w-4 text-green-400"/> {rec.food.fiber}g fiber</span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full h-14 rounded-xl text-lg font-bold border-0 transition-all ${loggingIds.has(rec.food.id) ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                      onClick={() => handleLogMeal(rec.food)}
                      disabled={loggingIds.has(rec.food.id)}
                    >
                      {loggingIds.has(rec.food.id) ? "✓ Logged" : "+ Log This Meal"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
