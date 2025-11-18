import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { Certificate, JobTitle, Grade, Subtask, Task } from "@/types";
import { formatDate } from "@/utils/formatters";
import {
  ArrowLeftIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";

const CertificateView = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [jobTitle, setJobTitle] = useState<JobTitle | null>(null);
  const [grade, setGrade] = useState<Grade | null>(null);
  // Removed unused promotion state
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!id || !user) return;

      try {
        const certsData = await mockApi.getCertificatesByEmployee(user.id);
        const cert = certsData.find((c) => c.id === id);

        if (!cert) {
          navigate("/certificates");
          return;
        }

        const [jobTitleData, gradeData, tasksData, subtasksData] =
          await Promise.all([
            mockApi.getJobTitleById(cert.jobTitleId),
            mockApi.getGradeById(cert.gradeId),
            mockApi.getTasks(),
            mockApi.getSubtasks(),
          ]);

        setCertificate(cert);
        setJobTitle(jobTitleData || null);
        setGrade(gradeData || null);
        // promotionData is loaded but not used in UI
        setTasks(tasksData);
        setSubtasks(subtasksData);
      } catch (error) {
        console.error("Failed to load certificate:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user, navigate]);

  const handleDownload = () => {
    // Simulate PDF download
    alert(
      "In a real application, this would download a PDF certificate.\n\nFeatures:\n- Official certificate template\n- Digital signature\n- QR code for verification\n- Certificate number\n- Issue date\n- Skills mastered"
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!certificate || !jobTitle || !grade) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Certificate not found</p>
        <button
          onClick={() => navigate("/certificates")}
          className="btn btn-primary mt-4"
        >
          Back to Certificates
        </button>
      </div>
    );
  }

  const certSubtasks = subtasks.filter((st) =>
    certificate.masteredSubtaskIds.includes(st.id)
  );
  const taskIds = [...new Set(certSubtasks.map((st) => st.taskId))];
  const certTasks = tasks.filter((t) => taskIds.includes(t.id));

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate("/certificates")}
        className="flex items-center text-gray-600 hover:text-gray-900"
      >
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Certificates
      </button>

      {/* Certificate Preview */}
      <div className="card bg-linear-to-br from-primary-50 via-white to-primary-50 border-4 border-primary-600">
        <div className="text-center space-y-6 py-8">
          <AcademicCapIcon className="h-20 w-20 mx-auto text-primary-600" />

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Certificate of Completion
            </h1>
            <p className="text-lg text-gray-600">
              Job Training Standard System
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-gray-700 mb-4">This certifies that</p>
            <p className="text-3xl font-bold text-gray-900 mb-4">
              {user?.name}
            </p>
            <p className="text-lg text-gray-700 mb-4">
              has successfully completed the promotion requirements for
            </p>
            <div className="mb-6">
              <p className="text-3xl font-bold text-primary-600">
                {jobTitle.name}
              </p>
              <p className="text-2xl font-semibold text-gray-700 mt-2">
                {grade.name}
              </p>
            </div>
            <p className="text-sm text-gray-600 italic">
              Mastered {certificate.masteredSubtaskIds.length} subtasks across{" "}
              {certTasks.length} tasks
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto pt-6 border-t-2 border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Issue Date</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(certificate.issueDate)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Certificate Number</p>
              <p className="text-lg font-mono font-semibold text-gray-900">
                {certificate.certificateNumber}
              </p>
            </div>
          </div>

          <button onClick={handleDownload} className="btn btn-primary mt-6">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2 inline" />
            Download PDF Certificate
          </button>
        </div>
      </div>

      {/* Mastered Skills */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          <CheckCircleIcon className="h-6 w-6 inline mr-2 text-green-600" />
          Skills Mastered
        </h2>

        <div className="space-y-6">
          {certTasks.map((task) => {
            const taskSubtasks = certSubtasks.filter(
              (st) => st.taskId === task.id
            );

            return (
              <div key={task.id}>
                <h3 className="font-semibold text-gray-900 mb-3">
                  {task.title}
                </h3>
                <div className="space-y-2">
                  {taskSubtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-start p-3 bg-green-50 rounded-lg"
                    >
                      <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {subtask.title}
                        </p>
                        {subtask.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {subtask.description}
                          </p>
                        )}
                        {subtask.requirements && (
                          <p className="text-xs text-gray-500 mt-2">
                            <span className="font-medium">Requirements:</span>{" "}
                            {subtask.requirements}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Verification Info */}
      <div className="card bg-gray-50">
        <h3 className="font-semibold text-gray-900 mb-3">
          Certificate Verification
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This certificate can be verified using the certificate number above.
          In a production system, this would include:
        </p>
        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
          <li>QR code for instant verification</li>
          <li>Digital signature from authorized personnel</li>
          <li>Blockchain-based authentication</li>
          <li>Public verification portal</li>
          <li>Expiration date (if applicable)</li>
        </ul>
      </div>
    </div>
  );
};

export default CertificateView;
