import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Clock, CheckCircle } from "lucide-react";

export default function Logs() {
  const [activeTab, setActiveTab] = useState("all");

  const { data: allLogs, isLoading: allLogsLoading } = useQuery({
    queryKey: ["/api/logs"],
  });

  const { data: errorLogs, isLoading: errorLogsLoading } = useQuery({
    queryKey: ["/api/logs/errors"],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "error": return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success": return "bg-green-100 text-green-800";
      case "error": return "bg-red-100 text-red-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      default: return "bg-blue-100 text-blue-800";
    }
  };

  const formatPayload = (payload: any) => {
    if (!payload) return "No payload";
    return JSON.stringify(payload, null, 2).substring(0, 200) + "...";
  };

  if (allLogsLoading || errorLogsLoading) {
    return (
      <>
        <Header title="Logs & Errors" description="Monitor webhook processing logs and system errors" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Logs & Errors" description="Monitor webhook processing logs and system errors" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>System Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="all">All Logs</TabsTrigger>
                <TabsTrigger value="errors">Errors & Warnings</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="space-y-4">
                {allLogs?.map((log: any) => (
                  <div key={log.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <span className="font-medium text-slate-900">{log.method}</span>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        {log.responseTime && (
                          <span>{log.responseTime}ms</span>
                        )}
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    {log.errorMessage && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-3">
                        <p className="text-sm text-red-800">{log.errorMessage}</p>
                      </div>
                    )}
                    
                    <div className="bg-slate-50 rounded p-3">
                      <p className="text-xs text-slate-600 font-medium mb-2">Payload:</p>
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                        {formatPayload(log.payload)}
                      </pre>
                    </div>
                  </div>
                ))}
                
                {allLogs?.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No logs found.
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="errors" className="space-y-4">
                {errorLogs?.map((log: any) => (
                  <div key={log.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(log.status)}
                        <span className="font-medium text-slate-900">{log.method}</span>
                        <Badge className={getStatusColor(log.status)}>
                          {log.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                    
                    {log.errorMessage && (
                      <div className="bg-red-100 border border-red-300 rounded p-3 mb-3">
                        <p className="text-sm text-red-800">{log.errorMessage}</p>
                      </div>
                    )}
                    
                    <div className="bg-white rounded p-3">
                      <p className="text-xs text-slate-600 font-medium mb-2">Payload:</p>
                      <pre className="text-xs text-slate-700 whitespace-pre-wrap">
                        {formatPayload(log.payload)}
                      </pre>
                    </div>
                  </div>
                ))}
                
                {errorLogs?.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No error logs found.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
