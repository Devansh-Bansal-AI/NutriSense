"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Settings } from "lucide-react"

import { NAV_ITEMS } from "@/lib/constants"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/context/profile-context"

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const pathname = usePathname()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-transparent">
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 -translate-x-full glass-panel border-r-white/10 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:static md:translate-x-0 md:m-4 md:rounded-3xl md:border",
          isOpen && "translate-x-0"
        )}
      >
        <div className="flex h-20 items-center gap-3 px-8">
          <span className="text-3xl filter drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]">🧠</span>
          <span className="text-2xl font-black tracking-tight text-foreground">NutriSense <span className="text-gradient">AI</span></span>
        </div>
        
        <nav className="flex-1 space-y-2 p-6">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300",
                  isActive 
                    ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-white"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1/2 w-1 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-r-full shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                )}
                <span className={cn("text-xl transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden relative z-0">
        <header className="flex h-16 items-center glass-panel border-b-white/10 px-4 md:hidden z-10 relative">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(true)} className="hover:bg-white/10">
            <Menu className="h-6 w-6 text-white" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <span className="ml-4 text-xl font-black tracking-tight">NutriSense <span className="text-gradient">AI</span></span>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 md:pt-4">
          <div className="mx-auto h-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
