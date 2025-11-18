import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  User,
  CalendarSlot,
  Subtask,
  EmployeePromotion,
  EmployeeProgress,
  Task,
} from "@/types";
import {
  AppointmentType,
  EvaluationStatus,
  AppointmentStatus,
} from "@/utils/constants";
import { useNotifications } from "@/context/NotificationContext";
import {
  CalendarIcon,
  UserIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const AppointmentBooking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // Data
  const [mentors, setMentors] = useState<User[]>([]);
  const [evaluators, setEvaluators] = useState<User[]>([]);
  const [activePromotion, setActivePromotion] =
    useState<EmployeePromotion | null>(null);
  const [progress, setProgress] = useState<EmployeeProgress[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [calendarSlots, setCalendarSlots] = useState<CalendarSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [selectedType, setSelectedType] = useState<AppointmentType>(
    AppointmentType.MENTORSHIP
  );
  const [selectedMentorEvaluator, setSelectedMentorEvaluator] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedSubtasks, setSelectedSubtasks] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Get employee's active promotion
        const promotions = await mockApi.getEmployeePromotionsByEmployee(
          user.id
        );
        const active = promotions.find(
          (p) => p.status === "assigned" || p.status === "in_progress"
        );

        if (!active) {
          showToast("No active promotion found", "error");
          setLoading(false);
          return;
        }

        setActivePromotion(active);

        // Load all required data
        const [
          progressData,
          tasksData,
          subtasksData,
          mentorsData,
          evaluatorsData,
        ] = await Promise.all([
          mockApi.getEmployeeProgressByPromotion(active.id),
          mockApi.getTasks(),
          mockApi.getSubtasks(),
          mockApi.getMentorsByDepartmentSection(
            user.departmentId,
            user.sectionId,
            active.targetGradeId // Filter by target grade
          ),
          mockApi.getEvaluatorsByDepartmentSection(
            user.departmentId,
            user.sectionId,
            active.targetGradeId // Filter by target grade
          ),
        ]);

        setProgress(progressData);
        setTasks(tasksData);
        setSubtasks(subtasksData);
        setMentors(mentorsData);
        setEvaluators(evaluatorsData);
      } catch (error) {
        console.error("Failed to load appointment data:", error);
        showToast("Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, showToast]);

  useEffect(() => {
    if (selectedMentorEvaluator) {
      mockApi.getCalendarSlots(selectedMentorEvaluator).then(setCalendarSlots);
    } else {
      setCalendarSlots([]);
    }
  }, [selectedMentorEvaluator]);

  // Check if all mentor tasks are mastered
  const areAllMentorTasksMastered = () => {
    if (progress.length === 0) return false;
    return progress.every((p) => p.mentorStatus === EvaluationStatus.MASTER);
  };

  const allMentorTasksMastered = areAllMentorTasksMastered();

  const getAvailableSubtasks = () => {
    if (selectedType === AppointmentType.MENTORSHIP) {
      // Subtasks needing mentor evaluation (not mastered)
      return progress.filter((p) => p.mentorStatus !== EvaluationStatus.MASTER);
    } else {
      // Subtasks needing evaluator assessment (mentor mastered, evaluator not)
      // IMPORTANT: Only show if ALL mentor tasks are mastered
      if (!allMentorTasksMastered) {
        return [];
      }
      return progress.filter(
        (p) =>
          p.mentorStatus === EvaluationStatus.MASTER &&
          p.evaluatorStatus !== EvaluationStatus.MASTER
      );
    }
  };

  const availableProgress = getAvailableSubtasks();

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];

    return calendarSlots.filter(
      (slot) => slot.date === selectedDate && slot.status === "available"
    );
  };

  const availableTimeSlots = getAvailableTimeSlots();

  // Get unique dates from available slots
  const availableDates = Array.from(
    new Set(
      calendarSlots
        .filter((slot) => slot.status === "available")
        .map((slot) => slot.date)
    )
  ).sort();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !activePromotion) {
      showToast("User or promotion data not available", "error");
      return;
    }

    // Validate evaluator booking rule
    if (
      selectedType === AppointmentType.EVALUATION &&
      !allMentorTasksMastered
    ) {
      showToast(
        "You must master all tasks with your mentor before booking an evaluator appointment",
        "error"
      );
      return;
    }

    if (selectedSubtasks.length === 0) {
      showToast("Please select at least one subtask", "error");
      return;
    }

    if (!selectedMentorEvaluator) {
      showToast(
        `Please select a ${
          selectedType === AppointmentType.MENTORSHIP ? "mentor" : "evaluator"
        }`,
        "error"
      );
      return;
    }

    if (!selectedDate || !selectedTime) {
      showToast("Please select a date and time", "error");
      return;
    }

    setSubmitting(true);

    try {
      const [startTime, endTime] = selectedTime.split(" - ");

      const newRequest = {
        id: `req-${Date.now()}`,
        employeeId: user.id,
        mentorOrEvaluatorId: selectedMentorEvaluator,
        promotionId: activePromotion.id,
        type: selectedType,
        status: AppointmentStatus.PENDING,
        requestedDate: selectedDate,
        requestedStartTime: startTime,
        requestedEndTime: endTime,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        subtaskIds: selectedSubtasks,
      };

      await mockApi.createAppointmentRequest(newRequest);

      showToast("Appointment request submitted successfully!", "success");
      navigate("/appointments");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      showToast("Failed to create appointment request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    setSelectedSubtasks((prev) =>
      prev.includes(subtaskId)
        ? prev.filter((id) => id !== subtaskId)
        : [...prev, subtaskId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!activePromotion) {
    return (
      <div className="card text-center py-12">
        <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          No Active Promotion
        </h2>
        <p className="text-gray-600 mb-6">
          You need an active promotion to book appointments.
        </p>
        <button onClick={() => navigate("/")} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentList =
    selectedType === AppointmentType.MENTORSHIP ? mentors : evaluators;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Book Appointment
        </h1>
        <p className="text-gray-600">
          Schedule a mentorship or evaluation session
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Select Type */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            1. Select Appointment Type
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setSelectedType(AppointmentType.MENTORSHIP);
                setSelectedMentorEvaluator("");
                setSelectedSubtasks([]);
              }}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                selectedType === AppointmentType.MENTORSHIP
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <UserIcon
                className={`h-8 w-8 mb-2 ${
                  selectedType === AppointmentType.MENTORSHIP
                    ? "text-primary-600"
                    : "text-gray-400"
                }`}
              />
              <p className="font-semibold text-gray-900">Mentorship</p>
              <p className="text-sm text-gray-600 mt-1">
                Practice and learn with a mentor
              </p>
            </button>
            <button
              type="button"
              onClick={() => {
                if (!allMentorTasksMastered) {
                  showToast(
                    "You must master all tasks with your mentor before booking an evaluator appointment",
                    "error"
                  );
                  return;
                }
                setSelectedType(AppointmentType.EVALUATION);
                setSelectedMentorEvaluator("");
                setSelectedSubtasks([]);
              }}
              disabled={!allMentorTasksMastered}
              className={`p-4 border-2 rounded-lg text-left transition-all ${
                !allMentorTasksMastered
                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  : selectedType === AppointmentType.EVALUATION
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <CheckCircleIcon
                className={`h-8 w-8 mb-2 ${
                  !allMentorTasksMastered
                    ? "text-gray-300"
                    : selectedType === AppointmentType.EVALUATION
                    ? "text-primary-600"
                    : "text-gray-400"
                }`}
              />
              <p className="font-semibold text-gray-900">Evaluation</p>
              <p className="text-sm text-gray-600 mt-1">
                {allMentorTasksMastered
                  ? "Final assessment by an evaluator"
                  : "Complete all mentor tasks first"}
              </p>
              {!allMentorTasksMastered && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ All mentor tasks must be mastered
                </p>
              )}
            </button>
          </div>
        </div>

        {/* Step 2: Select Mentor/Evaluator */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            2. Select{" "}
            {selectedType === AppointmentType.MENTORSHIP
              ? "Mentor"
              : "Evaluator"}
          </h2>
          {currentList.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <UserIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">
                No{" "}
                {selectedType === AppointmentType.MENTORSHIP
                  ? "mentors"
                  : "evaluators"}{" "}
                available for your promotion level.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentList.map((person) => (
                <button
                  key={person.id}
                  type="button"
                  onClick={() => {
                    setSelectedMentorEvaluator(person.id);
                    setSelectedDate("");
                    setSelectedTime("");
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedMentorEvaluator === person.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        person.avatar ||
                        `https://ui-avatars.com/api/?name=${person.name}&background=random`
                      }
                      alt={person.name}
                      className="h-12 w-12 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {person.name}
                      </p>
                      <p className="text-sm text-gray-600">{person.email}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Select Subtasks */}
        {selectedMentorEvaluator && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              3. Select Subtasks to Cover
            </h2>
            {availableProgress.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-gray-600">
                  No subtasks available for{" "}
                  {selectedType === AppointmentType.MENTORSHIP
                    ? "mentorship"
                    : "evaluation"}{" "}
                  at this time.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableProgress.map((prog) => {
                  const subtask = subtasks.find(
                    (st) => st.id === prog.subtaskId
                  );
                  const task = tasks.find((t) => t.id === subtask?.taskId);
                  if (!subtask) return null;

                  return (
                    <label
                      key={prog.id}
                      className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedSubtasks.includes(subtask.id)}
                        onChange={() => handleSubtaskToggle(subtask.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {subtask.title}
                        </p>
                        {task && (
                          <p className="text-xs text-gray-500 mt-1">
                            Task: {task.title}
                          </p>
                        )}
                        {subtask.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {subtask.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              prog.mentorStatus === EvaluationStatus.MASTER
                                ? "bg-green-100 text-green-800"
                                : prog.mentorStatus ===
                                  EvaluationStatus.NOT_STARTED
                                ? "bg-gray-100 text-gray-600"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Mentor: {prog.mentorStatus}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              prog.evaluatorStatus === EvaluationStatus.MASTER
                                ? "bg-green-100 text-green-800"
                                : prog.evaluatorStatus ===
                                  EvaluationStatus.NOT_STARTED
                                ? "bg-gray-100 text-gray-600"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            Evaluator: {prog.evaluatorStatus}
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Select Date & Time */}
        {selectedMentorEvaluator && selectedSubtasks.length > 0 && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              4. Select Date & Time
            </h2>
            <div className="space-y-4">
              {/* Date Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Available Dates
                </label>
                {availableDates.length === 0 ? (
                  <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                    No available dates. Please contact your{" "}
                    {selectedType === AppointmentType.MENTORSHIP
                      ? "mentor"
                      : "evaluator"}{" "}
                    directly.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {availableDates.map((date) => (
                      <button
                        key={date}
                        type="button"
                        onClick={() => {
                          setSelectedDate(date);
                          setSelectedTime("");
                        }}
                        className={`p-3 border-2 rounded-lg text-center ${
                          selectedDate === date
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        <CalendarIcon className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                        <p className="text-sm font-medium">
                          {new Date(date).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Times
                  </label>
                  {availableTimeSlots.length === 0 ? (
                    <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                      No available time slots for this date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {availableTimeSlots.map((slot) => {
                        const timeRange = `${slot.startTime} - ${slot.endTime}`;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedTime(timeRange)}
                            className={`p-3 border-2 rounded-lg text-center ${
                              selectedTime === timeRange
                                ? "border-primary-500 bg-primary-50"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <ClockIcon className="h-5 w-5 mx-auto mb-1 text-gray-600" />
                            <p className="text-sm font-medium">{timeRange}</p>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Add Notes */}
        {selectedDate && selectedTime && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              5. Add Notes (Optional)
            </h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special requests or context for this appointment..."
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              rows={4}
            />
          </div>
        )}

        {/* Submit Button */}
        {selectedDate && selectedTime && (
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Ready to Submit?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSubtasks.length} subtask(s) selected •{" "}
                  {new Date(selectedDate).toLocaleDateString()} at{" "}
                  {selectedTime}
                </p>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AppointmentBooking;
