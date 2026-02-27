import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, BarChart3, GitCompare, ShieldCheck, FileText, Menu, X, Building2, Shield, LogIn, LogOut, Moon, Sun, User, Radio } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/", label: "Home", icon: Leaf },
  { to: "/simulate", label: "Simulate", icon: BarChart3 },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/greenwashing", label: "Greenwash", icon: ShieldCheck },
  { to: "/analytics", label: "Analytics", icon: FileText },
  { to: "/organization", label: "Org", icon: Building2 },
  { to: "/live-auditor", label: "Live Auditor", icon: Radio },
  { to: "/admin", label: "Admin", icon: Shield },
];

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-eco">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Eco<span className="text-gradient-eco">Sim</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/10 border border-primary/20"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center gap-1.5">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 text-sm">
                <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                  {user?.avatar || <User className="h-3 w-3" />}
                </div>
                <span className="text-muted-foreground">{user?.name}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">{user?.role}</span>
              </div>
              <button onClick={logout} className="p-2 rounded-lg text-muted-foreground hover:text-destructive transition-colors" title="Sign out">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden md:flex">
              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                <LogIn className="mr-1.5 h-3.5 w-3.5" /> Sign In
              </Button>
            </Link>
          )}

          {/* Mobile toggle */}
          <button className="lg:hidden text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden border-t border-border bg-background/95 backdrop-blur-xl"
        >
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-medium ${
                location.pathname === item.to ? "text-primary bg-primary/10" : "text-muted-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
          <div className="border-t border-border/50 px-6 py-3">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{user?.name} ({user?.role})</span>
                <button onClick={() => { logout(); setOpen(false); }} className="text-destructive text-sm">Sign Out</button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 text-primary text-sm font-medium">
                <LogIn className="h-4 w-4" /> Sign In
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
