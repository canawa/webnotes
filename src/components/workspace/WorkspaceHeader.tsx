import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User, Settings, Moon, Sun, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "../ui/use-toast";

interface WorkspaceHeaderProps {
  username?: string;
  onLogout?: () => void;
  onSettingsClick?: () => void;
  onSaveWorkspace?: () => Promise<void>;
}

const WorkspaceHeader = ({
  username = "User",
  onLogout = () => console.log("Logout clicked"),
  onSettingsClick = () => console.log("Settings clicked"),
  onSaveWorkspace = async () => console.log("Save workspace clicked"),
}: WorkspaceHeaderProps) => {
  const [darkMode, setDarkMode] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // In a real implementation, this would toggle the theme in the app
  };

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

  return (
    <header className="w-full h-[60px] bg-background border-b border-border flex items-center justify-between px-4 py-2">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-foreground">
          Task Graph Manager
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSaveWorkspace}
          disabled={isSaving}
          title="Save workspace"
        >
          <Save size={18} className={isSaving ? "animate-pulse" : ""} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={onSettingsClick}
          title="Settings"
        >
          <Settings size={18} />
        </Button>

        <div className="flex items-center space-x-2 px-2 py-1 rounded-md bg-secondary/30">
          <User size={18} className="text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {username}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="flex items-center gap-2"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default WorkspaceHeader;
