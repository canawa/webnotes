import React, { useState, useEffect } from "react";
import AuthScreen from "./auth/AuthScreen";
import TaskGraphWorkspace from "./workspace/TaskGraphWorkspace";
import WorkspaceSetupModal from "./workspace/WorkspaceSetupModal";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getUserWorkspaces } from "@/lib/workspace";

interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
}

const Home = () => {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [tasks, setTasks] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [showWorkspaceSetup, setShowWorkspaceSetup] = useState(false);
  const [hasWorkspaces, setHasWorkspaces] = useState(false);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(
    null,
  );

  // Check if user has workspaces
  useEffect(() => {
    const checkWorkspaces = async () => {
      if (!user) return;

      try {
        const { data, error } = await getUserWorkspaces(user.id);
        if (error) throw error;

        if (data && data.length > 0) {
          setHasWorkspaces(true);
          setCurrentWorkspaceId(data[0].id);
        } else {
          setShowWorkspaceSetup(true);
          setHasWorkspaces(false);
        }
      } catch (error) {
        console.error("Error checking workspaces:", error);
      }
    };

    if (user) {
      checkWorkspaces();
    }
  }, [user]);

  // Fetch user profile when authenticated
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;

      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setUserProfile(data);

        // For now, use demo data
        // In a real app, you would fetch tasks from Supabase here
        setTasks([
          {
            id: "1",
            title: "Research project requirements",
            description:
              "Gather all necessary information about the project scope",
            status: "completed",
            x: 200,
            y: 150,
          },
          {
            id: "2",
            title: "Create wireframes",
            description: "Design initial wireframes for the application",
            status: "in-progress",
            x: 500,
            y: 300,
          },
          {
            id: "3",
            title: "Implement core functionality",
            description: "Develop the main features of the application",
            status: "todo",
            x: 800,
            y: 150,
          },
        ]);

        setConnections([
          { id: "conn-1-2", source: "1", target: "2" },
          { id: "conn-2-3", source: "2", target: "3" },
        ]);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleWorkspaceCreated = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
    setHasWorkspaces(true);
    setShowWorkspaceSetup(false);
  };

  // Show loading state while checking authentication
  if (authLoading || (user && isLoadingProfile)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-lg">Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {user ? (
        <>
          {hasWorkspaces ? (
            <TaskGraphWorkspace
              onLogout={handleLogout}
              username={
                userProfile?.display_name || userProfile?.email || "User"
              }
              initialTasks={tasks}
              initialConnections={connections}
              currentWorkspaceId={currentWorkspaceId}
            />
          ) : (
            <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-lg">Please create a workspace to continue</p>
              </div>
            </div>
          )}

          <WorkspaceSetupModal
            isOpen={showWorkspaceSetup}
            onWorkspaceCreated={handleWorkspaceCreated}
          />
        </>
      ) : (
        <AuthScreen />
      )}
    </div>
  );
};

export default Home;
