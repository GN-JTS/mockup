import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { Certificate, JobTitle, Grade } from "@/types";
import { formatDate } from "@/utils/formatters";
import {
  AcademicCapIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const CertificatesList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        const [certsData, jobTitlesData, gradesData] = await Promise.all([
          mockApi.getCertificatesByEmployee(user.id),
          mockApi.getJobTitles(),
          mockApi.getGrades(),
        ]);

        setCertificates(certsData);
        setJobTitles(jobTitlesData);
        setGrades(gradesData);
      } catch (error) {
        console.error("Failed to load certificates:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
        <p className="text-gray-600 mt-1">
          View and download your earned certifications
        </p>
      </div>

      {certificates.length === 0 ? (
        <div className="card text-center py-12">
          <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600">
            Complete your promotions to earn certificates
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => {
            const jobTitle = jobTitles.find((jt) => jt.id === cert.jobTitleId);
            const grade = grades.find((g) => g.id === cert.gradeId);

            return (
              <div
                key={cert.id}
                className="card bg-linear-to-br from-primary-50 via-white to-primary-50 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <AcademicCapIcon className="h-12 w-12 text-primary-600" />
                  <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded">
                    {cert.certificateNumber}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {jobTitle?.name}
                </h3>
                <p className="text-lg font-semibold text-primary-600 mb-4">
                  {grade?.name}
                </p>
                {jobTitle?.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {jobTitle.description}
                  </p>
                )}

                {/* Metadata */}
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Issued:</span>
                    <span className="font-medium text-gray-900">
                      {formatDate(cert.issueDate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Skills Mastered:</span>
                    <span className="font-medium text-gray-900">
                      {cert.masteredSubtaskIds.length} Subtasks
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigate(`/certificates/${cert.id}`)}
                    className="btn btn-primary flex-1 text-sm"
                  >
                    <EyeIcon className="h-4 w-4 mr-2 inline" />
                    View
                  </button>
                  <button className="btn btn-secondary flex-1 text-sm">
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2 inline" />
                    Download
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CertificatesList;
