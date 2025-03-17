import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { createWorkspace } from "@/lib/workspace";
import { useAuth } from "@/lib/auth";
import {
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

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkspaceCreated: (workspaceId: string) => void;
}

const ICON_OPTIONS = [
  { name: "Home", icon: <Home size={20} /> },
  { name: "Briefcase", icon: <Briefcase size={20} /> },
  { name: "Folder", icon: <Folder size={20} /> },
  { name: "Star", icon: <Star size={20} /> },
  { name: "Heart", icon: <Heart size={20} /> },
  { name: "Bookmark", icon: <Bookmark size={20} /> },
  { name: "Zap", icon: <Zap size={20} /> },
  { name: "Coffee", icon: <Coffee size={20} /> },
  { name: "Book", icon: <Book size={20} /> },
  { name: "Rocket", icon: <Rocket size={20} /> },
];

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onWorkspaceCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("Home");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast({
        title: "Error",
        description: "Please enter a workspace name",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a workspace",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await createWorkspace(
        name,
        selectedIcon,
        user.id,
      );

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: `Workspace "${name}" created successfully`,
      });

      onWorkspaceCreated(data.id);
      onClose();
      setName("");
      setSelectedIcon("Home");
    } catch (error) {
      console.error("Error creating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to create workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-800 text-white border border-gray-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Create New Workspace
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new workspace to organize your tasks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Workspace Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Workspace"
              className="bg-gray-700 border-gray-600 text-white"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Workspace Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {ICON_OPTIONS.map((option) => (
                <Button
                  key={option.name}
                  type="button"
                  variant={
                    selectedIcon === option.name ? "secondary" : "outline"
                  }
                  className={`p-2 h-auto aspect-square flex items-center justify-center ${selectedIcon === option.name ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:text-white border-gray-600"}`}
                  onClick={() => setSelectedIcon(option.name)}
                >
                  {option.icon}
                </Button>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-transparent border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {isCreating ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateWorkspaceModal;
