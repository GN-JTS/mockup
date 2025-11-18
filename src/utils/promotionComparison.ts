import { PromotionRequirement } from "@/types";

export interface RequirementDifference {
  newTasks: string[]; // Task IDs that are new in target
  newSubtasks: {
    taskId: string;
    subtaskIds: string[];
  }[];
  completedSubtasks: {
    taskId: string;
    subtaskIds: string[];
  }[];
  removedTasks: string[]; // Task IDs that were in current but not in target
  removedSubtasks: {
    taskId: string;
    subtaskIds: string[];
  }[];
}

/**
 * Compare two promotion requirements and return differences
 */
export function compareRequirements(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): RequirementDifference {
  const result: RequirementDifference = {
    newTasks: [],
    newSubtasks: [],
    completedSubtasks: [],
    removedTasks: [],
    removedSubtasks: [],
  };

  if (!currentReq && !targetReq) {
    return result;
  }

  if (!currentReq && targetReq) {
    // All tasks/subtasks in target are new
    targetReq.required.forEach((reqTask) => {
      result.newTasks.push(reqTask.taskId);
      result.newSubtasks.push({
        taskId: reqTask.taskId,
        subtaskIds: [...reqTask.subtaskIds],
      });
    });
    return result;
  }

  if (currentReq && !targetReq) {
    // All tasks/subtasks in current are removed
    currentReq.required.forEach((reqTask) => {
      result.removedTasks.push(reqTask.taskId);
      result.removedSubtasks.push({
        taskId: reqTask.taskId,
        subtaskIds: [...reqTask.subtaskIds],
      });
    });
    return result;
  }

  if (!currentReq || !targetReq) {
    return result;
  }

  // Build maps for easier lookup
  const currentTaskMap = new Map<string, Set<string>>();
  currentReq.required.forEach((reqTask) => {
    currentTaskMap.set(reqTask.taskId, new Set(reqTask.subtaskIds));
  });

  const targetTaskMap = new Map<string, Set<string>>();
  targetReq.required.forEach((reqTask) => {
    targetTaskMap.set(reqTask.taskId, new Set(reqTask.subtaskIds));
  });

  // Find new tasks (in target but not in current)
  targetTaskMap.forEach((targetSubtasks, taskId) => {
    if (!currentTaskMap.has(taskId)) {
      result.newTasks.push(taskId);
      result.newSubtasks.push({
        taskId,
        subtaskIds: Array.from(targetSubtasks),
      });
    }
  });

  // Find removed tasks (in current but not in target)
  currentTaskMap.forEach((currentSubtasks, taskId) => {
    if (!targetTaskMap.has(taskId)) {
      result.removedTasks.push(taskId);
      result.removedSubtasks.push({
        taskId,
        subtaskIds: Array.from(currentSubtasks),
      });
    }
  });

  // Compare subtasks for common tasks
  targetTaskMap.forEach((targetSubtasks, taskId) => {
    if (currentTaskMap.has(taskId)) {
      const currentSubtasks = currentTaskMap.get(taskId)!;

      // Find new subtasks (in target but not in current)
      const newSubtaskIds: string[] = [];
      targetSubtasks.forEach((subtaskId) => {
        if (!currentSubtasks.has(subtaskId)) {
          newSubtaskIds.push(subtaskId);
        }
      });

      if (newSubtaskIds.length > 0) {
        result.newSubtasks.push({
          taskId,
          subtaskIds: newSubtaskIds,
        });
      }

      // Find completed subtasks (in both current and target - already mastered)
      const completedSubtaskIds: string[] = [];
      targetSubtasks.forEach((subtaskId) => {
        if (currentSubtasks.has(subtaskId)) {
          completedSubtaskIds.push(subtaskId);
        }
      });

      if (completedSubtaskIds.length > 0) {
        result.completedSubtasks.push({
          taskId,
          subtaskIds: completedSubtaskIds,
        });
      }

      // Find removed subtasks (in current but not in target)
      const removedSubtaskIds: string[] = [];
      currentSubtasks.forEach((subtaskId) => {
        if (!targetSubtasks.has(subtaskId)) {
          removedSubtaskIds.push(subtaskId);
        }
      });

      if (removedSubtaskIds.length > 0) {
        result.removedSubtasks.push({
          taskId,
          subtaskIds: removedSubtaskIds,
        });
      }
    }
  });

  return result;
}

/**
 * Check if there are any differences between two requirements
 */
export function hasDifferences(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): boolean {
  if (!currentReq && !targetReq) return false;
  if (!currentReq && targetReq) return true; // Target has requirements, current doesn't
  if (currentReq && !targetReq) return true; // Current has requirements, target doesn't

  if (!currentReq || !targetReq) return false;

  const diff = compareRequirements(currentReq, targetReq);
  return (
    diff.newTasks.length > 0 ||
    diff.newSubtasks.length > 0 ||
    diff.removedTasks.length > 0 ||
    diff.removedSubtasks.length > 0
  );
}

/**
 * Get list of new tasks in target requirement
 */
export function getNewTasks(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): string[] {
  const diff = compareRequirements(currentReq, targetReq);
  return diff.newTasks;
}

/**
 * Get list of new subtasks in target requirement
 */
export function getNewSubtasks(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): Array<{ taskId: string; subtaskIds: string[] }> {
  const diff = compareRequirements(currentReq, targetReq);
  return diff.newSubtasks;
}

/**
 * Get list of subtasks that are already completed (in both current and target)
 */
export function getCompletedSubtasks(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): Array<{ taskId: string; subtaskIds: string[] }> {
  const diff = compareRequirements(currentReq, targetReq);
  return diff.completedSubtasks;
}

/**
 * Get total count of new subtasks to complete
 */
export function getNewSubtasksCount(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): number {
  const newSubtasks = getNewSubtasks(currentReq, targetReq);
  return newSubtasks.reduce((total, item) => total + item.subtaskIds.length, 0);
}

/**
 * Get total count of completed subtasks (already mastered)
 */
export function getCompletedSubtasksCount(
  currentReq: PromotionRequirement | null,
  targetReq: PromotionRequirement | null
): number {
  const completed = getCompletedSubtasks(currentReq, targetReq);
  return completed.reduce((total, item) => total + item.subtaskIds.length, 0);
}
