"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useHistory } from "@/hooks/use-history"
import { useProfile } from "@/context/profile-context"
import { Activity, Battery, Flame, ActivitySquare } from "lucide-react"

export default function Dashboard() {
  const { data, loading } = useHistory("demo-user")
  const { profile } = useProfile()

  const target = profile?.calorieTarget || 2000
  const consumed = data?.summary.totals.calories || 0
  const percentage = Math.min(100, Math.round((consumed / target) * 100))

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Dashboard</h1>
        <p className="text-indigo-200">Your daily nutrition overview, perfectly tailored to your goals.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-0 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-orange-200 uppercase tracking-wider">Calories</CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]">
              <Flame className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white">{consumed} <span className="text-lg text-muted-foreground font-medium">/ {target}</span></div>
            <p className="text-sm text-orange-200/70 mt-1 font-medium">{percentage}% of daily goal</p>
            <Progress value={percentage} className="mt-4 h-2 bg-black/40 [&>div]:bg-gradient-to-r [&>div]:from-orange-400 [&>div]:to-red-500" />
          </CardContent>
        </Card>
        
        <Card className="glass border-0 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-200 uppercase tracking-wider">Protein</CardTitle>
            <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              <Activity className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white">{data?.summary.totals.protein || 0}g</div>
            <p className="text-sm text-blue-200/70 mt-1 font-medium">Target: 150g</p>
          </CardContent>
        </Card>

        <Card className="glass border-0 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-emerald-200 uppercase tracking-wider">Carbs</CardTitle>
            <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Battery className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white">{data?.summary.totals.carbs || 0}g</div>
            <p className="text-sm text-emerald-200/70 mt-1 font-medium">Target: 200g</p>
          </CardContent>
        </Card>

        <Card className="glass border-0 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-yellow-200 uppercase tracking-wider">Fat</CardTitle>
            <div className="h-10 w-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
              <ActivitySquare className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-white">{data?.summary.totals.fat || 0}g</div>
            <p className="text-sm text-yellow-200/70 mt-1 font-medium">Target: 65g</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass border-0 shadow-2xl">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Today's Meals</CardTitle>
            <CardDescription className="text-indigo-200">You've logged {data?.summary.totals.meals || 0} meals today.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-16 w-full animate-pulse rounded-xl bg-white/5"></div>
                <div className="h-16 w-full animate-pulse rounded-xl bg-white/5"></div>
              </div>
            ) : data?.entries && data.entries.length > 0 ? (
              <div className="space-y-4">
                {data.entries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center text-2xl shadow-inner">
                        {entry.emoji}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{entry.foodName}</p>
                        <Badge variant="outline" className="mt-1 border-indigo-500/30 text-indigo-300 bg-indigo-500/10 capitalize">
                          {entry.mealWindow}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-gradient">{entry.calories} cal</p>
                      <p className="text-xs font-semibold tracking-wider text-muted-foreground mt-1 uppercase">
                        <span className="text-blue-400">{entry.protein}g P</span> · <span className="text-emerald-400">{entry.carbs}g C</span> · <span className="text-yellow-400">{entry.fat}g F</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="h-24 w-24 rounded-full bg-white/5 flex items-center justify-center text-5xl mb-6 shadow-inner">🍽️</div>
                <p className="text-indigo-200 text-lg mb-6 max-w-sm">No meals logged yet today. Let's fuel your body with something nutritious.</p>
                <Link href="/planner">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 h-12 px-8 text-lg font-semibold shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all hover:scale-105">
                    Plan a Meal
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3 glass border-0 shadow-2xl flex flex-col">
          <CardHeader className="border-b border-white/5 pb-6">
            <CardTitle className="text-2xl font-bold text-white">Quick Actions</CardTitle>
            <CardDescription className="text-indigo-200">What would you like to do?</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 pt-6 flex-1">
            <Link href="/scanner" className="group relative flex items-center gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 transition-all hover:bg-white/5 hover:border-white/20 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/20 text-2xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:scale-110 transition-transform">🔍</div>
              <div className="relative">
                <p className="font-bold text-lg text-white">Scan Food</p>
                <p className="text-sm text-blue-200/70 font-medium">Check health score</p>
              </div>
            </Link>
            
            <Link href="/planner" className="group relative flex items-center gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 transition-all hover:bg-white/5 hover:border-white/20 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-indigo-500/20 text-2xl text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.4)] group-hover:scale-110 transition-transform">🍽️</div>
              <div className="relative">
                <p className="font-bold text-lg text-white">Get Recommendations</p>
                <p className="text-sm text-indigo-200/70 font-medium">Smart meal planner</p>
              </div>
            </Link>
            
            <Link href="/chat" className="group relative flex items-center gap-5 rounded-2xl border border-white/10 bg-black/20 p-5 transition-all hover:bg-white/5 hover:border-white/20 hover:scale-[1.02] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-500/20 text-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)] group-hover:scale-110 transition-transform">💬</div>
              <div className="relative">
                <p className="font-bold text-lg text-white">Ask Assistant</p>
                <p className="text-sm text-emerald-200/70 font-medium">Chat with AI nutritionist</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
