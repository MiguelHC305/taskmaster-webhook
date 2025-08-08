import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: tasks, isLoading } = useQuery({
    queryKey: ["/api/tasks", statusFilter !== "all" ? `?status=${statusFilter}` : ""],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-blue-100 text-blue-800";
      case "low": return "bg-gray-100 text-gray-800";
      default: return "bg-slate-100 text-slate-800";
    }
  };

  if (isLoading) {
    return (
      <>
        <Header title="Task Monitor" description="Track and manage tasks from all project systems" />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-lg"></div>
            ))}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="Task Monitor" description="Track and manage tasks from all project systems" />
      
      <main className="flex-1 overflow-y-auto p-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>All Tasks</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks?.map((task: any) => (
                <div key={task.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">{task.description}</p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600">
                    <div>
                      <span className="font-medium">Project:</span> {task.projectName}
                    </div>
                    <div>
                      <span className="font-medium">Assignee:</span> {task.assignee || "Unassigned"}
                    </div>
                    <div>
                      <span className="font-medium">Source:</span> {task.sourceSystem}
                    </div>
                    <div>
                      <span className="font-medium">Updated:</span> {new Date(task.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {task.completedAt && (
                    <div className="mt-2 text-sm text-green-600">
                      <span className="font-medium">Completed:</span> {new Date(task.completedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              ))}
              
              {tasks?.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No tasks found matching the current filter.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
