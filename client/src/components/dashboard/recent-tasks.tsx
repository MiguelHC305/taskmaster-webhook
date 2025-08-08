import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function RecentTasks() {
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks/recent", "?limit=4"],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "in-progress": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      default: return "bg-slate-500";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Tasks</CardTitle>
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
        <CardTitle>Recent Tasks</CardTitle>
        <p className="text-sm text-slate-600">Latest task updates from project management systems</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tasks?.map((task: any) => (
            <div key={task.id} className="flex items-center space-x-4 p-3 hover:bg-slate-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${getStatusDotColor(task.status)}`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{task.title}</p>
                <p className="text-xs text-slate-500">
                  {task.projectName} • {new Date(task.updatedAt).toLocaleString()}
                </p>
              </div>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
          ))}
          
          {tasks?.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              No recent tasks found.
            </div>
          )}
        </div>
        
        <Button variant="ghost" className="w-full mt-4 text-primary hover:text-blue-700">
          View all tasks <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
