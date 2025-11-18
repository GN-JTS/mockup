import { useState, useEffect } from "react";
import { mockApi } from "@/mock/services/mockApi";
import { Department, Section } from "@/types";
import { useNotifications } from "@/context/NotificationContext";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const DepartmentsManagement = () => {
  const { showToast } = useNotifications();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [formData, setFormData] = useState({
    name: "",
    parentId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [departmentsData, sectionsData] = await Promise.all([
        mockApi.getDepartments(),
        mockApi.getSections(),
      ]);
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
    setEditingDepartment(null);
    setFormData({
      name: "",
      parentId: "",
    });
    setShowModal(true);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      parentId: department.parentId || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    // Check if department has sections
    const departmentSections = sections.filter((s) => s.departmentId === id);
    if (departmentSections.length > 0) {
      showToast(
        `Cannot delete department. It has ${departmentSections.length} section(s) assigned.`,
        "error"
      );
      return;
    }

    if (
      !window.confirm(
        "Are you sure you want to delete this department? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Note: This would need to be implemented in mockApi
      showToast("Delete functionality needs to be implemented in API", "info");
      // await mockApi.deleteDepartment(id);
      // showToast("Department deleted successfully", "success");
      // loadData();
    } catch (error) {
      console.error("Failed to delete department:", error);
      showToast("Failed to delete department", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Note: These would need to be implemented in mockApi
      if (editingDepartment) {
        showToast(
          "Update functionality needs to be implemented in API",
          "info"
        );
        // await mockApi.updateDepartment(editingDepartment.id, formData);
        // showToast("Department updated successfully", "success");
      } else {
        showToast(
          "Create functionality needs to be implemented in API",
          "info"
        );
        // await mockApi.createDepartment(formData);
        // showToast("Department created successfully", "success");
      }
      // setShowModal(false);
      // loadData();
    } catch (error) {
      console.error("Failed to save department:", error);
      showToast("Failed to save department", "error");
    }
  };

  const getSectionsForDepartment = (departmentId: string) => {
    return sections.filter((s) => s.departmentId === departmentId);
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
          <h2 className="text-xl font-semibold text-gray-900">Departments</h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage departments and assign sections to them
          </p>
        </div>
        <button onClick={handleCreate} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Department
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
                  Sections
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parent Department
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {departments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No departments found. Create your first department.
                  </td>
                </tr>
              ) : (
                departments.map((department) => {
                  const departmentSections = getSectionsForDepartment(
                    department.id
                  );
                  const parentDept = departments.find(
                    (d) => d.id === department.parentId
                  );
                  return (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {department.name}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Squares2X2Icon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-500">
                            {departmentSections.length} section
                            {departmentSections.length !== 1 ? "s" : ""}
                          </span>
                          {departmentSections.length > 0 && (
                            <div className="ml-2 flex flex-wrap gap-1">
                              {departmentSections.map((sec) => (
                                <span
                                  key={sec.id}
                                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {sec.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {parentDept?.name || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(department)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(department.id)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingDepartment ? "Edit Department" : "Create Department"}
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
                  Parent Department (Optional)
                </label>
                <select
                  value={formData.parentId}
                  onChange={(e) =>
                    setFormData({ ...formData, parentId: e.target.value })
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="">-- No Parent --</option>
                  {departments
                    .filter((d) => d.id !== editingDepartment?.id)
                    .map((dept) => (
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
                  {editingDepartment ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsManagement;
