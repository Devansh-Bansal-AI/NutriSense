"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useHistory } from "@/hooks/use-history"
import { Flame, CalendarDays, BatteryCharging, Dumbbell, ClipboardList } from "lucide-react"

export default function TrackerPage() {
  const { data, loading } = useHistory("demo-user")

  return (
    <div className="mx-auto max-w-5xl flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-white drop-shadow-md">Habit Tracker</h1>
        <p className="text-indigo-200">Track your nutrition consistency and build healthier eating patterns over time.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-rose-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <Flame className="h-8 w-8" />
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-rose-400 drop-shadow-sm">
              {data?.entries.length ? "1" : "0"}
            </div>
            <p className="text-xs font-bold text-orange-200/70 mt-2 uppercase tracking-widest">Day Streak</p>
          </CardContent>
        </Card>
        
        <Card className="glass overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <CalendarDays className="h-8 w-8" />
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 drop-shadow-sm">
              {data?.entries.length ? "1/7" : "0/7"}
            </div>
            <p className="text-xs font-bold text-blue-200/70 mt-2 uppercase tracking-widest">Days Logged</p>
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <BatteryCharging className="h-8 w-8" />
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-sm">
              {data?.summary.totals.calories || 0}
            </div>
            <p className="text-xs font-bold text-emerald-200/70 mt-2 uppercase tracking-widest">Avg Cal/Day</p>
          </CardContent>
        </Card>

        <Card className="glass overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-50 group-hover:opacity-100 transition-opacity" />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center relative z-10">
            <div className="h-16 w-16 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <Dumbbell className="h-8 w-8" />
            </div>
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 drop-shadow-sm">
              {data?.summary.totals.protein || 0}g
            </div>
            <p className="text-xs font-bold text-indigo-200/70 mt-2 uppercase tracking-widest">Avg Protein</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-0 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        <CardHeader className="pb-8 pt-8 px-8 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black text-white tracking-wide">Meal History</CardTitle>
              <CardDescription className="text-indigo-200 mt-1">Your logged meals over the past 7 days.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 relative z-10">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center animate-pulse">
              <div className="h-12 w-12 rounded-full border-4 border-indigo-500/30 border-t-indigo-500 animate-spin mb-4" />
              <p className="text-indigo-200 font-bold tracking-wider uppercase text-sm">Syncing History...</p>
            </div>
          ) : data?.entries && data.entries.length > 0 ? (
            <div className="divide-y divide-white/5">
              {data.entries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-8 hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-6">
                    <span className="text-5xl drop-shadow-xl">{entry.emoji}</span>
                    <div>
                      <p className="text-xl font-black text-white tracking-wide">{entry.foodName}</p>
                      <p className="text-sm font-semibold text-indigo-300 mt-1 uppercase tracking-wider">
                        {new Date(entry.timestamp).toLocaleDateString()} at {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • <span className="text-emerald-400">{entry.mealWindow}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-white">{entry.calories} cal</p>
                    <div className="flex gap-2 mt-2 justify-end">
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">P: {entry.protein}g</span>
                      <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">C: {entry.carbs}g</span>
                      <span className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">F: {entry.fat}g</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="text-6xl mb-6 opacity-30 drop-shadow-lg">📋</span>
              <p className="text-xl font-bold text-white mb-2">No history found for the past 7 days.</p>
              <p className="text-sm text-indigo-200">Log meals from the Planner to see them here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

