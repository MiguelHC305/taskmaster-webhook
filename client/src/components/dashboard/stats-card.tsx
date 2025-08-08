import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change: string;
  changeType: "positive" | "negative";
  color: "blue" | "green" | "red" | "yellow";
}

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType, 
  color 
}: StatsCardProps) {
  const getIconBgColor = (color: string) => {
    switch (color) {
      case "blue": return "bg-blue-100";
      case "green": return "bg-green-100";
      case "red": return "bg-red-100";
      case "yellow": return "bg-yellow-100";
      default: return "bg-slate-100";
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case "blue": return "text-blue-600";
      case "green": return "text-green-600";
      case "red": return "text-red-600";
      case "yellow": return "text-yellow-600";
      default: return "text-slate-600";
    }
  };

  const ChangeIcon = changeType === "positive" ? ArrowUp : ArrowDown;
  const changeColor = changeType === "positive" ? "text-green-600" : "text-red-600";

  return (
    <Card className="shadow-sm border border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${getIconBgColor(color)}`}>
            <Icon className={`h-6 w-6 ${getIconColor(color)}`} />
          </div>
        </div>
        <p className={`text-sm ${changeColor} mt-2 flex items-center`}>
          <ChangeIcon className="h-4 w-4 mr-1" />
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
