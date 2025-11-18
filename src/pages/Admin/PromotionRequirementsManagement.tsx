import { useState, useEffect } from "react";
import { mockApi } from "@/mock/services/mockApi";
import {
  JobTitle,
  Grade,
  Task,
  Subtask,
  PromotionRequirement,
  Section,
} from "@/types";
import { PlusIcon, XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";

const PromotionRequirementsManagement = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSectionId, setSelectedSectionId] = useState<string>("");
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [requirements, setRequirements] = useState<PromotionRequirement[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitle | null>(
    null
  );
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [editingRequirement, setEditingRequirement] =
    useState<PromotionRequirement | null>(null);

  // Form state for task/subtask selection
  const [selectedTasks, setSelectedTasks] = useState<Map<string, Set<string>>>(
    new Map()
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [
        sectionsData,
        jobTitlesData,
        gradesData,
        tasksData,
        subtasksData,
        requirementsData,
      ] = await Promise.all([
        mockApi.getSections(),
        mockApi.getJobTitles(),
        mockApi.getGrades(),
        mockApi.getTasks(),
        mockApi.getSubtasks(),
        mockApi.getPromotionRequirements(),
      ]);

      setSections(sectionsData);
      // Default to first section if available
      if (sectionsData.length > 0 && !selectedSectionId) {
        setSelectedSectionId(sectionsData[0].id);
      }

      console.log("=== PROMOTION MATRIX DEBUG ===");
      console.log("Job Titles:", jobTitlesData);
      console.log("Grades:", gradesData);
      console.log("Tasks:", tasksData);
      console.log("Subtasks:", subtasksData);
      console.log("Requirements:", requirementsData);
      console.log("\nRequirement IDs:");
      requirementsData.forEach((req) => {
        console.log(
          `  ${req.id}: ${req.jobTitleId} + ${req.gradeId} = ${req.required.length} tasks`
        );
      });
      console.log("============================");

      setJobTitles(jobTitlesData);
      setGrades(gradesData.sort((a, b) => a.name.localeCompare(b.name)));
      setTasks(tasksData);
      setSubtasks(subtasksData);
      setRequirements(requirementsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRequirement = (jobTitleId: string, gradeId: string) => {
    if (!selectedSectionId) return null;
    const found = requirements.find(
      (r) =>
        r.sectionId === selectedSectionId &&
        r.jobTitleId === jobTitleId &&
        r.gradeId === gradeId
    );
    return found;
  };

  // Filter requirements by selected section
  const filteredRequirements = selectedSectionId
    ? requirements.filter((r) => r.sectionId === selectedSectionId)
    : [];

  // Filter job titles by section
  const filteredJobTitles = selectedSectionId
    ? jobTitles.filter(
        (jt) => !jt.sectionId || jt.sectionId === selectedSectionId
      )
    : jobTitles;

  const handleCellClick = (jobTitle: JobTitle, grade: Grade) => {
    setSelectedJobTitle(jobTitle);
    setSelectedGrade(grade);

    const existing = getRequirement(jobTitle.id, grade.id);
    setEditingRequirement(existing || null);

    // Initialize selected tasks/subtasks
    const taskMap = new Map<string, Set<string>>();
    if (existing) {
      existing.required.forEach((req) => {
        taskMap.set(req.taskId, new Set(req.subtaskIds));
      });
    }
    setSelectedTasks(taskMap);

    setShowModal(true);
  };

  const handleTaskToggle = (taskId: string) => {
    const newMap = new Map(selectedTasks);
    if (newMap.has(taskId)) {
      newMap.delete(taskId);
    } else {
      newMap.set(taskId, new Set());
    }
    setSelectedTasks(newMap);
  };

  const handleSubtaskToggle = (taskId: string, subtaskId: string) => {
    const newMap = new Map(selectedTasks);
    const subtaskSet = newMap.get(taskId) || new Set();

    if (subtaskSet.has(subtaskId)) {
      subtaskSet.delete(subtaskId);
    } else {
      subtaskSet.add(subtaskId);
    }

    newMap.set(taskId, subtaskSet);
    setSelectedTasks(newMap);
  };

  const handleSelectAllSubtasks = (taskId: string) => {
    const taskSubtasks = subtasks.filter((st) => st.taskId === taskId);
    const newMap = new Map(selectedTasks);
    newMap.set(taskId, new Set(taskSubtasks.map((st) => st.id)));
    setSelectedTasks(newMap);
  };

  const handleSubmit = async () => {
    if (!selectedJobTitle || !selectedGrade) {
      alert("Please select job title and grade");
      return;
    }

    const requiredArray = Array.from(selectedTasks.entries())
      .filter(([_, subtaskIds]) => subtaskIds.size > 0)
      .map(([taskId, subtaskIds]) => ({
        taskId,
        subtaskIds: Array.from(subtaskIds),
      }));

    if (requiredArray.length === 0) {
      alert("Please select at least one task with subtasks");
      return;
    }

    setSaving(true);
    try {
      console.log("Saving requirement:", {
        jobTitleId: selectedJobTitle.id,
        gradeId: selectedGrade.id,
        required: requiredArray,
      });

      if (!selectedSectionId) {
        alert("Please select a section first");
        setSaving(false);
        return;
      }

      if (editingRequirement) {
        console.log("Updating existing requirement:", editingRequirement.id);
        await mockApi.updatePromotionRequirement(editingRequirement.id, {
          sectionId: selectedSectionId,
          required: requiredArray,
          updatedAt: new Date().toISOString(),
        });
      } else {
        console.log("Creating new requirement");
        const newReq = {
          id: `pr-${selectedSectionId.split("-").pop()}-${selectedJobTitle.id
            .split("-")
            .pop()}-${selectedGrade.id.split("-").pop()}`,
          sectionId: selectedSectionId,
          jobTitleId: selectedJobTitle.id,
          gradeId: selectedGrade.id,
          required: requiredArray,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        console.log("New requirement:", newReq);
        await mockApi.createPromotionRequirement(newReq);
      }

      await loadData();
      setShowModal(false);
      setSelectedJobTitle(null);
      setSelectedGrade(null);
      setEditingRequirement(null);
      setSelectedTasks(new Map());
      alert("Requirement saved successfully!");
    } catch (error) {
      console.error("Failed to save requirement:", error);
      alert(`Failed to save requirement: ${error}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Log state before rendering
  console.log("📊 RENDERING MATRIX with data:");
  console.log(
    `   Job Titles: ${jobTitles.length}`,
    jobTitles.map((jt) => jt.id)
  );
  console.log(
    `   Grades: ${grades.length}`,
    grades.map((g) => g.id)
  );
  console.log(
    `   Requirements: ${requirements.length}`,
    requirements.map((r) => `${r.jobTitleId}+${r.gradeId}`)
  );

  // Verification: Test actual lookups
  console.log("\n🧪 VERIFICATION - Testing actual lookups:");
  if (selectedSectionId) {
    filteredJobTitles.forEach((jt) => {
      grades.forEach((g) => {
        const found = getRequirement(jt.id, g.id);
        console.log(
          `   ${jt.name} × ${g.name}: ${
            found ? "✅ " + found.id : "❌ NOT FOUND"
          }`
        );
      });
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Promotion Requirements Matrix
        </h1>
        <p className="text-gray-600 mt-1">
          Configure required tasks and subtasks for each job title and grade
          combination per section
        </p>
      </div>

      {/* Section Selector */}
      <div className="card">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Section <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
          <option value="">-- Select Section --</option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
        </select>
        {selectedSectionId && (
          <p className="text-sm text-gray-500 mt-2">
            Showing requirements for:{" "}
            {sections.find((s) => s.id === selectedSectionId)?.name}
          </p>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">How it works</h3>
        <p className="text-sm text-blue-800">
          Click any cell in the matrix to configure requirements for that job
          title and grade combination. Select which tasks and subtasks employees
          must master to achieve that promotion.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Configuration Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {filteredJobTitles.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Job Titles</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {grades.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Grades</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {filteredRequirements.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Configured</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {filteredJobTitles.length * grades.length}
            </div>
            <div className="text-sm text-gray-600 mt-1">Total Cells</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600">
              {filteredJobTitles.length * grades.length > 0
                ? Math.round(
                    (filteredRequirements.length /
                      (filteredJobTitles.length * grades.length)) *
                      100
                  )
                : 0}
              %
            </div>
            <div className="text-sm text-gray-600 mt-1">Coverage</div>
          </div>
        </div>
      </div>

      {/* Matrix */}
      <div className="card overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                Job Title / Grade
              </th>
              {grades.map((grade) => (
                <th
                  key={grade.id}
                  className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {grade.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!selectedSectionId ? (
              <tr>
                <td
                  colSpan={grades.length + 1}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  Please select a section to view the matrix
                </td>
              </tr>
            ) : (
              filteredJobTitles.map((jobTitle) => (
                <tr key={jobTitle.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 sticky left-0 bg-white">
                    {jobTitle.name}
                  </td>
                  {grades.map((grade) => {
                    const req = getRequirement(jobTitle.id, grade.id);
                    const totalSubtasks = req
                      ? req.required.reduce(
                          (sum, r) => sum + r.subtaskIds.length,
                          0
                        )
                      : 0;

                    return (
                      <td
                        key={grade.id}
                        className="px-6 py-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleCellClick(jobTitle, grade)}
                      >
                        {req ? (
                          <div className="inline-flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckIcon className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-900">
                                Configured
                              </span>
                            </div>
                            <span className="text-xs text-gray-600">
                              {req.required.length} tasks, {totalSubtasks}{" "}
                              subtasks
                            </span>
                          </div>
                        ) : (
                          <button className="text-primary-600 hover:text-primary-900 text-sm font-medium flex items-center gap-1 mx-auto">
                            <PlusIcon className="h-4 w-4" />
                            Configure
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Configuration Modal */}
      {showModal && selectedJobTitle && selectedGrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Configure Requirements
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {selectedJobTitle.name} - {selectedGrade.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {tasks.map((task) => {
                  const taskSubtasks = subtasks.filter(
                    (st) => st.taskId === task.id
                  );
                  const isTaskSelected = selectedTasks.has(task.id);
                  const selectedSubtaskCount =
                    selectedTasks.get(task.id)?.size || 0;

                  return (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg"
                    >
                      {/* Task Header */}
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <input
                              type="checkbox"
                              checked={isTaskSelected}
                              onChange={() => handleTaskToggle(task.id)}
                              className="mt-1"
                            />
                            <div>
                              <h3 className="font-semibold text-gray-900">
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {task.description}
                                </p>
                              )}
                              {isTaskSelected && (
                                <p className="text-xs text-primary-600 mt-2">
                                  {selectedSubtaskCount}/{taskSubtasks.length}{" "}
                                  subtasks selected
                                </p>
                              )}
                            </div>
                          </div>
                          {isTaskSelected && taskSubtasks.length > 0 && (
                            <button
                              onClick={() => handleSelectAllSubtasks(task.id)}
                              className="text-sm text-primary-600 hover:text-primary-900"
                            >
                              Select All
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Subtasks */}
                      {isTaskSelected && (
                        <div className="p-4 space-y-3">
                          {taskSubtasks.length === 0 ? (
                            <p className="text-sm text-gray-500 italic">
                              No subtasks available for this task
                            </p>
                          ) : (
                            taskSubtasks.map((subtask) => {
                              const isSelected =
                                selectedTasks.get(task.id)?.has(subtask.id) ||
                                false;

                              return (
                                <label
                                  key={subtask.id}
                                  className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      handleSubtaskToggle(task.id, subtask.id)
                                    }
                                    className="mt-1"
                                  />
                                  <div className="flex-1">
                                    <h4 className="font-medium text-gray-900">
                                      {subtask.title}
                                    </h4>
                                    {subtask.description && (
                                      <p className="text-sm text-gray-600 mt-1">
                                        {subtask.description}
                                      </p>
                                    )}
                                  </div>
                                </label>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {Array.from(selectedTasks.values()).reduce(
                  (sum, set) => sum + set.size,
                  0
                )}{" "}
                subtasks selected across {selectedTasks.size} tasks
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Requirements"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionRequirementsManagement;
