import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { useToast } from "../ui/use-toast";
import { createWorkspace } from "@/lib/workspace";
import { useAuth } from "@/lib/auth";
import {
  Loader2,
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
} from "lucide-react";

interface WorkspaceSetupModalProps {
  isOpen: boolean;
  onWorkspaceCreated: (workspaceId: string) => void;
}

const WORKSPACE_ICONS = [
  { name: "Home", icon: Home },
  { name: "Briefcase", icon: Briefcase },
  { name: "Folder", icon: Folder },
  { name: "Star", icon: Star },
  { name: "Heart", icon: Heart },
  { name: "Bookmark", icon: Bookmark },
  { name: "Zap", icon: Zap },
  { name: "Coffee", icon: Coffee },
  { name: "Book", icon: Book },
  { name: "Rocket", icon: Rocket },
];

const WorkspaceSetupModal = ({
  isOpen,
  onWorkspaceCreated,
}: WorkspaceSetupModalProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [workspaceIcon, setWorkspaceIcon] = useState("Folder");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "You need to be logged in to create a workspace",
        variant: "destructive",
      });
      return;
    }

    if (!workspaceName.trim()) {
      toast({
        title: "Workspace name required",
        description: "Please enter a name for your workspace",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await createWorkspace(
        workspaceName,
        workspaceIcon,
        user.id,
      );

      if (error) throw error;

      if (data) {
        toast({
          title: "Workspace created",
          description: `${workspaceName} workspace has been created successfully`,
        });
        onWorkspaceCreated(data.id);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error creating workspace",
        description: "There was an error creating your workspace",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} modal={true}>
      <DialogContent className="bg-gray-800 text-white border border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Welcome to Task Graph Manager
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Create your first workspace to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="workspace-name" className="text-white">
              Workspace Name
            </Label>
            <Input
              id="workspace-name"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="My Workspace"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="workspace-icon" className="text-white">
              Icon
            </Label>
            <div className="grid grid-cols-5 gap-2 mt-1">
              {WORKSPACE_ICONS.map((iconObj) => {
                const IconComponent = iconObj.icon;
                return (
                  <Button
                    key={iconObj.name}
                    type="button"
                    variant={
                      workspaceIcon === iconObj.name ? "default" : "outline"
                    }
                    className={`p-2 h-12 w-12 flex items-center justify-center ${workspaceIcon === iconObj.name ? "bg-blue-600" : "bg-gray-700 border-gray-600"}`}
                    onClick={() => setWorkspaceIcon(iconObj.name)}
                  >
                    <IconComponent className="h-6 w-6" />
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            onClick={handleCreateWorkspace}
            disabled={isCreating}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WorkspaceSetupModal;
