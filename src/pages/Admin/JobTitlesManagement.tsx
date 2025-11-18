import { useState, useEffect } from "react";
import { mockApi } from "@/mock/services/mockApi";
import { JobTitle, Department, Section } from "@/types";
import { useNotifications } from "@/context/NotificationContext";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const JobTitlesManagement = () => {
  const { showToast } = useNotifications();
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingJobTitle, setEditingJobTitle] = useState<JobTitle | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: "",
    sectionId: "",
  });
  const [selectedJobTitle, setSelectedJobTitle] = useState<JobTitle | null>(
    null
  );
  const [showAssignments, setShowAssignments] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobTitlesData, departmentsData, sectionsData] = await Promise.all([
        mockApi.getJobTitles(),
        mockApi.getDepartments(),
        mockApi.getSections(),
      ]);
      setJobTitles(jobTitlesData);
      setDepartments(departmentsData);
      setSections(sectionsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingJobTitle(null);
    setFormData({
      name: "",
      description: "",
      departmentId: "",
      sectionId: "",
    });
    setShowModal(true);
  };

  const handleEdit = (jobTitle: JobTitle) => {
    setEditingJobTitle(jobTitle);
    setFormData({
      name: jobTitle.name,
      description: jobTitle.description || "",
      departmentId: jobTitle.departmentId || "",
      sectionId: jobTitle.sectionId || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this job title? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await mockApi.deleteJobTitle(id);
      showToast("Job title deleted successfully", "success");
      loadData();
    } catch (error) {
      console.error("Failed to delete job title:", error);
      showToast("Failed to delete job title", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingJobTitle) {
        await mockApi.updateJobTitle(editingJobTitle.id, formData);
        showToast("Job title updated successfully", "success");
      } else {
        await mockApi.createJobTitle(formData);
        showToast("Job title created successfully", "success");
      }
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Failed to save job title:", error);
      showToast("Failed to save job title", "error");
    }
  };

  const handleViewAssignments = async (jobTitle: JobTitle) => {
    setSelectedJobTitle(jobTitle);
    setShowAssignments(true);
  };

  const handleAssignToSection = async (sectionId: string) => {
    if (!selectedJobTitle) return;
    try {
      await mockApi.assignJobTitleToSection(selectedJobTitle.id, sectionId);
      showToast("Job title assigned to section successfully", "success");
      loadData();
    } catch (error) {
      console.error("Failed to assign job title:", error);
      showToast("Failed to assign job title", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Job Titles</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage job titles and assign them to departments and sections
          </p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Job Title
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
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobTitles.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No job titles found. Create your first job title.
                  </td>
                </tr>
              ) : (
                jobTitles.map((jobTitle) => {
                  const department = departments.find(
                    (d) => d.id === jobTitle.departmentId
                  );
                  const section = sections.find(
                    (s) => s.id === jobTitle.sectionId
                  );
                  return (
                    <tr key={jobTitle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {jobTitle.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {jobTitle.description || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {department?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {section?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewAssignments(jobTitle)}
                            className="text-blue-600 hover:text-blue-900"
                            title="View/Edit Assignments"
                          >
                            <Squares2X2Icon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(jobTitle)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(jobTitle.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
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
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingJobTitle ? "Edit Job Title" : "Create Job Title"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <select
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section (for section-specific job titles)
                  </label>
                  <select
                    value={formData.sectionId}
                    onChange={(e) =>
                      setFormData({ ...formData, sectionId: e.target.value })
                    }
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">-- Global (No Section) --</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                  {editingJobTitle ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments Modal */}
      {showAssignments && selectedJobTitle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Assign "{selectedJobTitle.name}" to Sections
            </h3>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select sections where this job title should be available:
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {sections.map((section) => (
                  <label
                    key={section.id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleAssignToSection(section.id);
                        }
                      }}
                    />
                    <span className="ml-3 text-sm text-gray-900">
                      {section.name}
                    </span>
                  </label>
                ))}
              </div>
              <div className="flex items-center justify-end pt-4">
                <button
                  onClick={() => {
                    setShowAssignments(false);
                    setSelectedJobTitle(null);
                  }}
                  className="btn btn-secondary"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobTitlesManagement;
