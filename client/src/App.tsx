import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import Webhooks from "@/pages/webhooks";
import Tasks from "@/pages/tasks";
import Notifications from "@/pages/notifications";
import Logs from "@/pages/logs";
import Health from "@/pages/health";
import Docs from "@/pages/docs";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/webhooks" component={Webhooks} />
          <Route path="/tasks" component={Tasks} />
          <Route path="/notifications" component={Notifications} />
          <Route path="/logs" component={Logs} />
          <Route path="/health" component={Health} />
          <Route path="/docs" component={Docs} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
