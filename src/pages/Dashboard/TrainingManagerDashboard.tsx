import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import {
  User,
  JobTitle,
  Grade,
  Department,
  Section,
  EmployeePromotion,
  EmployeeProgress,
} from "@/types";
import {
  UserRole,
  EvaluationStatus,
  PromotionStatusColors,
  PromotionStatusNames,
} from "@/utils/constants";
import {
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

const TrainingManagerDashboard = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // Data
  const [employees, setEmployees] = useState<User[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [promotions, setPromotions] = useState<EmployeePromotion[]>([]);
  const [allProgress, setAllProgress] = useState<EmployeeProgress[]>([]);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [filterJobTitle, setFilterJobTitle] = useState("");
  const [filterGrade, setFilterGrade] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    if (!currentUser) return;

    try {
      const [
        usersData,
        jobTitlesData,
        gradesData,
        departmentsData,
        sectionsData,
        promotionsData,
        progressData,
      ] = await Promise.all([
        mockApi.getUsers(),
        mockApi.getJobTitles(),
        mockApi.getGrades(),
        mockApi.getDepartments(),
        mockApi.getSections(),
        mockApi.getEmployeePromotions(),
        mockApi.getEmployeeProgress(),
      ]);

      // Filter employees by training manager's scope (department & section)
      const scopedEmployees = usersData.filter(
        (u) =>
          u.role === UserRole.EMPLOYEE &&
          u.departmentId === currentUser.departmentId &&
          u.sectionId === currentUser.sectionId
      );

      setEmployees(scopedEmployees);
      setJobTitles(jobTitlesData);
      setGrades(gradesData.sort((a, b) => a.name.localeCompare(b.name)));
      setDepartments(departmentsData);
      setSections(sectionsData);
      setPromotions(promotionsData);
      setAllProgress(progressData);

      // Debug logging
      console.log("=== TRAINING MANAGER DASHBOARD DEBUG ===");
      console.log("Scoped Employees:", scopedEmployees.length);
      console.log("Job Titles:", jobTitlesData.length);
      console.log("Grades:", gradesData.length);
      console.log("Sample Employee:", scopedEmployees[0]);
      console.log(
        "Sample Job Title Match:",
        jobTitlesData.find((jt) => jt.id === scopedEmployees[0]?.jobTitleId)
      );
      console.log(
        "Sample Grade Match:",
        gradesData.find((g) => g.id === scopedEmployees[0]?.gradeId)
      );
      console.log("========================================");
    } catch (error) {
      console.error("Failed to load training manager data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get employee details
  const getEmployeeDetails = (employee: User) => {
    const jobTitle = jobTitles.find((jt) => jt.id === employee.jobTitleId);
    const grade = grades.find((g) => g.id === employee.gradeId);
    // Include pending_approval, pending_employee_approval, rejected, assigned, and in_progress
    const activePromotion = promotions.find(
      (p) =>
        p.employeeId === employee.id &&
        (p.status === "pending_approval" ||
          p.status === "pending_employee_approval" ||
          p.status === "assigned" ||
          p.status === "in_progress" ||
          p.status === "rejected")
    );

    let progressStats = { total: 0, mastered: 0, percentage: 0 };

    if (activePromotion) {
      const empProgress = allProgress.filter(
        (p) => p.promotionId === activePromotion.id
      );
      progressStats.total = empProgress.length;
      progressStats.mastered = empProgress.filter(
        (p) =>
          p.mentorStatus === EvaluationStatus.MASTER &&
          p.evaluatorStatus === EvaluationStatus.MASTER
      ).length;
      progressStats.percentage =
        progressStats.total > 0
          ? Math.round((progressStats.mastered / progressStats.total) * 100)
          : 0;
    }

    return {
      jobTitle,
      grade,
      activePromotion,
      progressStats,
    };
  };

  // Apply filters
  const filteredEmployees = employees.filter((emp) => {
    getEmployeeDetails(emp); // Get details for filtering logic

    // Search filter
    if (
      searchTerm &&
      !emp.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    // Department filter
    if (filterDepartment && emp.departmentId !== filterDepartment) {
      return false;
    }

    // Section filter
    if (filterSection && emp.sectionId !== filterSection) {
      return false;
    }

    // Job Title filter
    if (filterJobTitle && emp.jobTitleId !== filterJobTitle) {
      return false;
    }

    // Grade filter
    if (filterGrade && emp.gradeId !== filterGrade) {
      return false;
    }

    return true;
  });

  // Stats
  const pendingApprovalCount = promotions.filter(
    (p) =>
      (p.status === "pending_approval" ||
        p.status === "pending_employee_approval") &&
      employees.some((e) => e.id === p.employeeId)
  ).length;

  const activePromotionsCount = promotions.filter(
    (p) =>
      (p.status === "assigned" || p.status === "in_progress") &&
      employees.some((e) => e.id === p.employeeId)
  ).length;

  const completedPromotionsCount = promotions.filter(
    (p) =>
      p.status === "completed" && employees.some((e) => e.id === p.employeeId)
  ).length;

  const rejectedCount = promotions.filter(
    (p) =>
      p.status === "rejected" && employees.some((e) => e.id === p.employeeId)
  ).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-linear-to-r from-purple-600 to-indigo-700 text-white">
        <h1 className="text-3xl font-bold mb-2">Training Manager Dashboard</h1>
        <p className="text-purple-100">
          Manage employee promotions and track training progress
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-purple-100 text-sm">Total Employees</p>
            <p className="text-2xl font-bold">{employees.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-purple-100 text-sm">⏳ Pending Approval</p>
            <p className="text-2xl font-bold">{pendingApprovalCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-purple-100 text-sm">Active Promotions</p>
            <p className="text-2xl font-bold">{activePromotionsCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-purple-100 text-sm">Completed</p>
            <p className="text-2xl font-bold">{completedPromotionsCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-purple-100 text-sm">❌ Rejected</p>
            <p className="text-2xl font-bold">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserGroupIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Under My Scope</p>
              <p className="text-2xl font-bold text-gray-900">
                {employees.length}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {activePromotionsCount}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {completedPromotionsCount}
              </p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <AcademicCapIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Needing Assignment</p>
              <p className="text-2xl font-bold text-purple-600">
                {
                  employees.filter(
                    (e) =>
                      !promotions.some(
                        (p) =>
                          p.employeeId === e.id &&
                          (p.status === "assigned" ||
                            p.status === "in_progress")
                      )
                  ).length
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">All Employees</h2>
          <button
            onClick={() => navigate("/training-manager/employees")}
            className="text-primary-600 hover:text-primary-900 text-sm font-medium"
          >
            View All →
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Departments</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Sections</option>
            {sections
              .filter(
                (s) => !filterDepartment || s.departmentId === filterDepartment
              )
              .map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
          </select>
          <select
            value={filterJobTitle}
            onChange={(e) => setFilterJobTitle(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Job Titles</option>
            {jobTitles.map((jt) => (
              <option key={jt.id} value={jt.id}>
                {jt.name}
              </option>
            ))}
          </select>
          <select
            value={filterGrade}
            onChange={(e) => setFilterGrade(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="">All Grades</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Employee Table */}
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Active Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEmployees.map((employee) => {
                  const details = getEmployeeDetails(employee);
                  return (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={
                              employee.avatar ||
                              `https://ui-avatars.com/api/?name=${employee.name}&background=random`
                            }
                            alt={employee.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {details.jobTitle?.name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          Grade: {details.grade?.name || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {details.activePromotion ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {
                                jobTitles.find(
                                  (jt) =>
                                    jt.id ===
                                    details.activePromotion?.targetJobTitleId
                                )?.name
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              Target:{" "}
                              {
                                grades.find(
                                  (g) =>
                                    g.id ===
                                    details.activePromotion?.targetGradeId
                                )?.name
                              }
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {details.activePromotion ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              PromotionStatusColors[
                                details.activePromotion
                                  .status as keyof typeof PromotionStatusColors
                              ]
                            }`}
                          >
                            {details.activePromotion.status ===
                              "pending_approval" && "⏳ "}
                            {details.activePromotion.status ===
                              "pending_employee_approval" && "👤 "}
                            {details.activePromotion.status === "rejected" &&
                              "❌ "}
                            {details.activePromotion.status === "assigned" &&
                              "✅ "}
                            {details.activePromotion.status === "in_progress" &&
                              "🔄 "}
                            {details.activePromotion.status === "completed" &&
                              "✓ "}
                            {
                              PromotionStatusNames[
                                details.activePromotion
                                  .status as keyof typeof PromotionStatusNames
                              ]
                            }
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {details.activePromotion ? (
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-600 h-2 rounded-full"
                                style={{
                                  width: `${details.progressStats.percentage}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-600">
                              {details.progressStats.percentage}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {details.activePromotion ? (
                            <button
                              onClick={() =>
                                navigate(
                                  `/training-manager/progress/${employee.id}`
                                )
                              }
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Progress"
                            >
                              <EyeIcon className="h-5 w-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                navigate(
                                  `/training-manager/assign/${employee.id}`
                                )
                              }
                              className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                            >
                              <PlusIcon className="h-4 w-4" />
                              Assign
                            </button>
                          )}
                          <button
                            onClick={() =>
                              navigate(
                                `/training-manager/history/${employee.id}`
                              )
                            }
                            className="text-gray-600 hover:text-gray-900"
                            title="View History"
                          >
                            <ChartBarIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/training-manager/employees")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <UserGroupIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Manage All Employees</p>
            <p className="text-sm text-gray-500 mt-1">
              View full list with advanced filtering
            </p>
          </button>
          <button
            onClick={() => navigate("/training-manager/assignments")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <AcademicCapIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Active Assignments</p>
            <p className="text-sm text-gray-500 mt-1">
              Track all ongoing promotion programs
            </p>
          </button>
          <button
            onClick={() => navigate("/admin/promotion-requirements")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
          >
            <ChartBarIcon className="h-8 w-8 text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Configure Requirements</p>
            <p className="text-sm text-gray-500 mt-1">
              Manage promotion requirement matrix
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingManagerDashboard;
