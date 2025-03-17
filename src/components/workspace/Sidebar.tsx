import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  Settings,
  Moon,
  Sun,
  Save,
  FolderOpen,
  Home,
  Briefcase,
  Folder,
  Star,
  Heart,
  Bookmark,
  Zap,
  Coffee,
  Book,
  Rocket,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { getUserWorkspaces, createWorkspace } from "@/lib/workspace";
import { useAuth } from "@/lib/auth";
import CreateWorkspaceModal from "./CreateWorkspaceModal";
import { useTheme } from "@/lib/theme";
import SettingsDialog from "../ui/settings-dialog";
import PomodoroModal from "./PomodoroModal";
import DraggableTimer from "./DraggableTimer";

interface Workspace {
  id: string;
  name: string;
  icon: string;
  user_id: string;
}

interface SidebarProps {
  username?: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onSaveWorkspace?: () => Promise<void>;
  onWorkspaceChange?: (workspaceId: string) => void;
  currentWorkspaceId?: string;
}

const Sidebar = ({
  username = "User",
  onLogout = () => console.log("Logout clicked"),
  onSettingsClick = () => console.log("Settings clicked"),
  onSaveWorkspace = async () => console.log("Save workspace clicked"),
  onWorkspaceChange = (id) => console.log("Workspace changed to", id),
  currentWorkspaceId,
}: SidebarProps) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const MAX_WORKSPACES = 3;
  const { toast } = useToast();

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Home":
        return <Home size={18} />;
      case "Briefcase":
        return <Briefcase size={18} />;
      case "Folder":
        return <Folder size={18} />;
      case "Star":
        return <Star size={18} />;
      case "Heart":
        return <Heart size={18} />;
      case "Bookmark":
        return <Bookmark size={18} />;
      case "Zap":
        return <Zap size={18} />;
      case "Coffee":
        return <Coffee size={18} />;
      case "Book":
        return <Book size={18} />;
      case "Rocket":
        return <Rocket size={18} />;
      default:
        return <Folder size={18} />;
    }
  };

  // Fetch workspaces when user changes
  useEffect(() => {
    const fetchWorkspaces = async () => {
      if (!user) return;

      setIsLoading(true);
      try {
        const { data, error } = await getUserWorkspaces(user.id);
        if (error) throw error;

        if (data && data.length > 0) {
          // Limit to MAX_WORKSPACES
          const limitedWorkspaces = data.slice(0, MAX_WORKSPACES);
          setWorkspaces(limitedWorkspaces);
          // If no workspace is selected, select the first one
          if (!currentWorkspaceId) {
            onWorkspaceChange(limitedWorkspaces[0].id);
          }
        } else {
          // If no workspaces exist, create a default "Personal" workspace
          const { data: newWorkspace, error: createError } =
            await createWorkspace("Personal", "Home", user.id);

          if (createError) throw createError;

          if (newWorkspace) {
            setWorkspaces([newWorkspace]);
            onWorkspaceChange(newWorkspace.id);
          }
        }
      } catch (error) {
        console.error("Error fetching workspaces:", error);
        toast({
          title: "Error",
          description: "Failed to load workspaces",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, [user, onWorkspaceChange]);

  const handleSaveWorkspace = async () => {
    setIsSaving(true);
    try {
      await onSaveWorkspace();
      toast({
        title: "Workspace saved",
        description: "Your workspace has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error saving workspace",
        description: "There was an error saving your workspace",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWorkspaceCreated = (workspaceId: string) => {
    // Refresh workspaces list
    if (user) {
      getUserWorkspaces(user.id).then(({ data }) => {
        if (data) {
          // Limit to MAX_WORKSPACES
          const limitedWorkspaces = data.slice(0, MAX_WORKSPACES);
          setWorkspaces(limitedWorkspaces);
          // Switch to the newly created workspace
          onWorkspaceChange(workspaceId);
        }
      });
    }
  };

  return (
    <div
      className={`h-screen w-64 flex flex-col ${theme === "dark" ? "bg-gray-800 border-r border-gray-700" : "bg-gray-100 border-r border-gray-300"}`}
    >
      <div
        className={`p-4 border-b ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
      >
        <h1
          className={`text-xl font-semibold ${theme === "dark" ? "text-white" : "text-gray-800"}`}
        >
          webnotes
        </h1>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2
              className={`text-sm font-medium ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              WORKSPACES
            </h2>
            <span
              className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
            >
              {workspaces.length}/{MAX_WORKSPACES}
            </span>
          </div>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-1">
              {workspaces.map((workspace) => (
                <Button
                  key={workspace.id}
                  variant={
                    workspace.id === currentWorkspaceId ? "secondary" : "ghost"
                  }
                  className={cn(
                    "w-full justify-start",
                    workspace.id === currentWorkspaceId
                      ? theme === "dark"
                        ? "bg-gray-700 text-white"
                        : "bg-gray-200 text-gray-800"
                      : theme === "dark"
                        ? "text-gray-300 hover:text-white hover:bg-gray-700/50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-200/70",
                  )}
                  onClick={() => onWorkspaceChange(workspace.id)}
                >
                  <div className="flex items-center w-full">
                    <span className="mr-2">
                      {getIconComponent(workspace.icon)}
                    </span>
                    <span>{workspace.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>

        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            className={`w-full justify-start ${theme === "dark" ? "text-blue-400 border-blue-500/30 hover:bg-blue-500/10" : "text-blue-600 border-blue-400/30 hover:bg-gray-200/70 hover:text-gray-900"}`}
            onClick={() => setIsCreateModalOpen(true)}
            disabled={workspaces.length >= MAX_WORKSPACES}
          >
            <FolderOpen size={16} className="mr-2" />
            <span>Create New Workspace</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className={`w-full justify-start mt-4 ${theme === "dark" ? "text-green-400 border-green-500/30 hover:bg-green-500/10" : "text-green-600 border-green-400/30 hover:bg-gray-200/70 hover:text-gray-900"}`}
            onClick={() => setIsPomodoroOpen(true)}
          >
            <Clock size={16} className="mr-2" />
            <span>Pomodoro Timer</span>
          </Button>
        </div>
      </div>

      <div
        className={`p-4 border-t space-y-3 ${theme === "dark" ? "border-gray-700" : "border-gray-300"}`}
      >
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            title={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            className={
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-[rgb(180,120,100)] hover:text-[rgb(150,90,70)]"
            }
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSaveWorkspace}
            disabled={isSaving}
            title="Save workspace"
            className={
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }
          >
            <Save size={18} className={isSaving ? "animate-pulse" : ""} />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            title="Settings"
            className={
              theme === "dark"
                ? "text-gray-300 hover:text-white"
                : "text-[rgb(180,120,100)] hover:text-[rgb(150,90,70)]"
            }
          >
            <Settings size={18} />
          </Button>
        </div>

        <div
          className={`flex items-center space-x-2 px-2 py-1 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-gray-200"}`}
        >
          <User
            size={18}
            className={theme === "dark" ? "text-gray-400" : "text-gray-500"}
          />
          <span
            className={`text-sm font-medium ${theme === "dark" ? "text-white" : "text-gray-800"}`}
          >
            {username}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className={`w-full flex items-center justify-center gap-2 ${theme === "dark" ? "text-gray-300 hover:text-white border-gray-700 hover:bg-gray-700" : "text-gray-600 hover:text-gray-900 border-gray-300 hover:bg-gray-200"}`}
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>

      <CreateWorkspaceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />

      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
      />

      <DraggableTimer />
    </div>
  );
};

export default Sidebar;
