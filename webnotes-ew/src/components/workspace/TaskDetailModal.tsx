import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { AlertTriangle, Flag, Calendar } from "lucide-react";
import TaskPriorityModal, { TaskPriority } from "./TaskPriorityModal";

interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "completed";
  priority?: "low" | "medium" | "high" | "urgent";
}

interface TaskDetailModalProps {
  task?: Task;
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskDetailModal = ({
  task = {
    id: "task-" + Math.random().toString(36).substr(2, 9),
    title: "New Task",
    description: "Task description goes here",
    status: "todo",
  },
  isOpen = true,
  onClose = () => {},
  onSave = () => {},
  onDelete = () => {},
}: TaskDetailModalProps) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task>(task);
  const [isPriorityModalOpen, setIsPriorityModalOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setEditedTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusChange = (value: string) => {
    setEditedTask((prev) => ({
      ...prev,
      status: value as "todo" | "completed",
    }));
  };

  const handleSave = () => {
    try {
      // Make sure we have valid data before saving
      const validatedTask = {
        ...editedTask,
        title: editedTask.title.trim() || "Untitled Task",
        description: editedTask.description || "",
      };
      onSave(validatedTask);
    } catch (error) {
      console.error("Error in handleSave:", error);
    }
  };

  const handlePrioritySave = (priority: TaskPriority) => {
    setEditedTask((prev) => ({
      ...prev,
      priority,
    }));
  };

  const getPriorityColor = () => {
    switch (editedTask.priority) {
      case "low":
        return "text-blue-400";
      case "medium":
        return "text-green-400";
      case "high":
        return "text-orange-400";
      case "urgent":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getPriorityLabel = () => {
    switch (editedTask.priority) {
      case "low":
        return "Low";
      case "medium":
        return "Medium";
      case "high":
        return "High";
      case "urgent":
        return "Urgent";
      default:
        return "Set Priority";
    }
  };

  const handleDelete = () => {
    if (isDeleteConfirmOpen) {
      onDelete(editedTask.id);
      onClose();
      setIsDeleteConfirmOpen(false);
    } else {
      setIsDeleteConfirmOpen(true);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteConfirmOpen(false);
  };

  return (
    <React.Fragment>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
          {!isDeleteConfirmOpen ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  Task Details
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  View or edit task information
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label
                    htmlFor="title"
                    className="text-sm font-medium text-gray-300"
                  >
                    Title
                  </label>
                  <Input
                    id="title"
                    name="title"
                    value={editedTask.title}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-300"
                  >
                    Description
                  </label>
                  <Textarea
                    id="description"
                    name="description"
                    value={editedTask.description}
                    onChange={handleInputChange}
                    className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="status"
                      className="text-sm font-medium text-gray-300"
                    >
                      Status
                    </label>
                    <Select
                      value={editedTask.status}
                      onValueChange={handleStatusChange}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                      Priority
                    </label>
                    <Button
                      variant="outline"
                      className="w-full bg-gray-800 border-gray-700 text-white justify-between"
                      onClick={() => setIsPriorityModalOpen(true)}
                    >
                      <span className="flex items-center gap-2">
                        <Flag className={getPriorityColor()} size={16} />
                        {getPriorityLabel()}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>Save Changes</Button>
                </div>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to delete this task? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>

              <DialogFooter className="sm:justify-end">
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleCancelDelete}
                    className="border-gray-600 text-gray-300"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete Task
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TaskPriorityModal
        isOpen={isPriorityModalOpen}
        onClose={() => setIsPriorityModalOpen(false)}
        onSave={handlePrioritySave}
        currentPriority={editedTask.priority as TaskPriority}
      />
    </React.Fragment>
  );
};

export default TaskDetailModal;
