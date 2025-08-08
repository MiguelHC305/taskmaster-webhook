import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import StatsCard from "@/components/dashboard/stats-card";
import RecentTasks from "@/components/dashboard/recent-tasks";
import SystemHealth from "@/components/dashboard/system-health";
import WebhookTable from "@/components/dashboard/webhook-table";
import { Activity, Clock, AlertTriangle, Webhook } from "lucide-react";

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const statsData = [
    {
      title: "Active Webhooks",
      value: stats?.activeWebhooks || 0,
      icon: Webhook,
      change: "+2 from yesterday",
      changeType: "positive" as const,
      color: "blue" as const,
    },
    {
      title: "Tasks Processed",
      value: stats?.tasksProcessed || 0,
      icon: Activity,
      change: "+15% from last week",
      changeType: "positive" as const,
      color: "green" as const,
    },
    {
      title: "Failed Requests",
      value: stats?.failedRequests || 0,
      icon: AlertTriangle,
      change: "-5% from yesterday",
      changeType: "negative" as const,
      color: "red" as const,
    },
    {
      title: "Avg Response Time",
      value: `${stats?.avgResponseTime || 0}ms`,
      icon: Clock,
      change: "-12ms from last hour",
      changeType: "negative" as const,
      color: "yellow" as const,
    },
  ];

  return (
    <>
      <Header
        title="Dashboard"
        description="Monitor webhook performance and task processing"
        actions={
          <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
            <i className="fas fa-plus mr-2"></i>
            New Webhook
          </button>
        }
      />
      
      <main className="flex-1 overflow-y-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecentTasks />
          <SystemHealth />
        </div>

        <WebhookTable />
      </main>
    </>
  );
}
