import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Authentication from "@/pages/authentication";
import ApiDocs from "@/pages/api-docs";
import { BarChart3, KeyRound, FileCode2 } from "lucide-react";

function TabNavigation() {
  const [location] = useLocation();

  const tabs = [
    { path: "/", label: "Dashboard", icon: BarChart3, testId: "tab-dashboard" },
    { path: "/auth", label: "Authentication", icon: KeyRound, testId: "tab-authentication" },
    { path: "/docs", label: "API Documentation", icon: FileCode2, testId: "tab-docs" },
  ];

  return (
    <nav className="border-b border-border bg-card" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location === tab.path;
            return (
              <Link key={tab.path} href={tab.path}>
                <div
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 transition-colors cursor-pointer
                    ${isActive 
                      ? "border-primary text-foreground font-medium" 
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                    }
                  `}
                  data-testid={tab.testId}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/auth" component={Authentication} />
      <Route path="/docs" component={ApiDocs} />
      <Route>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
            <p className="text-muted-foreground mb-6">Page not found</p>
            <Link href="/">
              <a className="text-primary hover:underline">Return to Dashboard</a>
            </Link>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <TabNavigation />
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
