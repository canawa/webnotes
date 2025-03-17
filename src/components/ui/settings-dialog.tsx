import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/components/workspace/WorkspaceContext";
import { useTheme } from "@/lib/theme";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Pencil,
  Trash2,
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
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { updateWorkspace, deleteWorkspace } from "@/lib/workspace";

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
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

const SettingsDialog: React.FC<SettingsDialogProps> = ({ isOpen, onClose }) => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const {
    workspaces,
    currentWorkspace,
    setCurrentWorkspace,
    refreshWorkspaces,
  } = useWorkspace();

  const [activeTab, setActiveTab] = useState("workspaces");
  const [editingWorkspace, setEditingWorkspace] = useState<{
    id: string;
    name: string;
    icon: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<string | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEditingWorkspace(null);
      setWorkspaceToDelete(null);
      setIsDeleting(false);
      setIsProcessing(false);
    }
  }, [isOpen]);

  const handleStartEdit = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setEditingWorkspace({
        id: workspace.id,
        name: workspace.name,
        icon: workspace.icon,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingWorkspace(null);
  };

  const handleSaveWorkspace = async () => {
    if (!editingWorkspace) return;

    setIsProcessing(true);
    try {
      const { data, error } = await updateWorkspace(editingWorkspace.id, {
        name: editingWorkspace.name,
        icon: editingWorkspace.icon,
      });

      if (error) throw error;

      toast({
        title: "Workspace updated",
        description: "Workspace has been updated successfully",
      });

      // Update current workspace if it was the one edited
      if (currentWorkspace && currentWorkspace.id === editingWorkspace.id) {
        setCurrentWorkspace(data);
      }

      await refreshWorkspaces();
      setEditingWorkspace(null);
    } catch (error) {
      console.error("Error updating workspace:", error);
      toast({
        title: "Error",
        description: "Failed to update workspace",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!workspaceToDelete) return;

    setIsProcessing(true);
    try {
      const { error } = await deleteWorkspace(workspaceToDelete);
      if (error) throw error;

      toast({
        title: "Workspace deleted",
        description: "Workspace has been deleted successfully",
      });

      // If the deleted workspace was the current one, switch to another workspace
      if (currentWorkspace && currentWorkspace.id === workspaceToDelete) {
        const remainingWorkspaces = workspaces.filter(
          (w) => w.id !== workspaceToDelete,
        );
        if (remainingWorkspaces.length > 0) {
          setCurrentWorkspace(remainingWorkspaces[0]);
        } else {
          // No workspaces left, handle this case
          // This should redirect to workspace creation
        }
      }

      await refreshWorkspaces();
      setWorkspaceToDelete(null);
      setIsDeleting(false);
    } catch (error) {
      console.error("Error deleting workspace:", error);
      toast({
        title: "Error",
        description: "Failed to delete workspace",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconObj = WORKSPACE_ICONS.find((icon) => icon.name === iconName);
    if (iconObj) {
      const IconComponent = iconObj.icon;
      return <IconComponent size={18} />;
    }
    return <Folder size={18} />;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={`${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-[rgb(241,238,231)] text-gray-800 border-gray-300"} sm:max-w-md`}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Settings
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="workspaces"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList
              className={`grid w-full grid-cols-2 ${theme === "dark" ? "bg-gray-700" : "bg-[rgb(231,228,221)]"}`}
            >
              <TabsTrigger
                value="workspaces"
                className={`${theme === "dark" ? "data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-200" : "data-[state=active]:bg-[rgb(211,153,132)]/30 data-[state=active]:text-[rgb(180,120,100)]"}`}
              >
                Workspaces
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className={`${theme === "dark" ? "data-[state=active]:bg-blue-600/30 data-[state=active]:text-blue-200" : "data-[state=active]:bg-[rgb(211,153,132)]/30 data-[state=active]:text-[rgb(180,120,100)]"}`}
              >
                Appearance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspaces" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Manage Workspaces</h3>
                <div
                  className={`space-y-2 max-h-[300px] overflow-y-auto ${theme === "dark" ? "scrollbar-thin scrollbar-thumb-gray-600" : "scrollbar-thin scrollbar-thumb-gray-300"}`}
                >
                  {workspaces.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No workspaces found
                    </p>
                  ) : (
                    workspaces.map((workspace) => (
                      <div
                        key={workspace.id}
                        className={`flex items-center justify-between p-3 rounded-md ${theme === "dark" ? "bg-gray-700 hover:bg-gray-600" : "bg-[rgb(231,228,221)] hover:bg-[rgb(221,218,211)]"}`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`p-2 rounded-md ${theme === "dark" ? "bg-gray-600" : "bg-[rgb(211,153,132)]/20"}`}
                          >
                            {getIconComponent(workspace.icon)}
                          </div>
                          <span className="font-medium">{workspace.name}</span>
                          {currentWorkspace?.id === workspace.id && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${theme === "dark" ? "bg-blue-600/20 text-blue-300" : "bg-[rgb(211,153,132)]/20 text-[rgb(180,120,100)]"}`}
                            >
                              Current
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStartEdit(workspace.id)}
                            className={
                              theme === "dark"
                                ? "hover:bg-gray-600"
                                : "hover:bg-[rgb(221,218,211)]"
                            }
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setWorkspaceToDelete(workspace.id);
                              setIsDeleting(true);
                            }}
                            className={`${theme === "dark" ? "hover:bg-red-900/30 hover:text-red-300" : "hover:bg-red-200 hover:text-red-600"}`}
                            disabled={workspaces.length <= 1}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Theme Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Customize the appearance of your workspace
                </p>
                {/* Theme settings could go here in the future */}
                <div
                  className={`p-4 rounded-md ${theme === "dark" ? "bg-gray-700" : "bg-[rgb(231,228,221)]"}`}
                >
                  <p className="text-sm">
                    You can toggle between dark and light themes using the theme
                    toggle button in the sidebar.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={onClose}
              className={
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Workspace Dialog */}
      {editingWorkspace && (
        <Dialog
          open={!!editingWorkspace}
          onOpenChange={(open) => !open && handleCancelEdit()}
        >
          <DialogContent
            className={`${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-[rgb(241,238,231)] text-gray-800 border-gray-300"} sm:max-w-md`}
          >
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                Edit Workspace
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={editingWorkspace.name}
                  onChange={(e) =>
                    setEditingWorkspace({
                      ...editingWorkspace,
                      name: e.target.value,
                    })
                  }
                  className={`${theme === "dark" ? "bg-gray-700 border-gray-600" : "bg-[rgb(231,228,221)] border-gray-300"}`}
                />
              </div>

              <div className="space-y-2">
                <Label>Workspace Icon</Label>
                <div className="grid grid-cols-5 gap-2">
                  {WORKSPACE_ICONS.map((iconObj) => {
                    const IconComponent = iconObj.icon;
                    return (
                      <Button
                        key={iconObj.name}
                        type="button"
                        variant={
                          editingWorkspace.icon === iconObj.name
                            ? "default"
                            : "outline"
                        }
                        className={`p-2 h-auto aspect-square flex items-center justify-center ${
                          editingWorkspace.icon === iconObj.name
                            ? theme === "dark"
                              ? "bg-blue-600"
                              : "bg-[rgb(211,153,132)]"
                            : theme === "dark"
                              ? "bg-gray-700 border-gray-600"
                              : "bg-[rgb(231,228,221)] border-gray-300"
                        }`}
                        onClick={() =>
                          setEditingWorkspace({
                            ...editingWorkspace,
                            icon: iconObj.name,
                          })
                        }
                      >
                        <IconComponent className="h-5 w-5" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleCancelEdit}
                className={
                  theme === "dark" ? "border-gray-600" : "border-gray-300"
                }
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveWorkspace}
                disabled={isProcessing}
                className={`${theme === "dark" ? "bg-blue-600 hover:bg-blue-700" : "bg-[rgb(211,153,132)] hover:bg-[rgb(191,133,112)]"}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent
          className={`${theme === "dark" ? "bg-gray-800 text-white border-gray-700" : "bg-[rgb(241,238,231)] text-gray-800 border-gray-300"}`}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle
                className={`h-5 w-5 ${theme === "dark" ? "text-red-500" : "text-red-600"}`}
              />
              Delete Workspace
            </AlertDialogTitle>
            <AlertDialogDescription
              className={theme === "dark" ? "text-gray-300" : "text-gray-600"}
            >
              Are you sure you want to delete this workspace? This action cannot
              be undone and all tasks in this workspace will be permanently
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className={
                theme === "dark" ? "border-gray-600" : "border-gray-300"
              }
              disabled={isProcessing}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className={`${theme === "dark" ? "bg-red-600 hover:bg-red-700" : "bg-red-500 hover:bg-red-600"} text-white`}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Workspace"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SettingsDialog;
