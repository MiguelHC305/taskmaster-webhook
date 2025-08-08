import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Edit } from "lucide-react";

export default function Notifications() {
  const { data: notifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
  });

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/email-templates"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "failed": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  if (notificationsLoading || templatesLoading) {
    return (
      <>
        <Header title="Notifications" description="Manage email templates and notification history" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Notifications" description="Manage email templates and notification history" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email Templates */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Email Templates</CardTitle>
                <Button variant="outline">
                  <i className="fas fa-plus mr-2"></i>
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates?.map((template: any) => (
                <div key={template.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-sm font-medium text-slate-900">{template.name}</h4>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-600 mb-3">
                    Type: {template.type} • 
                    {template.isActive ? " Active" : " Inactive"}
                  </p>
                  <div className="bg-slate-50 rounded p-3 text-xs text-slate-700">
                    <strong>Subject:</strong> {template.subject}<br />
                    <strong>Body:</strong> {template.body.substring(0, 100)}...
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notification History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications?.map((notification: any) => (
                  <div key={notification.id} className="flex space-x-4 p-3 hover:bg-slate-50 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900">{notification.subject}</p>
                      <p className="text-xs text-slate-500">To: {notification.recipient}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                      {notification.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">{notification.errorMessage}</p>
                      )}
                    </div>
                    <Badge className={getStatusColor(notification.status)}>
                      {notification.status}
                    </Badge>
                  </div>
                ))}
                
                {notifications?.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    No notifications found.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
