import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";
import type { Workspace } from "@/lib/workspace";

export async function createWorkspace(
  name: string,
  icon: string,
  userId: string,
) {
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
}

export async function getWorkspaces(userId: string) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function getWorkspace(workspaceId: string) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  return { data, error };
}

export async function updateWorkspace(
  workspaceId: string,
  updates: Partial<Workspace>,
) {
  const { data, error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", workspaceId)
    .select()
    .single();

  return { data, error };
}

export async function deleteWorkspace(workspaceId: string) {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  return { error };
}
