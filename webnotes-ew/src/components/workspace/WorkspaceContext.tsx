import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { getUserWorkspaces, Workspace } from "@/lib/workspace";
import { useToast } from "@/components/ui/use-toast";

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  setCurrentWorkspace: (workspace: Workspace) => void;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined,
);

export const WorkspaceProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshWorkspaces = async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await getUserWorkspaces(user.id);

      if (error) throw error;

      if (data) {
        setWorkspaces(data);

        // If there's no current workspace but we have workspaces, set the first one
        if (!currentWorkspace && data.length > 0) {
          setCurrentWorkspace(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
      setError(err as Error);
      toast({
        title: "Error",
        description: "Failed to load workspaces",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load workspaces when user changes
  useEffect(() => {
    refreshWorkspaces();
  }, [user]);

  const value = {
    workspaces,
    currentWorkspace,
    isLoading,
    error,
    setCurrentWorkspace,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
};
