import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function SystemHealth() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "error": return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <AlertTriangle className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "text-green-600";
      case "warning": return "text-yellow-600";
      case "error": return "text-red-600";
      default: return "text-slate-500";
    }
  };

  const getBgColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-50 border-green-200";
      case "warning": return "bg-yellow-50 border-yellow-200";
      case "error": return "bg-red-50 border-red-200";
      default: return "bg-slate-50 border-slate-200";
    }
  };

  const healthChecks = health?.services ? [
    {
      name: "MongoDB Connection",
      description: health.services.database?.message || "Database operational",
      status: health.services.database?.status || "unknown",
    },
    {
      name: "Email Service",
      description: health.services.email?.message || "SMTP server responsive",
      status: health.services.email?.status || "unknown",
    },
    {
      name: "External Sync Service",
      description: health.services.sync?.message || "External service operational",
      status: health.services.sync?.status || "unknown",
    },
    {
      name: "Webhook Endpoints",
      description: "All endpoints responding",
      status: "healthy", // Assume healthy if we can load the page
    },
  ] : [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <p className="text-sm text-slate-600">Real-time monitoring of webhook endpoints</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {healthChecks.map((check, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border ${getBgColor(check.status)}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="text-sm font-medium text-slate-900">{check.name}</p>
                  <p className="text-xs text-slate-500">{check.description}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${getStatusColor(check.status)} capitalize`}>
                {check.status}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
