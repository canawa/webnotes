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
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Flag, AlertTriangle, Clock, Zap } from "lucide-react";
import { useTheme } from "@/lib/theme";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

interface TaskPriorityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (priority: TaskPriority) => void;
  currentPriority?: TaskPriority;
}

const TaskPriorityModal: React.FC<TaskPriorityModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentPriority = "medium",
}) => {
  const { theme } = useTheme();
  const [priority, setPriority] = useState<TaskPriority>(currentPriority);

  const handleSave = () => {
    onSave(priority);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Flag className="h-5 w-5 text-blue-400" />
            Set Task Priority
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Prioritize your tasks to focus on what matters most
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={priority}
            onValueChange={(value) => setPriority(value as TaskPriority)}
            className="space-y-3"
          >
            <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
              <RadioGroupItem
                value="low"
                id="low"
                className="border-blue-400"
              />
              <Label
                htmlFor="low"
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-300" />
                  <span>Low Priority</span>
                </div>
                <div className="bg-blue-900/30 text-blue-300 px-2 py-1 rounded text-xs font-medium">
                  Can Wait
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
              <RadioGroupItem
                value="medium"
                id="medium"
                className="border-green-400"
              />
              <Label
                htmlFor="medium"
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Flag className="h-4 w-4 text-green-300" />
                  <span>Medium Priority</span>
                </div>
                <div className="bg-green-900/30 text-green-300 px-2 py-1 rounded text-xs font-medium">
                  Normal
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
              <RadioGroupItem
                value="high"
                id="high"
                className="border-orange-400"
              />
              <Label
                htmlFor="high"
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-orange-300" />
                  <span>High Priority</span>
                </div>
                <div className="bg-orange-900/30 text-orange-300 px-2 py-1 rounded text-xs font-medium">
                  Important
                </div>
              </Label>
            </div>

            <div className="flex items-center space-x-2 rounded-md border border-gray-700 p-3 hover:bg-gray-800">
              <RadioGroupItem
                value="urgent"
                id="urgent"
                className="border-red-400"
              />
              <Label
                htmlFor="urgent"
                className="flex flex-1 items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-300" />
                  <span>Urgent Priority</span>
                </div>
                <div className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs font-medium">
                  Critical
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-600 text-gray-300"
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Priority</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskPriorityModal;
