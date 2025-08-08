import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

export default function Health() {
  const { data: health, isLoading } = useQuery({
    queryKey: ["/api/health"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "error": return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertTriangle className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-100 text-green-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getBorderColor = (status: string) => {
    switch (status) {
      case "healthy": return "border-green-200";
      case "warning": return "border-yellow-200";
      case "error": return "border-red-200";
      default: return "border-slate-200";
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Health Monitor" description="Real-time system health and service status" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Health Monitor" description="Real-time system health and service status" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Overview</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(health?.status || "unknown")}
                  <Badge className={getStatusColor(health?.status || "unknown")}>
                    {health?.status || "Unknown"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Last updated: {health?.timestamp ? new Date(health.timestamp).toLocaleString() : "Never"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {health?.services && Object.entries(health.services).map(([serviceName, service]: [string, any]) => (
            <Card key={serviceName} className={`border-2 ${getBorderColor(service.status)}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">
                    {serviceName === "database" ? "MongoDB Connection" : 
                     serviceName === "email" ? "Email Service" :
                     serviceName === "sync" ? "External Sync Service" : serviceName}
                  </CardTitle>
                  {getStatusIcon(service.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
                
                <p className="text-sm text-slate-600">
                  {service.message}
                </p>
                
                {service.responseTime && (
                  <div className="text-xs text-slate-500">
                    Response time: {service.responseTime}ms
                  </div>
                )}
                
                {service.lastError && (
                  <div className="bg-red-50 border border-red-200 rounded p-2">
                    <p className="text-xs text-red-600">
                      <strong>Last Error:</strong> {service.lastError}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Test Button */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>System Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/test/webhook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                      });
                      const result = await response.json();
                      alert(result.success ? 'Test webhook successful!' : 'Test webhook failed!');
                    } catch (error) {
                      alert('Test webhook failed!');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Test Webhook Processing
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
