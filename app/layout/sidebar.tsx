import {
  Calendar,
  DollarSign,
  Image,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PieChart,
  Plus,
  User,
  Sparkles,
  Building2,
  Bell,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserProfile {
  full_name: string;
  email: string;
  avatar_url?: string;
}

interface SidebarProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
  userProfile: UserProfile | null;
  loading: boolean;
  onSignOut: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const menuItems = [
  { id: "new-event", label: "Create New Event", icon: Plus, special: true }, // Add special flag
  { id: "overview", label: "Event Overview", icon: LayoutDashboard },
  { id: "budget", label: "Budget Tracker", icon: DollarSign },
  { id: "recommendations", label: "Recommendations", icon: Sparkles },
  { id: "venue", label: "Venue Visualization", icon: Building2 },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "profile", label: "Profile & Settings", icon: Settings },
];

export function Sidebar({ activePanel, setActivePanel, userProfile, loading, onSignOut }: SidebarProps) {
  return (
    <div className="w-64 border-r bg-white/80 backdrop-blur-sm flex flex-col h-screen sticky top-0">
      {/* User Profile Section */}
      <div className="px-4 py-6 border-b">
        {loading ? (
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ) : userProfile ? (
          <div className="flex items-center gap-4 group">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <Avatar className="relative ring-2 ring-primary/20">
                <AvatarImage src={userProfile.avatar_url} alt={userProfile.full_name} />
                <AvatarFallback>{getInitials(userProfile.full_name)}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="text-sm font-medium">{userProfile.full_name}</p>
              <p className="text-xs text-muted-foreground">{userProfile.email}</p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Logo Section */}
      <div className="px-6 py-3 border-b">
        <div className="flex items-center gap-2 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <Calendar className="relative h-6 w-6 text-primary transform group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-xl">
            <span className="font-normal">Plan</span>
            <span className="font-bold text-primary">Smart</span>
          </span>
        </div>
      </div>

      {/* Start New Event Button */}
      {/* Remove or comment out the separate New Event button section */}
      {/* <div className="px-4 py-4">
        <Button className="w-full gap-2 bg-gradient-to-r from-primary to-purple-500...">
          <Plus className="h-4 w-4 transform group-hover:scale-110 transition-transform duration-300" />
          Start New Event
        </Button>
      </div> */}

      {/* Navigation Menu */}
      <nav className="px-4 py-2 flex-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant="ghost"  // Changed from 'gradient' to 'ghost'
              className={cn(
                "w-full justify-start gap-2 mb-1 group relative overflow-hidden",
                item.special ? "bg-gradient-to-r from-primary to-purple-500 hover:from-primary/95 hover:to-purple-500/95 text-white shadow-md hover:shadow-lg hover:shadow-primary/25" : "",
                !item.special && activePanel === item.id && "bg-primary/10 text-primary"
              )}
              onClick={() => {
                setActivePanel(item.id);
                console.log('Active Panel:', item.id); // Add this line for debugging
              }}
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                !item.special && "bg-gradient-to-r from-primary/10 to-purple-500/10"
              )} />
              <Icon className="h-4 w-4 relative transform group-hover:scale-110 transition-transform duration-300" />
              <span className="relative">{item.label}</span>
            </Button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t p-4">
        <Button 
          variant="outline" 
          className="w-full gap-2 rounded-xl hover:bg-primary/5 transition-colors group"
          onClick={onSignOut}
        >
          <LogOut className="h-4 w-4 transform group-hover:scale-110 transition-transform duration-300" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}