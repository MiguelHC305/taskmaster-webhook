import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export default function Header({ title, description, actions }: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-slate-600 mt-1">{description}</p>
        </div>
        <div className="flex items-center space-x-4">
          {actions}
          <div className="relative">
            <Button variant="ghost" size="sm" className="p-2">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
