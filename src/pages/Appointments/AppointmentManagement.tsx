import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { AppointmentRequest, User, Subtask } from "@/types";
import {
  AppointmentStatus,
  AppointmentStatusNames,
  AppointmentStatusColors,
} from "@/utils/constants";
import { formatDateTime } from "@/utils/formatters";
import { useNotifications } from "@/context/NotificationContext";
import {
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

const AppointmentManagement = () => {
  const { user } = useAuth();
  const { showToast } = useNotifications();
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentRequest | null>(null);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedTime, setProposedTime] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [appointmentsData, usersData, subtasksData] = await Promise.all([
          mockApi.getAppointmentRequestsByEmployee(user.id),
          mockApi.getUsers(),
          mockApi.getSubtasks(),
        ]);

        setAppointments(appointmentsData);
        setUsers(usersData);
        setSubtasks(subtasksData);
      } catch (error) {
        console.error("Failed to load appointments:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const handleApproveProposal = async (appointmentId: string) => {
    try {
      await mockApi.updateAppointmentRequest(appointmentId, {
        status: AppointmentStatus.APPROVED,
        requestedDate: appointments.find((a) => a.id === appointmentId)
          ?.proposedDate,
        requestedStartTime: appointments.find((a) => a.id === appointmentId)
          ?.proposedStartTime,
        requestedEndTime: appointments.find((a) => a.id === appointmentId)
          ?.proposedEndTime,
      });

      showToast("Appointment confirmed!", "success");

      const updatedAppointments =
        await mockApi.getAppointmentRequestsByEmployee(user!.id);
      setAppointments(updatedAppointments);
    } catch (error) {
      showToast("Failed to confirm appointment", "error");
    }
  };

  const handleCounterPropose = async () => {
    if (!selectedAppointment || !proposedDate || !proposedTime) {
      showToast("Please select a date and time", "warning");
      return;
    }

    try {
      await mockApi.updateAppointmentRequest(selectedAppointment.id, {
        status: AppointmentStatus.PROPOSED,
        proposedDate,
        proposedStartTime: proposedTime,
        proposedEndTime: proposedTime, // In real app, calculate end time
        proposedBy: user!.id,
      });

      showToast("Counter-proposal submitted", "success");
      setSelectedAppointment(null);
      setProposedDate("");
      setProposedTime("");

      const updatedAppointments =
        await mockApi.getAppointmentRequestsByEmployee(user!.id);
      setAppointments(updatedAppointments);
    } catch (error) {
      showToast("Failed to submit counter-proposal", "error");
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment request?")) {
      return;
    }

    try {
      await mockApi.updateAppointmentRequest(appointmentId, {
        status: AppointmentStatus.CANCELLED,
      });

      showToast("Appointment cancelled", "success");

      const updatedAppointments =
        await mockApi.getAppointmentRequestsByEmployee(user!.id);
      setAppointments(updatedAppointments);
    } catch (error) {
      showToast("Failed to cancel appointment", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const pendingAppointments = appointments.filter(
    (a) => a.status === AppointmentStatus.PENDING
  );
  const proposedAppointments = appointments.filter(
    (a) => a.status === AppointmentStatus.PROPOSED
  );
  const confirmedAppointments = appointments.filter(
    (a) =>
      a.status === AppointmentStatus.CONFIRMED ||
      a.status === AppointmentStatus.APPROVED
  );
  const pastAppointments = appointments.filter(
    (a) =>
      a.status === AppointmentStatus.COMPLETED ||
      a.status === AppointmentStatus.CANCELLED
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-600 mt-1">
          Manage your mentorship and evaluation appointments
        </p>
      </div>

      {/* Pending Appointments */}
      {pendingAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <ClockIcon className="h-5 w-5 inline mr-2 text-yellow-600" />
            Awaiting Response
          </h2>
          <div className="space-y-3">
            {pendingAppointments.map((appointment) => {
              const mentor = users.find(
                (u) => u.id === appointment.mentorOrEvaluatorId
              );
              const appointmentSubtasks = subtasks.filter((st) =>
                appointment.subtaskIds.includes(st.id)
              );

              return (
                <div
                  key={appointment.id}
                  className="border border-yellow-200 bg-yellow-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.type === "mentorship"
                          ? "Mentorship Session"
                          : "Evaluation Session"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        With: {mentor?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDateTime(
                          new Date(
                            appointment.requestedDate +
                              "T" +
                              appointment.requestedStartTime
                          )
                        )}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        AppointmentStatusColors[appointment.status]
                      }`}
                    >
                      {AppointmentStatusNames[appointment.status]}
                    </span>
                  </div>

                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Subtasks:</p>
                    <div className="flex flex-wrap gap-1">
                      {appointmentSubtasks.map((st) => (
                        <span
                          key={st.id}
                          className="px-2 py-1 text-xs bg-white rounded"
                        >
                          {st.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="btn btn-danger text-sm"
                    >
                      Cancel Request
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Proposed Appointments (Negotiation) */}
      {proposedAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <CalendarIcon className="h-5 w-5 inline mr-2 text-blue-600" />
            Counter-Proposals
          </h2>
          <div className="space-y-3">
            {proposedAppointments.map((appointment) => {
              const mentor = users.find(
                (u) => u.id === appointment.mentorOrEvaluatorId
              );

              return (
                <div
                  key={appointment.id}
                  className="border border-blue-200 bg-blue-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.type === "mentorship"
                          ? "Mentorship Session"
                          : "Evaluation Session"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        With: {mentor?.name}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      New Time Proposed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Your Request:
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDateTime(
                          new Date(
                            appointment.requestedDate +
                              "T" +
                              appointment.requestedStartTime
                          )
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Proposed Time:
                      </p>
                      <p className="text-sm font-medium text-primary-600">
                        {formatDateTime(
                          new Date(
                            appointment.proposedDate! +
                              "T" +
                              appointment.proposedStartTime!
                          )
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApproveProposal(appointment.id)}
                      className="btn btn-primary text-sm"
                    >
                      <CheckCircleIcon className="h-4 w-4 inline mr-1" />
                      Accept Proposed Time
                    </button>
                    <button
                      onClick={() => setSelectedAppointment(appointment)}
                      className="btn btn-secondary text-sm"
                    >
                      <ClockIcon className="h-4 w-4 inline mr-1" />
                      Propose Different Time
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="btn btn-danger text-sm"
                    >
                      <XCircleIcon className="h-4 w-4 inline mr-1" />
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Counter-Proposal Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Propose New Time
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="input"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  value={proposedTime}
                  onChange={(e) => setProposedTime(e.target.value)}
                  className="input"
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleCounterPropose}
                  className="btn btn-primary flex-1"
                >
                  Submit Proposal
                </button>
                <button
                  onClick={() => {
                    setSelectedAppointment(null);
                    setProposedDate("");
                    setProposedTime("");
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmed Appointments */}
      {confirmedAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            <CheckCircleIcon className="h-5 w-5 inline mr-2 text-green-600" />
            Upcoming Appointments
          </h2>
          <div className="space-y-3">
            {confirmedAppointments.map((appointment) => {
              const mentor = users.find(
                (u) => u.id === appointment.mentorOrEvaluatorId
              );
              const appointmentSubtasks = subtasks.filter((st) =>
                appointment.subtaskIds.includes(st.id)
              );

              return (
                <div
                  key={appointment.id}
                  className="border border-green-200 bg-green-50 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {appointment.type === "mentorship"
                          ? "Mentorship Session"
                          : "Evaluation Session"}
                      </h3>
                      <p className="text-sm text-gray-600">
                        With: {mentor?.name}
                      </p>
                      <p className="text-sm font-medium text-gray-900 mt-1">
                        {formatDateTime(
                          new Date(
                            appointment.requestedDate +
                              "T" +
                              appointment.requestedStartTime
                          )
                        )}
                      </p>
                    </div>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </div>

                  {appointmentSubtasks.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Subtasks:</p>
                      <div className="flex flex-wrap gap-1">
                        {appointmentSubtasks.map((st) => (
                          <span
                            key={st.id}
                            className="px-2 py-1 text-xs bg-white rounded"
                          >
                            {st.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {appointment.notes && (
                    <p className="text-sm text-gray-600 mt-2">
                      Notes: {appointment.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Past Appointments
          </h2>
          <div className="space-y-2">
            {pastAppointments.map((appointment) => {
              const mentor = users.find(
                (u) => u.id === appointment.mentorOrEvaluatorId
              );

              return (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {appointment.type === "mentorship"
                        ? "Mentorship"
                        : "Evaluation"}{" "}
                      - {mentor?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {formatDateTime(
                        new Date(
                          appointment.requestedDate +
                            "T" +
                            appointment.requestedStartTime
                        )
                      )}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      AppointmentStatusColors[appointment.status]
                    }`}
                  >
                    {AppointmentStatusNames[appointment.status]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="card text-center py-12">
          <CalendarIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Appointments
          </h3>
          <p className="text-gray-600 mb-4">
            You haven't scheduled any appointments yet
          </p>
          <button className="btn btn-primary">Book New Appointment</button>
        </div>
      )}
    </div>
  );
};

export default AppointmentManagement;
