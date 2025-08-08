import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Webhook, 
  ListTodo, 
  Bell, 
  FileText, 
  Heart, 
  BookOpen, 
  User 
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Webhook Endpoints", href: "/webhooks", icon: Webhook },
  { name: "Task Monitor", href: "/tasks", icon: ListTodo },
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Logs & Errors", href: "/logs", icon: FileText },
  { name: "Health Monitor", href: "/health", icon: Heart },
  { name: "Documentation", href: "/docs", icon: BookOpen },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6 border-b border-slate-200">
        <h1 className="text-xl font-bold text-slate-900">TaskSync Manager</h1>
        <p className="text-sm text-slate-500 mt-1">Webhook Task Management</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                  isActive
                    ? "text-white bg-primary"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <User className="text-white text-sm" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900">Admin User</p>
            <p className="text-xs text-slate-500">System Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
