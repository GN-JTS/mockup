import { useState, useEffect } from "react";
import { mockApi } from "@/mock/services/mockApi";
import { Task, Subtask, Section } from "@/types";
import { useNotifications } from "@/context/NotificationContext";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const TasksManagement = () => {
  const { showToast } = useNotifications();
  const [sections, setSections] = useState<Section[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showSubtaskModal, setShowSubtaskModal] = useState(false);
  const [showSectionAssignment, setShowSectionAssignment] = useState(false);
  const [selectedTaskForSection, setSelectedTaskForSection] =
    useState<Task | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingSubtask, setEditingSubtask] = useState<Subtask | null>(null);
  const [selectedTaskForSubtask, setSelectedTaskForSubtask] =
    useState<string>("");

  // Task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskSectionId, setTaskSectionId] = useState<string>("");

  // Subtask form state
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [subtaskDescription, setSubtaskDescription] = useState("");
  const [subtaskRequirements, setSubtaskRequirements] = useState("");
  const [subtaskResources, setSubtaskResources] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectionsData, tasksData, subtasksData] = await Promise.all([
        mockApi.getSections(),
        mockApi.getTasks(),
        mockApi.getSubtasks(),
      ]);
      setSections(sectionsData);
      setTasks(tasksData);
      setSubtasks(subtasksData);
    } catch (error) {
      console.error("Failed to load data:", error);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setShowTaskModal(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskSectionId(task.sectionId || "");
    setShowTaskModal(true);
  };

  const handleAssignTaskToSection = (task: Task) => {
    setSelectedTaskForSection(task);
    setShowSectionAssignment(true);
  };

  const handleSaveSectionAssignment = async (sectionId: string) => {
    if (!selectedTaskForSection) return;
    try {
      if (sectionId) {
        await mockApi.assignTaskToSection(selectedTaskForSection.id, sectionId);
        showToast("Task assigned to section successfully", "success");
      } else {
        // Remove section assignment
        const updatedTasks = tasks.map((t) =>
          t.id === selectedTaskForSection.id
            ? {
                ...t,
                sectionId: undefined,
                updatedAt: new Date().toISOString(),
              }
            : t
        );
        setTasks(updatedTasks);
        showToast("Task set to global (no section)", "success");
      }
      loadData();
      setShowSectionAssignment(false);
      setSelectedTaskForSection(null);
    } catch (error) {
      console.error("Failed to assign task:", error);
      showToast("Failed to assign task to section", "error");
    }
  };

  const handleSaveTask = () => {
    if (!taskTitle.trim() || !taskDescription.trim()) {
      showToast("Please fill in all fields", "warning");
      return;
    }

    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map((t) =>
        t.id === editingTask.id
          ? {
              ...t,
              title: taskTitle,
              description: taskDescription,
              sectionId: taskSectionId || undefined,
              updatedAt: new Date().toISOString(),
            }
          : t
      );
      setTasks(updatedTasks);
      showToast("Task updated successfully", "success");
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskTitle,
        description: taskDescription,
        sectionId: taskSectionId || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setTasks([...tasks, newTask]);
      showToast("Task created successfully", "success");
    }

    setShowTaskModal(false);
    setEditingTask(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskSectionId("");
  };

  const handleDeleteTask = (taskId: string) => {
    const taskSubtasks = subtasks.filter((st) => st.taskId === taskId);
    if (taskSubtasks.length > 0) {
      if (
        !confirm(
          `This task has ${taskSubtasks.length} subtasks. Deleting it will also delete all its subtasks. Continue?`
        )
      ) {
        return;
      }
    } else {
      if (!confirm("Are you sure you want to delete this task?")) {
        return;
      }
    }

    setTasks(tasks.filter((t) => t.id !== taskId));
    setSubtasks(subtasks.filter((st) => st.taskId !== taskId));
    showToast("Task deleted successfully", "success");
  };

  const handleAddSubtask = (taskId: string) => {
    setEditingSubtask(null);
    setSelectedTaskForSubtask(taskId);
    setSubtaskTitle("");
    setSubtaskDescription("");
    setSubtaskRequirements("");
    setSubtaskResources("");
    setShowSubtaskModal(true);
  };

  const handleEditSubtask = (subtask: Subtask) => {
    setEditingSubtask(subtask);
    setSelectedTaskForSubtask(subtask.taskId);
    setSubtaskTitle(subtask.title);
    setSubtaskDescription(subtask.description);
    setSubtaskRequirements(subtask.requirements);
    setSubtaskResources(subtask.resources?.join("\n") || "");
    setShowSubtaskModal(true);
  };

  const handleSaveSubtask = () => {
    if (
      !subtaskTitle.trim() ||
      !subtaskDescription.trim() ||
      !subtaskRequirements.trim()
    ) {
      showToast("Please fill in all required fields", "warning");
      return;
    }

    const resourcesArray = subtaskResources
      .split("\n")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (editingSubtask) {
      // Update existing subtask
      const updatedSubtasks = subtasks.map((st) =>
        st.id === editingSubtask.id
          ? {
              ...st,
              title: subtaskTitle,
              description: subtaskDescription,
              requirements: subtaskRequirements,
              resources: resourcesArray,
            }
          : st
      );
      setSubtasks(updatedSubtasks);
      showToast("Subtask updated successfully", "success");
    } else {
      // Create new subtask
      const newSubtask: Subtask = {
        id: `subtask-${Date.now()}`,
        taskId: selectedTaskForSubtask,
        title: subtaskTitle,
        description: subtaskDescription,
        requirements: subtaskRequirements,
        resources: resourcesArray,
      };
      setSubtasks([...subtasks, newSubtask]);
      showToast("Subtask created successfully", "success");
    }

    setShowSubtaskModal(false);
    setEditingSubtask(null);
    setSelectedTaskForSubtask("");
    setSubtaskTitle("");
    setSubtaskDescription("");
    setSubtaskRequirements("");
    setSubtaskResources("");
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!confirm("Are you sure you want to delete this subtask?")) {
      return;
    }

    setSubtasks(subtasks.filter((st) => st.id !== subtaskId));
    showToast("Subtask deleted successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
          <p className="text-gray-600 mt-1">
            Manage tasks and subtasks that form the basis of training standards
          </p>
        </div>
        <button onClick={handleAddTask} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2 inline" />
          Add Task
        </button>
      </div>

      {/* Tasks List */}
      <div className="space-y-4">
        {tasks.map((task) => {
          const taskSubtasks = subtasks.filter((st) => st.taskId === task.id);
          const isExpanded = expandedTasks.has(task.id);

          return (
            <div key={task.id} className="card">
              {/* Task Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center text-left w-full"
                  >
                    {isExpanded ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500 mr-2" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-500 mr-2" />
                    )}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {taskSubtasks.length} subtask
                        {taskSubtasks.length !== 1 ? "s" : ""}
                      </p>
                      {task.sectionId && (
                        <div className="mt-2 flex items-center gap-1">
                          <Squares2X2Icon className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Section:{" "}
                            {sections.find((s) => s.id === task.sectionId)
                              ?.name || task.sectionId}
                          </span>
                        </div>
                      )}
                      {!task.sectionId && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-400">
                            Global task (no section)
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleAssignTaskToSection(task)}
                    className="btn btn-secondary text-sm"
                    title="Assign to Section"
                  >
                    <Squares2X2Icon className="h-4 w-4 inline mr-1" />
                    Section
                  </button>
                  <button
                    onClick={() => handleAddSubtask(task.id)}
                    className="btn btn-secondary text-sm"
                  >
                    <PlusIcon className="h-4 w-4 inline mr-1" />
                    Add Subtask
                  </button>
                  <button
                    onClick={() => handleEditTask(task)}
                    className="btn btn-secondary text-sm"
                  >
                    <PencilIcon className="h-4 w-4 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="btn btn-danger text-sm"
                  >
                    <TrashIcon className="h-4 w-4 inline mr-1" />
                    Delete
                  </button>
                </div>
              </div>

              {/* Subtasks List */}
              {isExpanded && taskSubtasks.length > 0 && (
                <div className="mt-4 pl-7 space-y-2">
                  {taskSubtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {subtask.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {subtask.description}
                          </p>
                          <p className="text-sm text-gray-700 mt-2">
                            <span className="font-medium">Requirements:</span>{" "}
                            {subtask.requirements}
                          </p>
                          {subtask.resources &&
                            subtask.resources.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium text-gray-700">
                                  Resources:
                                </p>
                                <ul className="text-sm text-gray-600 list-disc list-inside">
                                  {subtask.resources.map((resource, idx) => (
                                    <li key={idx}>{resource}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                        </div>

                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => handleEditSubtask(subtask)}
                            className="btn btn-secondary text-sm"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubtask(subtask.id)}
                            className="btn btn-danger text-sm"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isExpanded && taskSubtasks.length === 0 && (
                <div className="mt-4 pl-7 text-center py-8 text-gray-500">
                  No subtasks yet. Add one to get started.
                </div>
              )}
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-gray-600">
              No tasks yet. Create one to get started.
            </p>
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingTask ? "Edit Task" : "Add New Task"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveTask();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Safety Procedures"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Describe what this task covers..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Section (Optional)
                </label>
                <select
                  value={taskSectionId}
                  onChange={(e) => setTaskSectionId(e.target.value)}
                  className="input"
                >
                  <option value="">-- Global Task (No Section) --</option>
                  {sections.map((section) => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty for global tasks, or assign to a specific section
                </p>
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingTask ? "Update Task" : "Create Task"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setTaskTitle("");
                    setTaskDescription("");
                    setTaskSectionId("");
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subtask Modal */}
      {showSubtaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingSubtask ? "Edit Subtask" : "Add New Subtask"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveSubtask();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtask Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={subtaskTitle}
                  onChange={(e) => setSubtaskTitle(e.target.value)}
                  className="input"
                  placeholder="e.g., Emergency Procedures"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={subtaskDescription}
                  onChange={(e) => setSubtaskDescription(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="Describe what this subtask involves..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Requirements <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={subtaskRequirements}
                  onChange={(e) => setSubtaskRequirements(e.target.value)}
                  className="input"
                  rows={3}
                  placeholder="What must the employee demonstrate to pass?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resources (one per line)
                </label>
                <textarea
                  value={subtaskResources}
                  onChange={(e) => setSubtaskResources(e.target.value)}
                  className="input"
                  rows={4}
                  placeholder="Safety Manual Chapter 1&#10;Emergency Response Video&#10;PPE Guidelines"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingSubtask ? "Update Subtask" : "Create Subtask"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSubtaskModal(false);
                    setEditingSubtask(null);
                    setSelectedTaskForSubtask("");
                    setSubtaskTitle("");
                    setSubtaskDescription("");
                    setSubtaskRequirements("");
                    setSubtaskResources("");
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Section Assignment Modal */}
      {showSectionAssignment && selectedTaskForSection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Assign Task to Section
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select a section for "{selectedTaskForSection.title}". This will
              make the task available for that section's requirement matrices.
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="section"
                  value=""
                  checked={!selectedTaskForSection.sectionId}
                  onChange={() => handleSaveSectionAssignment("")}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-3 text-sm text-gray-900">
                  Global (No Section)
                </span>
              </label>
              {sections.map((section) => (
                <label
                  key={section.id}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="section"
                    value={section.id}
                    checked={selectedTaskForSection.sectionId === section.id}
                    onChange={() => handleSaveSectionAssignment(section.id)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-sm text-gray-900">
                    {section.name}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                onClick={() => {
                  setShowSectionAssignment(false);
                  setSelectedTaskForSection(null);
                }}
                className="btn btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksManagement;
