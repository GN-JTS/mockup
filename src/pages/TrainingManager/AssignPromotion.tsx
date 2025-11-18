import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  User,
  JobTitle,
  Grade,
  PromotionRequirement,
  Task,
  Subtask,
  EmployeePromotion,
  EmployeeProgress,
} from "@/types";
import { EvaluationStatus } from "@/utils/constants";
import { useNotifications } from "@/context/NotificationContext";
import {
  compareRequirements,
  hasDifferences,
  getNewSubtasks,
  getCompletedSubtasks,
} from "@/utils/promotionComparison";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Simple ID generator
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const AssignPromotion = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Data
  const [employee, setEmployee] = useState<User | null>(null);
  const [currentJobTitle, setCurrentJobTitle] = useState<JobTitle | null>(null);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [allJobTitles, setAllJobTitles] = useState<JobTitle[]>([]);
  const [allGrades, setAllGrades] = useState<Grade[]>([]);
  // Removed unused promotionRequirements state - using requirements from API directly
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [currentRequirement, setCurrentRequirement] =
    useState<PromotionRequirement | null>(null);

  // Selection State
  const [selectedJobTitleId, setSelectedJobTitleId] = useState("");
  const [selectedGradeId, setSelectedGradeId] = useState("");
  const [availableGrades, setAvailableGrades] = useState<Grade[]>([]);
  const [promotionOptions, setPromotionOptions] = useState<
    Array<{
      requirement: PromotionRequirement;
      jobTitle: JobTitle | undefined;
      grade: Grade | undefined;
      differences: ReturnType<typeof compareRequirements>;
    }>
  >([]);
  const [selectedRequirement, setSelectedRequirement] =
    useState<PromotionRequirement | null>(null);
  const [optionsLoaded, setOptionsLoaded] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [masteredSubtasks, setMasteredSubtasks] = useState<string[]>([]);
  const [assignmentNote, setAssignmentNote] = useState("");

  useEffect(() => {
    loadData();
  }, [employeeId]);

  useEffect(() => {
    // Load mastered subtasks when employee and current grade are loaded
    if (employee && currentGrade && currentJobTitle) {
      loadMasteredSubtasks();
    }
  }, [employee, currentGrade, currentJobTitle]);

  useEffect(() => {
    // When job title is selected, filter available grades for that job title in employee's section
    if (selectedJobTitleId && employee?.sectionId) {
      loadAvailableGrades();
    } else {
      setAvailableGrades([]);
      setSelectedGradeId("");
    }
  }, [selectedJobTitleId, employee?.sectionId]);

  const loadMasteredSubtasks = async () => {
    if (!employee) return;
    try {
      const mastered = await mockApi.getMasteredSubtasksForEmployee(
        employee.id
      );
      setMasteredSubtasks(mastered);
      console.log(
        `📚 Loaded ${mastered.length} mastered subtasks for ${employee.name}:`,
        mastered
      );
    } catch (error) {
      console.error("Failed to load mastered subtasks:", error);
    }
  };

  const loadAvailableGrades = async () => {
    if (!selectedJobTitleId || !employee?.sectionId) return;
    try {
      const grades = await mockApi.getGradesBySectionAndJobTitle(
        employee.sectionId,
        selectedJobTitleId
      );
      setAvailableGrades(grades);
      console.log(
        `📊 Loaded ${grades.length} available grades for ${selectedJobTitleId} in section ${employee.sectionId}`
      );
    } catch (error) {
      console.error("Failed to load available grades:", error);
      setAvailableGrades([]);
    }
  };

  const loadData = async () => {
    if (!employeeId) return;

    setLoading(true);
    try {
      const [employeeData, jobTitlesData, gradesData, tasksData, subtasksData] =
        await Promise.all([
          mockApi.getUserById(employeeId),
          mockApi.getJobTitles(),
          mockApi.getGrades(),
          mockApi.getTasks(),
          mockApi.getSubtasks(),
        ]);

      if (!employeeData) {
        showToast("Employee not found", "error");
        navigate("/training-manager");
        return;
      }

      setEmployee(employeeData);
      setAllJobTitles(jobTitlesData);
      setAllGrades(gradesData);
      setTasks(tasksData);
      setSubtasks(subtasksData);

      // Load current job title and grade
      const [jobTitleData, gradeData] = await Promise.all([
        mockApi.getJobTitleById(employeeData.jobTitleId),
        mockApi.getGradeById(employeeData.gradeId),
      ]);

      setCurrentJobTitle(jobTitleData || null);
      setCurrentGrade(gradeData || null);

      // Load current requirement for comparison
      if (employeeData.sectionId && jobTitleData && gradeData) {
        const currentReq =
          await mockApi.getPromotionRequirementBySectionJobGrade(
            employeeData.sectionId,
            employeeData.jobTitleId,
            employeeData.gradeId
          );
        setCurrentRequirement(currentReq || null);
      }
    } catch (error) {
      console.error("Failed to load assignment data:", error);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadOptions = async () => {
    if (!selectedJobTitleId || !selectedGradeId || !employee) {
      showToast("Please select both Job Title and Grade", "error");
      return;
    }

    setLoadingOptions(true);
    setOptionsLoaded(false);
    setPromotionOptions([]);

    try {
      // Get all promotion requirements for employee's section
      const sectionRequirements =
        await mockApi.getPromotionRequirementsBySection(employee.sectionId);

      // Filter to only the selected job title + grade combinations
      const targetRequirements = sectionRequirements.filter(
        (req) =>
          req.jobTitleId === selectedJobTitleId &&
          req.gradeId === selectedGradeId
      );

      console.log(
        `🔍 Found ${targetRequirements.length} requirements for ${selectedJobTitleId} + ${selectedGradeId}`
      );

      // Compare each requirement with current requirement
      const optionsWithDifferences = targetRequirements
        .map((req) => {
          const differences = compareRequirements(currentRequirement, req);
          const jobTitle = allJobTitles.find((jt) => jt.id === req.jobTitleId);
          const grade = allGrades.find((g) => g.id === req.gradeId);

          return {
            requirement: req,
            jobTitle,
            grade,
            differences,
          };
        })
        .filter((opt) => {
          // Only show options with actual differences
          const hasDiff = hasDifferences(currentRequirement, opt.requirement);
          if (!hasDiff) {
            console.log(
              `❌ Filtered out ${opt.requirement.id} - no differences`
            );
          }
          return hasDiff;
        });

      console.log(
        `✅ Found ${optionsWithDifferences.length} promotion options with differences`
      );

      setPromotionOptions(optionsWithDifferences);
      setOptionsLoaded(true);
    } catch (error) {
      console.error("Failed to load promotion options:", error);
      showToast("Failed to load promotion options", "error");
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleSelectPromotion = (requirement: PromotionRequirement) => {
    setSelectedRequirement(requirement);
  };

  const handleAssign = async () => {
    if (!employee || !selectedJobTitleId || !selectedGradeId || !currentUser) {
      showToast("Missing required data", "error");
      return;
    }

    if (!selectedRequirement) {
      showToast("Please select a promotion option", "error");
      return;
    }

    setSubmitting(true);

    try {
      // Check for existing active promotion
      const existingPromotions = await mockApi.getEmployeePromotionsByEmployee(
        employee.id
      );
      const hasActive = existingPromotions.some(
        (p) =>
          p.status === "assigned" ||
          p.status === "in_progress" ||
          p.status === "pending_approval"
      );

      if (hasActive) {
        showToast(
          "Employee already has an active promotion. Complete or cancel it first.",
          "error"
        );
        setSubmitting(false);
        return;
      }

      // Create new promotion with PENDING_APPROVAL status
      const newPromotion: EmployeePromotion = {
        id: generateId(),
        employeeId: employee.id,
        targetJobTitleId: selectedJobTitleId,
        targetGradeId: selectedGradeId,
        status: "pending_approval",
        assignedBy: currentUser.id,
        assignedAt: new Date().toISOString(),
        requirementId: selectedRequirement.id,
      };

      await mockApi.createEmployeePromotion(newPromotion);

      // Create progress records for all required subtasks
      const progressRecords: EmployeeProgress[] = [];
      let carriedForwardCount = 0;
      let newSubtasksCount = 0;

      selectedRequirement.required.forEach((reqTask) => {
        reqTask.subtaskIds.forEach((subtaskId) => {
          const isAlreadyMastered = masteredSubtasks.includes(subtaskId);

          if (isAlreadyMastered) {
            carriedForwardCount++;
          } else {
            newSubtasksCount++;
          }

          progressRecords.push({
            id: generateId(),
            promotionId: newPromotion.id,
            employeeId: employee.id,
            subtaskId: subtaskId,
            mentorStatus: isAlreadyMastered
              ? EvaluationStatus.MASTER
              : EvaluationStatus.NOT_STARTED,
            evaluatorStatus: isAlreadyMastered
              ? EvaluationStatus.MASTER
              : EvaluationStatus.NOT_STARTED,
            history: isAlreadyMastered
              ? [
                  {
                    id: generateId(),
                    evaluatorId: currentUser.id,
                    evaluatorRole: "mentor" as const,
                    status: EvaluationStatus.MASTER,
                    feedback: "Carried forward from previous promotion",
                    evaluatedAt: new Date().toISOString(),
                  },
                ]
              : [],
          });
        });
      });

      if (progressRecords.length > 0) {
        await mockApi.saveEmployeeProgressBatch(progressRecords);
      }

      // Send notification to Manager for approval
      try {
        await mockApi.createNotification({
          id: generateId(),
          userId: employee.id,
          type: "promotion_approval_request",
          title: "Promotion Approval Required",
          message: `Training Manager ${
            currentUser.name
          } has assigned a promotion to ${employee.name} (${
            currentJobTitle?.name
          } ${currentGrade?.name} → ${
            allJobTitles.find((jt) => jt.id === selectedJobTitleId)?.name
          } ${
            allGrades.find((g) => g.id === selectedGradeId)?.name
          }). Your approval is required.`,
          relatedId: newPromotion.id,
          createdAt: new Date().toISOString(),
          read: false,
        });
      } catch (error) {
        console.error("Failed to send notification:", error);
      }

      const successMessage =
        carriedForwardCount > 0
          ? `Promotion request submitted! ${carriedForwardCount} subtask(s) from current level + completed promotions will be carried forward. ${newSubtasksCount} new subtask(s) to master. Awaiting Manager approval.`
          : `Promotion request submitted to ${employee.name}'s Manager for approval!`;

      showToast(successMessage, "success");

      // Navigate to progress view
      navigate(`/training-manager/progress/${employee.id}`);
    } catch (error) {
      console.error("Failed to assign promotion:", error);
      showToast("Failed to assign promotion", "error");
    } finally {
      setSubmitting(false);
      setShowConfirmDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="card text-center py-12">
        <ExclamationTriangleIcon className="h-16 w-16 mx-auto text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Employee Not Found
        </h2>
        <button
          onClick={() => navigate("/training-manager")}
          className="btn btn-primary mt-4"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const selectedOption = promotionOptions.find(
    (opt) => opt.requirement.id === selectedRequirement?.id
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <button
          onClick={() => navigate("/training-manager")}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Assign Promotion
        </h1>
        <p className="text-gray-600">
          Configure and assign a new promotion path for {employee.name}
        </p>
      </div>

      {/* Current Position */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Current Position
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-1">Employee</p>
            <p className="font-semibold text-blue-900">{employee.name}</p>
            <p className="text-sm text-blue-700">{employee.email}</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-1">Job Title</p>
            <p className="font-semibold text-blue-900">
              {currentJobTitle?.name || "N/A"}
            </p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900 mb-1">Grade</p>
            <p className="font-semibold text-blue-900">
              {currentGrade?.name || "N/A"}
            </p>
          </div>
        </div>
      </div>

      {/* Step 1 & 2: Job Title and Grade Selection */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Promotion Target
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          First, select the target Job Title and Grade for this promotion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Step 1: Job Title Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 1: Select Job Title <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedJobTitleId}
              onChange={(e) => {
                setSelectedJobTitleId(e.target.value);
                setSelectedGradeId("");
                setOptionsLoaded(false);
                setPromotionOptions([]);
                setSelectedRequirement(null);
              }}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">-- Select Job Title --</option>
              {allJobTitles
                .filter(
                  (jt) => !jt.sectionId || jt.sectionId === employee.sectionId
                )
                .map((jt) => (
                  <option key={jt.id} value={jt.id}>
                    {jt.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Step 2: Grade Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Step 2: Select Grade <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedGradeId}
              onChange={(e) => {
                setSelectedGradeId(e.target.value);
                setOptionsLoaded(false);
                setPromotionOptions([]);
                setSelectedRequirement(null);
              }}
              disabled={!selectedJobTitleId}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {selectedJobTitleId
                  ? "-- Select Grade --"
                  : "Select Job Title first"}
              </option>
              {availableGrades.map((grade) => (
                <option key={grade.id} value={grade.id}>
                  {grade.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 3: Load Options Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            {selectedJobTitleId && selectedGradeId
              ? "Ready to load promotion options"
              : "Please select both Job Title and Grade"}
          </p>
          <button
            onClick={handleLoadOptions}
            disabled={!selectedJobTitleId || !selectedGradeId || loadingOptions}
            className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingOptions ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <ArrowPathIcon className="h-5 w-5" />
                Load Promotion Options
              </>
            )}
          </button>
        </div>
      </div>

      {/* Promotion Options with Differences */}
      {optionsLoaded && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Available Promotion Options
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Only promotions with actual differences (new tasks/subtasks) are
            shown.
          </p>

          {promotionOptions.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <InformationCircleIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                No promotion options with differences found for this
                combination.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                All required tasks and subtasks are already completed at the
                current level.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {promotionOptions.map((option) => {
                const newSubtasks = getNewSubtasks(
                  currentRequirement,
                  option.requirement
                );
                const completedSubtasks = getCompletedSubtasks(
                  currentRequirement,
                  option.requirement
                );
                const isSelected =
                  selectedRequirement?.id === option.requirement.id;

                return (
                  <div
                    key={option.requirement.id}
                    className={`border-2 rounded-lg p-6 transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:border-gray-400 cursor-pointer"
                    }`}
                    onClick={() => handleSelectPromotion(option.requirement)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {option.jobTitle?.name} - {option.grade?.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Promotion Path
                        </p>
                      </div>
                      {isSelected && (
                        <CheckCircleIcon className="h-6 w-6 text-primary-600" />
                      )}
                    </div>

                    {/* Differences Summary */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-green-50 border border-green-200 rounded p-3">
                        <p className="text-xs font-medium text-green-900 mb-1">
                          ✅ Already Completed
                        </p>
                        <p className="text-lg font-bold text-green-900">
                          {completedSubtasks.reduce(
                            (sum, item) => sum + item.subtaskIds.length,
                            0
                          )}
                        </p>
                        <p className="text-xs text-green-700">subtasks</p>
                      </div>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-xs font-medium text-yellow-900 mb-1">
                          🆕 New to Complete
                        </p>
                        <p className="text-lg font-bold text-yellow-900">
                          {newSubtasks.reduce(
                            (sum, item) => sum + item.subtaskIds.length,
                            0
                          )}
                        </p>
                        <p className="text-xs text-yellow-700">subtasks</p>
                      </div>
                    </div>

                    {/* Detailed Differences */}
                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="font-medium text-gray-900 mb-3">
                          Detailed Differences:
                        </h4>
                        <div className="space-y-3">
                          {/* New Tasks */}
                          {option.differences.newTasks.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-yellow-900 mb-2">
                                🆕 New Tasks:
                              </p>
                              {option.differences.newTasks.map((taskId) => {
                                const task = tasks.find((t) => t.id === taskId);
                                return (
                                  <div
                                    key={taskId}
                                    className="ml-4 text-sm text-gray-700"
                                  >
                                    • {task?.title || taskId}
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* New Subtasks */}
                          {newSubtasks.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-yellow-900 mb-2">
                                🆕 New Subtasks:
                              </p>
                              {newSubtasks.map((item) => {
                                const task = tasks.find(
                                  (t) => t.id === item.taskId
                                );
                                return (
                                  <div key={item.taskId} className="ml-4 mb-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {task?.title || item.taskId}
                                    </p>
                                    <ul className="ml-4 space-y-1">
                                      {item.subtaskIds.map((subtaskId) => {
                                        const subtask = subtasks.find(
                                          (st) => st.id === subtaskId
                                        );
                                        return (
                                          <li
                                            key={subtaskId}
                                            className="text-sm text-gray-700"
                                          >
                                            ├── {subtask?.title || subtaskId}{" "}
                                            <span className="text-yellow-600 font-medium">
                                              (NEW)
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Completed Subtasks */}
                          {completedSubtasks.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-green-900 mb-2">
                                ✅ Already Completed:
                              </p>
                              {completedSubtasks.map((item) => {
                                const task = tasks.find(
                                  (t) => t.id === item.taskId
                                );
                                return (
                                  <div key={item.taskId} className="ml-4 mb-2">
                                    <p className="text-sm font-medium text-gray-900">
                                      {task?.title || item.taskId}
                                    </p>
                                    <ul className="ml-4 space-y-1">
                                      {item.subtaskIds.map((subtaskId) => {
                                        const subtask = subtasks.find(
                                          (st) => st.id === subtaskId
                                        );
                                        return (
                                          <li
                                            key={subtaskId}
                                            className="text-sm text-gray-700"
                                          >
                                            ├── {subtask?.title || subtaskId}{" "}
                                            <span className="text-green-600 font-medium">
                                              (already completed)
                                            </span>
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Assignment Button */}
          {selectedRequirement && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Note / Justification (Optional)
                </label>
                <textarea
                  value={assignmentNote}
                  onChange={(e) => setAssignmentNote(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="Add any notes or justification for this promotion assignment..."
                />
              </div>
              <button
                onClick={() => setShowConfirmDialog(true)}
                disabled={submitting}
                className="btn btn-primary w-full"
              >
                Assign Promotion
              </button>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && selectedRequirement && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Promotion Assignment
            </h3>
            <p className="text-gray-600 mb-4">
              You are about to assign the following promotion:
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900">
                {employee.name} → {selectedOption?.jobTitle?.name}{" "}
                {selectedOption?.grade?.name}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                {selectedRequirement.required.length} tasks •{" "}
                {
                  selectedRequirement.required.flatMap((r) => r.subtaskIds)
                    .length
                }{" "}
                subtasks
              </p>
            </div>

            {/* Show carried forward subtasks */}
            {masteredSubtasks.length > 0 && selectedOption && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-green-900">
                      {(() => {
                        if (!selectedOption)
                          return "0 Subtask Already Mastered";
                        const completedCount = getCompletedSubtasks(
                          currentRequirement,
                          selectedOption.requirement
                        ).reduce(
                          (sum, item) => sum + item.subtaskIds.length,
                          0
                        );
                        return `${completedCount} Subtask${
                          completedCount !== 1 ? "s" : ""
                        } Already Mastered`;
                      })()}
                    </p>
                    <p className="text-sm text-green-700 mt-1">
                      Includes all subtasks from current level (
                      {currentJobTitle?.name} {currentGrade?.name}) plus any
                      from completed promotions. Employee only needs to complete{" "}
                      {(() => {
                        if (!selectedOption) return "0 new subtasks";
                        const newCount = getNewSubtasks(
                          currentRequirement,
                          selectedOption.requirement
                        ).reduce(
                          (sum, item) => sum + item.subtaskIds.length,
                          0
                        );
                        return `${newCount} new subtask${
                          newCount !== 1 ? "s" : ""
                        }`;
                      })()}
                      .
                    </p>
                  </div>
                </div>
              </div>
            )}

            {assignmentNote && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-gray-900 mb-1">Note:</p>
                <p className="text-sm text-gray-700">{assignmentNote}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                disabled={submitting}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "Assigning..." : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignPromotion;
