import React from "react";
import { useTheme } from "@/lib/theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { CheckCircle2, Circle, Edit, Trash2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  x?: number | null;
  y?: number | null;
}

interface TaskListViewProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onCreateTask: () => void;
}

// Helper functions for priority display
const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
    default:
      return "";
  }
};

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
    case "medium":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    case "high":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
    case "urgent":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "";
  }
};

const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  onTaskClick,
  onTaskDelete,
  onCreateTask,
}) => {
  const { theme } = useTheme();

  // Sort tasks: completed tasks at the bottom
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.status === "completed" && b.status !== "completed") return 1;
    if (a.status !== "completed" && b.status === "completed") return -1;
    return a.title.localeCompare(b.title);
  });

  return (
    <div
      className="p-6 h-full flex flex-col"
      style={{
        backgroundColor: theme === "dark" ? "#0f172a" : "rgb(241, 238, 231)",
        color: theme === "dark" ? "white" : "#1e293b",
      }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Tasks</h2>
        <Button onClick={onCreateTask} className="gap-2">
          <span>Add Task</span>
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 text-center">
          <p className="text-muted-foreground mb-4">No tasks yet</p>
          <Button onClick={onCreateTask}>Create your first task</Button>
        </div>
      ) : (
        <div
          className="overflow-auto flex-1 rounded-md border"
          style={{ borderColor: theme === "dark" ? "#374151" : "#e5e7eb" }}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">Status</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="w-[200px]">Description</TableHead>
                <TableHead className="w-[100px]">Priority</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTasks.map((task) => (
                <TableRow
                  key={task.id}
                  className={task.status === "completed" ? "opacity-60" : ""}
                >
                  <TableCell>
                    {task.status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-blue-500" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {task.description}
                  </TableCell>
                  <TableCell>
                    {task.priority && (
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(task.priority)}`}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTaskClick(task)}
                        title="Edit task"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onTaskDelete(task.id)}
                        title="Delete task"
                        className="text-red-500 hover:text-red-600 hover:bg-red-100/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TaskListView;
