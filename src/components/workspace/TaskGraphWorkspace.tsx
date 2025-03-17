import React, { useState, useCallback, useEffect } from "react";
import GraphCanvas from "./GraphCanvas";
import TaskDetailModal from "./TaskDetailModal";
import TaskListView from "./TaskListView";
import Sidebar from "./Sidebar";
import { useAuth } from "@/lib/auth";
import { useToast } from "../ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { Button } from "../ui/button";
import { BarChart2, List } from "lucide-react";
import {
  getWorkspaceTasks,
  getWorkspaceConnections,
  createTask,
  updateTask,
  deleteTask,
  createConnection,
  deleteConnection,
  Task as WorkspaceTask,
  Connection as WorkspaceConnection,
} from "@/lib/workspace";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  x?: number | null;
  y?: number | null;
  user_id?: string;
  workspace_id?: string;
}

interface Connection {
  id: string;
  source: string;
  target: string;
  user_id?: string;
}

interface TaskGraphWorkspaceProps {
  initialTasks?: Task[];
  initialConnections?: Connection[];
  username?: string;
  onLogout?: () => void;
  currentWorkspaceId?: string | null;
}

const TaskGraphWorkspace = ({
  initialTasks = [],
  initialConnections = [],
  username = "Demo User",
  onLogout = () => console.log("Logout clicked"),
  currentWorkspaceId: initialWorkspaceId = null,
}: TaskGraphWorkspaceProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [connections, setConnections] =
    useState<Connection[]>(initialConnections);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentWorkspaceId, setCurrentWorkspaceId] = useState<string | null>(
    initialWorkspaceId,
  );
  const [viewMode, setViewMode] = useState<"graph" | "list">("graph");

  // Load tasks and connections when workspace changes
  useEffect(() => {
    if (!user || !currentWorkspaceId) return;

    const loadWorkspaceData = async () => {
      setIsLoading(true);
      try {
        // Load tasks for this workspace
        const { data: tasksData, error: tasksError } =
          await getWorkspaceTasks(currentWorkspaceId);
        if (tasksError) throw tasksError;

        // Load connections for this workspace
        const { data: connectionsData, error: connectionsError } =
          await getWorkspaceConnections(currentWorkspaceId);
        if (connectionsError) throw connectionsError;

        setTasks(tasksData || []);
        setConnections(connectionsData || []);
      } catch (error) {
        console.error("Error loading workspace data:", error);
        toast({
          title: "Error",
          description: "Failed to load workspace data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspaceData();
  }, [user, currentWorkspaceId, toast]);

  // Auto-save workspace every 30 seconds
  useEffect(() => {
    if (!user || !currentWorkspaceId) return;

    const autoSaveInterval = setInterval(() => {
      saveWorkspace();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [user, tasks, connections, currentWorkspaceId]);

  // Handle creating a new task
  const handleCreateTask = useCallback(
    (position?: { x: number; y: number }) => {
      if (!currentWorkspaceId) {
        toast({
          title: "No workspace selected",
          description: "Please select a workspace first",
          variant: "destructive",
        });
        return;
      }

      const newTask: Task = {
        id: `task-${uuidv4()}`,
        title: "New Task",
        description: "Add description here",
        status: "todo",
        x: position?.x || 100,
        y: position?.y || 100,
        user_id: user?.id,
        workspace_id: currentWorkspaceId,
      };

      // Store the task temporarily but don't add it to the tasks array yet
      setSelectedTask(newTask);
      setIsTaskModalOpen(true);
    },
    [user, currentWorkspaceId, toast],
  );

  // Handle clicking on a task node
  const handleTaskClick = useCallback(
    (node: any) => {
      const task = tasks.find((t) => t.id === node.id);
      if (task) {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
      }
    },
    [tasks],
  );

  // Handle saving task changes
  const handleSaveTask = useCallback(
    async (updatedTask: Task) => {
      if (!user || !currentWorkspaceId) return;

      // Check if this is a new task (not yet in the tasks array)
      const isNewTask = !tasks.some((task) => task.id === updatedTask.id);

      try {
        if (isNewTask) {
          // Only add the task if the title is not empty
          if (updatedTask.title.trim() !== "") {
            const taskWithWorkspace = {
              ...updatedTask,
              user_id: user.id,
              workspace_id: currentWorkspaceId,
            };

            console.log("Creating new task:", taskWithWorkspace);
            const { data, error } = await createTask(taskWithWorkspace);
            if (error) {
              console.error("Supabase error creating task:", error);
              throw error;
            }

            setTasks((prevTasks) => [...prevTasks, data]);
          }
        } else {
          // Update existing task
          console.log("Updating task:", updatedTask);
          const { data, error } = await updateTask(updatedTask.id, {
            ...updatedTask,
            user_id: user.id,
            workspace_id: currentWorkspaceId,
          });

          if (error) {
            console.error("Supabase error updating task:", error);
            throw error;
          }

          setTasks((prevTasks) =>
            prevTasks.map((task) => (task.id === updatedTask.id ? data : task)),
          );
        }

        toast({
          title: "Task saved",
          description: "Your task has been saved successfully",
        });

        setSelectedTask(null);
        setIsTaskModalOpen(false);
      } catch (error) {
        console.error("Error saving task:", error);
        toast({
          title: "Error saving task",
          description:
            "There was an error saving your task. Please check the console for details.",
          variant: "destructive",
        });
      }
    },
    [tasks, user, currentWorkspaceId, toast],
  );

  // Handle deleting a task
  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      if (!user) return;

      try {
        const { error } = await deleteTask(taskId);
        if (error) throw error;

        setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
        // Also remove any connections involving this task
        setConnections((prevConnections) =>
          prevConnections.filter(
            (conn) => conn.source !== taskId && conn.target !== taskId,
          ),
        );
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error deleting task",
          description: "There was an error deleting your task",
          variant: "destructive",
        });
      }
    },
    [user, toast],
  );

  // Handle disconnecting tasks
  const handleDisconnectTasks = useCallback(
    async (connectionId: string) => {
      if (!user) return;

      try {
        const { error } = await deleteConnection(connectionId);
        if (error) throw error;

        setConnections((prevConnections) =>
          prevConnections.filter((conn) => conn.id !== connectionId),
        );
      } catch (error) {
        console.error("Error disconnecting tasks:", error);
        toast({
          title: "Error disconnecting tasks",
          description: "There was an error disconnecting your tasks",
          variant: "destructive",
        });
      }
    },
    [user, toast],
  );

  // Handle connecting two tasks
  const handleConnectTasks = useCallback(
    async (sourceId: string, targetId: string) => {
      if (!user || !currentWorkspaceId) return;

      // Prevent self-connections
      if (sourceId === targetId) return;

      // Prevent duplicate connections
      const connectionExists = connections.some(
        (conn) =>
          (conn.source === sourceId && conn.target === targetId) ||
          (conn.source === targetId && conn.target === sourceId),
      );

      if (!connectionExists) {
        try {
          const newConnection = {
            source: sourceId,
            target: targetId,
            user_id: user.id,
          };

          const { data, error } = await createConnection(newConnection);
          if (error) throw error;

          setConnections((prevConnections) => [...prevConnections, data]);
        } catch (error) {
          console.error("Error connecting tasks:", error);
          toast({
            title: "Error connecting tasks",
            description: "There was an error connecting your tasks",
            variant: "destructive",
          });
        }
      }
    },
    [connections, user, currentWorkspaceId, toast],
  );

  // Close the task modal
  const handleCloseTaskModal = useCallback(() => {
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  }, []);

  // Save workspace to Supabase
  const saveWorkspace = async () => {
    if (!user || !currentWorkspaceId) {
      toast({
        title: "Not logged in or no workspace selected",
        description:
          "You need to be logged in and have a workspace selected to save",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      // Tasks and connections are already saved to Supabase when they are created/updated/deleted
      // This function is now just for UI feedback
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLastSaved(new Date());

      toast({
        title: "Workspace saved",
        description: "Your workspace has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving workspace:", error);
      toast({
        title: "Error saving workspace",
        description: "There was an error saving your workspace",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle workspace change
  const handleWorkspaceChange = (workspaceId: string) => {
    setCurrentWorkspaceId(workspaceId);
  };

  return (
    <div className="flex w-full h-screen bg-gray-900 text-white">
      <Sidebar
        username={username}
        onLogout={onLogout}
        onSaveWorkspace={saveWorkspace}
        onWorkspaceChange={handleWorkspaceChange}
        currentWorkspaceId={currentWorkspaceId || undefined}
      />

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h1 className="text-xl font-semibold">Task Graph Manager</h1>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "graph" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("graph")}
              className="gap-2"
            >
              <BarChart2 className="h-4 w-4" />
              <span>Graph View</span>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              <span>List View</span>
            </Button>
          </div>
        </div>
        <div className="flex-1 relative overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-xl text-blue-400">Loading workspace...</div>
            </div>
          ) : viewMode === "graph" ? (
            <GraphCanvas
              nodes={tasks.map((task) => ({
                id: task.id,
                title: task.title,
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate,
                x: task.x,
                y: task.y,
              }))}
              links={connections.map((conn) => ({
                id: conn.id,
                source: conn.source,
                target: conn.target,
              }))}
              onNodeClick={handleTaskClick}
              onCreateNode={handleCreateTask}
              onConnectNodes={handleConnectTasks}
              onDisconnectNodes={handleDisconnectTasks}
            />
          ) : (
            <TaskListView
              tasks={tasks}
              onTaskClick={handleTaskClick}
              onTaskDelete={handleDeleteTask}
              onCreateTask={() => handleCreateTask()}
            />
          )}
        </div>

        {selectedTask && (
          <TaskDetailModal
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description || "",
              status: selectedTask.status,
              priority: selectedTask.priority,
            }}
            isOpen={isTaskModalOpen}
            onClose={handleCloseTaskModal}
            onSave={handleSaveTask}
            onDelete={handleDeleteTask}
          />
        )}

        {viewMode === "graph" && (
          <div className="absolute bottom-4 left-72 bg-gray-800 p-3 rounded-md text-sm text-white shadow-lg border border-gray-700">
            <p className="mb-1 flex items-center">
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500 text-white text-xs mr-2">
                •
              </span>{" "}
              Click anywhere to create a new task
            </p>
            <p className="mb-1 flex items-center">
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500 text-white text-xs mr-2">
                •
              </span>{" "}
              Drag tasks to reposition them
            </p>
            <p className="mb-1 flex items-center">
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500 text-white text-xs mr-2">
                •
              </span>{" "}
              Right-click a task and then click another to connect them
            </p>
            <p className="mb-1 flex items-center">
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500 text-white text-xs mr-2">
                •
              </span>{" "}
              Click on a task to view or edit details
            </p>
            <p className="mb-1 flex items-center">
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-blue-500 text-white text-xs mr-2">
                •
              </span>{" "}
              Click on a connection line to delete it
            </p>
            <p className="mb-1 flex items-center">
              <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-green-500 text-white text-xs mr-2">
                ✓
              </span>{" "}
              Green checkmark indicates completed tasks
            </p>
            {lastSaved && (
              <p className="mt-2 text-blue-300 font-medium">
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskGraphWorkspace;
