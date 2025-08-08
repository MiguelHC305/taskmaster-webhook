import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, BarChart3 } from "lucide-react";

export default function Webhooks() {
  const { data: webhooks, isLoading } = useQuery({
    queryKey: ["/api/webhooks"],
  });

  if (isLoading) {
    return (
      <>
        <Header title="Webhook Endpoints" description="Manage and monitor your webhook configurations" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header
        title="Webhook Endpoints"
        description="Manage and monitor your webhook configurations"
        actions={
          <Button className="bg-primary hover:bg-blue-700">
            <i className="fas fa-plus mr-2"></i>
            Add Endpoint
          </Button>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Webhook Endpoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">URL</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Last Activity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Success Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {webhooks?.map((webhook: any) => (
                    <tr key={webhook.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            webhook.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className="text-sm font-medium text-slate-900">{webhook.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{webhook.endpoint}</td>
                      <td className="px-6 py-4">
                        <Badge variant={webhook.isActive ? "default" : "destructive"}>
                          {webhook.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {webhook.lastActivity 
                          ? new Date(webhook.lastActivity).toLocaleString()
                          : "Never"
                        }
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{webhook.successRate}%</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
