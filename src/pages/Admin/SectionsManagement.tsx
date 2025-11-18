import { useState, useEffect } from "react";
import { mockApi } from "@/mock/services/mockApi";
import {
  Section,
  JobTitle,
  Grade,
  Department,
  SectionJobTitleMapping,
  SectionGradeMapping,
  PromotionRequirement,
} from "@/types";
import { useNotifications } from "@/context/NotificationContext";
import {
  PlusIcon,
  PencilIcon,
  TableCellsIcon,
  BriefcaseIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

const SectionsManagement = () => {
  const { showToast } = useNotifications();
  const [sections, setSections] = useState<Section[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [sectionMappings, setSectionMappings] = useState<
    SectionJobTitleMapping[]
  >([]);
  const [gradeMappings, setGradeMappings] = useState<SectionGradeMapping[]>([]);
  const [requirements, setRequirements] = useState<PromotionRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    departmentId: "",
  });
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [activeView, setActiveView] = useState<
    "list" | "job-titles" | "grades" | "requirements"
  >("list");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        sectionsData,
        departmentsData,
        jobTitlesData,
        gradesData,
        requirementsData,
      ] = await Promise.all([
        mockApi.getSections(),
        mockApi.getDepartments(),
        mockApi.getJobTitles(),
        mockApi.getGrades(),
        mockApi.getPromotionRequirements(),
      ]);
      setSections(sectionsData);
      setDepartments(departmentsData);
      setJobTitles(jobTitlesData);
      setGrades(gradesData);
      setRequirements(requirementsData);

      // Load section mappings
      const allMappings: SectionJobTitleMapping[] = [];
      const allGradeMappings: SectionGradeMapping[] = [];
      for (const section of sectionsData) {
        const jobTitleMappings = await mockApi.getSectionJobTitleMappings(
          section.id
        );
        allMappings.push(...jobTitleMappings);
        for (const jobTitle of jobTitlesData) {
          const gradeMaps = await mockApi.getSectionGradeMappings(
            section.id,
            jobTitle.id
          );
          allGradeMappings.push(...gradeMaps);
        }
      }
      setSectionMappings(allMappings);
      setGradeMappings(allGradeMappings);
    } catch (error) {
      console.error("Failed to load data:", error);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingSection(null);
    setFormData({
      name: "",
      departmentId: "",
    });
    setShowModal(true);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setFormData({
      name: section.name,
      departmentId: section.departmentId,
    });
    setShowModal(true);
  };

  const handleViewJobTitles = (section: Section) => {
    setSelectedSection(section);
    setActiveView("job-titles");
  };

  const handleViewGrades = (section: Section) => {
    setSelectedSection(section);
    setActiveView("grades");
  };

  const handleViewRequirements = (section: Section) => {
    setSelectedSection(section);
    setActiveView("requirements");
  };

  const handleAssignJobTitle = async (jobTitleId: string) => {
    if (!selectedSection) return;
    try {
      await mockApi.assignJobTitleToSection(jobTitleId, selectedSection.id);
      showToast("Job title assigned successfully", "success");
      loadData();
    } catch (error) {
      console.error("Failed to assign job title:", error);
      showToast("Failed to assign job title", "error");
    }
  };

  const handleAssignGrade = async (jobTitleId: string, gradeId: string) => {
    if (!selectedSection) return;
    try {
      await mockApi.assignGradeToSectionJobTitle(
        selectedSection.id,
        jobTitleId,
        gradeId
      );
      showToast("Grade assigned successfully", "success");
      loadData();
    } catch (error) {
      console.error("Failed to assign grade:", error);
      showToast("Failed to assign grade", "error");
    }
  };

  const getJobTitlesForSection = (sectionId: string) => {
    const mappedJobTitleIds = sectionMappings
      .filter((m) => m.sectionId === sectionId)
      .map((m) => m.jobTitleId);
    return jobTitles.filter((jt) => mappedJobTitleIds.includes(jt.id));
  };

  const getGradesForSectionJobTitle = (
    sectionId: string,
    jobTitleId: string
  ) => {
    const mappedGradeIds = gradeMappings
      .filter((m) => m.sectionId === sectionId && m.jobTitleId === jobTitleId)
      .map((m) => m.gradeId);
    return grades.filter((g) => mappedGradeIds.includes(g.id));
  };

  const getRequirementsForSection = (sectionId: string) => {
    return requirements.filter((r) => r.sectionId === sectionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (activeView !== "list" && selectedSection) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => {
                setActiveView("list");
                setSelectedSection(null);
              }}
              className="text-sm text-gray-600 hover:text-gray-900 mb-2"
            >
              ← Back to Sections
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {selectedSection.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeView === "job-titles" &&
                "Manage job titles for this section"}
              {activeView === "grades" && "Manage grade ranges per job title"}
              {activeView === "requirements" && "View requirement matrices"}
            </p>
          </div>
        </div>

        {activeView === "job-titles" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Titles
            </h3>
            <div className="space-y-4">
              {jobTitles.map((jobTitle) => {
                const isAssigned = sectionMappings.some(
                  (m) =>
                    m.sectionId === selectedSection.id &&
                    m.jobTitleId === jobTitle.id
                );
                return (
                  <div
                    key={jobTitle.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {jobTitle.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {jobTitle.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleAssignJobTitle(jobTitle.id)}
                      disabled={isAssigned}
                      className={`btn ${
                        isAssigned ? "btn-secondary" : "btn-primary"
                      }`}
                    >
                      {isAssigned ? "Assigned" : "Assign"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeView === "grades" && (
          <div className="card space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Grade Ranges Per Job Title
            </h3>
            {getJobTitlesForSection(selectedSection.id).map((jobTitle) => {
              const assignedGrades = getGradesForSectionJobTitle(
                selectedSection.id,
                jobTitle.id
              );
              return (
                <div
                  key={jobTitle.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-medium text-gray-900 mb-3">
                    {jobTitle.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {assignedGrades.map((grade) => (
                      <span
                        key={grade.id}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                      >
                        {grade.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {grades
                      .filter(
                        (g) => !assignedGrades.some((ag) => ag.id === g.id)
                      )
                      .map((grade) => (
                        <button
                          key={grade.id}
                          onClick={() =>
                            handleAssignGrade(jobTitle.id, grade.id)
                          }
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                          + {grade.name}
                        </button>
                      ))}
                  </div>
                </div>
              );
            })}
            {getJobTitlesForSection(selectedSection.id).length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No job titles assigned to this section. Assign job titles first.
              </p>
            )}
          </div>
        )}

        {activeView === "requirements" && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Requirement Matrices
            </h3>
            <div className="space-y-4">
              {getRequirementsForSection(selectedSection.id).map((req) => {
                const jobTitle = jobTitles.find(
                  (jt) => jt.id === req.jobTitleId
                );
                const grade = grades.find((g) => g.id === req.gradeId);
                return (
                  <div
                    key={req.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {jobTitle?.name} - {grade?.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {req.required.length} tasks •{" "}
                          {req.required.flatMap((r) => r.subtaskIds).length}{" "}
                          subtasks
                        </p>
                      </div>
                      <button
                        onClick={() =>
                          (window.location.href = `/admin/promotion-requirements?section=${selectedSection.id}&jobTitle=${req.jobTitleId}&grade=${req.gradeId}`)
                        }
                        className="btn btn-secondary"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
              {getRequirementsForSection(selectedSection.id).length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No requirement matrices configured for this section.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sections</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage sections, assign job titles, configure grade ranges, and view
            requirement matrices
          </p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Section
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Titles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sections.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No sections found. Create your first section.
                  </td>
                </tr>
              ) : (
                sections.map((section) => {
                  const department = departments.find(
                    (d) => d.id === section.departmentId
                  );
                  const sectionJobTitles = getJobTitlesForSection(section.id);
                  const sectionRequirements = getRequirementsForSection(
                    section.id
                  );
                  return (
                    <tr key={section.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {section.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {department?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {sectionJobTitles.length}
                          </span>
                          <button
                            onClick={() => handleViewJobTitles(section)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            Manage
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <TableCellsIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {sectionRequirements.length}
                          </span>
                          <button
                            onClick={() => handleViewRequirements(section)}
                            className="text-blue-600 hover:text-blue-900 text-sm"
                          >
                            View
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewGrades(section)}
                            className="text-green-600 hover:text-green-900"
                            title="Manage Grades"
                          >
                            <TrophyIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(section)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingSection ? "Edit Section" : "Create Section"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                showToast(
                  "Create/Update functionality needs API implementation",
                  "info"
                );
                setShowModal(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.departmentId}
                  onChange={(e) =>
                    setFormData({ ...formData, departmentId: e.target.value })
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSection ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionsManagement;
