import { supabase } from "./supabase";
import { v4 as uuidv4 } from "uuid";

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "in-progress" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  due_date?: string; // Database field name
  x?: number | null;
  y?: number | null;
  user_id: string;
  workspace_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface Connection {
  id: string;
  source: string;
  target: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

// Create a new workspace
export const createWorkspace = async (
  name: string,
  icon: string,
  userId: string,
) => {
  const workspaceId = uuidv4();
  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      id: workspaceId,
      name,
      icon,
      user_id: userId,
    })
    .select()
    .single();

  return { data, error };
};

// Get all workspaces for a user
export const getUserWorkspaces = async (userId: string) => {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
};

// Get a specific workspace
export const getWorkspace = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  return { data, error };
};

// Update a workspace
export const updateWorkspace = async (
  workspaceId: string,
  updates: Partial<Workspace>,
) => {
  const { data, error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", workspaceId)
    .select()
    .single();

  return { data, error };
};

// Delete a workspace
export const deleteWorkspace = async (workspaceId: string) => {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  return { error };
};

// Get all tasks for a workspace
export const getWorkspaceTasks = async (workspaceId: string) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId);

  return { data, error };
};

// Get all connections for tasks in a workspace
export const getWorkspaceConnections = async (workspaceId: string) => {
  // First get all task IDs in this workspace
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id")
    .eq("workspace_id", workspaceId);

  if (!tasks || tasks.length === 0) {
    return { data: [], error: null };
  }

  const taskIds = tasks.map((task) => task.id);

  // Then get all connections where both source and target are in these tasks
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .in("source", taskIds)
    .in("target", taskIds);

  return { data, error };
};

// Create a task in a workspace
export const createTask = async (
  task: Omit<Task, "id" | "created_at" | "updated_at">,
) => {
  const taskId = uuidv4();

  // Convert camelCase to snake_case for database fields
  const dbTask: any = {
    id: taskId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    user_id: task.user_id,
    workspace_id: task.workspace_id,
    x: task.x,
    y: task.y,
  };

  // Handle dueDate specifically
  if (task.dueDate) {
    dbTask.due_date = task.dueDate;
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert(dbTask)
    .select()
    .single();

  // Convert snake_case back to camelCase for frontend
  if (data && data.due_date) {
    data.dueDate = data.due_date;
    delete data.due_date;
  }

  return { data, error };
};

// Update a task
export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  // Convert camelCase to snake_case for database fields
  const dbUpdates: any = {};

  // Map all fields from updates to database format
  Object.entries(updates).forEach(([key, value]) => {
    if (key === "dueDate") {
      dbUpdates.due_date = value;
    } else if (key === "workspace_id") {
      dbUpdates.workspace_id = value;
    } else if (key === "user_id") {
      dbUpdates.user_id = value;
    } else {
      dbUpdates[key] = value;
    }
  });

  const { data, error } = await supabase
    .from("tasks")
    .update(dbUpdates)
    .eq("id", taskId)
    .select()
    .single();

  // Convert snake_case back to camelCase for frontend
  if (data && data.due_date) {
    data.dueDate = data.due_date;
    delete data.due_date;
  }

  return { data, error };
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  return { error };
};

// Create a connection between tasks
export const createConnection = async (
  connection: Omit<Connection, "id" | "created_at" | "updated_at">,
) => {
  const connectionId = uuidv4();
  const { data, error } = await supabase
    .from("connections")
    .insert({
      ...connection,
      id: connectionId,
    })
    .select()
    .single();

  return { data, error };
};

// Delete a connection
export const deleteConnection = async (connectionId: string) => {
  const { error } = await supabase
    .from("connections")
    .delete()
    .eq("id", connectionId);

  return { error };
};
