import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
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
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
  BellIcon,
  AcademicCapIcon,
  CogIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ManagerDashboard() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useNotifications();

  // State
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Keep all users for lookups
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
  const [filterStatus, setFilterStatus] = useState("");

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "overview" | "approvals" | "roles" | "analytics"
  >("overview");

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      console.log("⏳ Waiting for authentication to load...");
      return;
    }

    // If no user after auth loads, redirect to login
    if (!currentUser) {
      console.error("❌ CRITICAL: currentUser is null/undefined!");
      console.log("User not logged in. Redirecting to login page...");
      console.log("Please login as: emily.manager@jts.com");
      navigate("/login");
      return;
    }

    // User is logged in, load dashboard data
    console.log("✅ User authenticated:", currentUser.name, currentUser.role);
    loadData();
  }, [currentUser, authLoading, navigate]);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log("=".repeat(60));
      console.log("🔵 MANAGER DASHBOARD - Loading Data...");
      console.log("=".repeat(60));
      console.log("📊 Current User:", currentUser);
      console.log(
        "🏢 Manager Department:",
        currentUser?.departmentId || "NOT SET"
      );
      console.log("👤 Manager Role:", currentUser?.role);

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

      console.log("📦 Raw Data Loaded:");
      console.log(`  - Users: ${usersData.length}`);
      console.log(`  - Job Titles: ${jobTitlesData.length}`);
      console.log(`  - Grades: ${gradesData.length}`);
      console.log(`  - Departments: ${departmentsData.length}`);
      console.log(`  - Sections: ${sectionsData.length}`);
      console.log(`  - Promotions: ${promotionsData.length}`);
      console.log(`  - Progress Records: ${progressData.length}`);

      // Filter employees under manager's department
      const managedEmployees = usersData.filter(
        (u) =>
          u.departmentId === currentUser?.departmentId &&
          u.role === UserRole.EMPLOYEE
      );

      console.log("🔍 Filtering Employees:");
      console.log(`  - Manager Department ID: ${currentUser?.departmentId}`);
      console.log(
        `  - Total Employees in System: ${
          usersData.filter((u) => u.role === UserRole.EMPLOYEE).length
        }`
      );
      console.log(
        `  - Employees in Manager's Department: ${managedEmployees.length}`
      );

      if (managedEmployees.length > 0) {
        console.log("👥 Sample Managed Employees:");
        managedEmployees.slice(0, 3).forEach((emp) => {
          console.log(
            `  - ${emp.name} (${emp.id}): ${emp.jobTitleId} ${emp.gradeId}`
          );
        });
      } else {
        console.warn("⚠️ NO EMPLOYEES FOUND IN MANAGER'S DEPARTMENT!");
        console.log("🔍 Debugging - All employees by department:");
        const employeesByDept = usersData
          .filter((u) => u.role === UserRole.EMPLOYEE)
          .reduce((acc, emp) => {
            acc[emp.departmentId] = (acc[emp.departmentId] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
        console.log(employeesByDept);
      }

      // Analyze promotions
      const pendingCount = promotionsData.filter(
        (p) =>
          p.status === "pending_approval" &&
          managedEmployees.some((e) => e.id === p.employeeId)
      ).length;

      console.log("📋 Promotion Analysis:");
      console.log(`  - Total Promotions: ${promotionsData.length}`);
      console.log(`  - Pending Approval: ${pendingCount}`);
      console.log(
        `  - Assigned: ${
          promotionsData.filter((p) => p.status === "assigned").length
        }`
      );
      console.log(
        `  - In Progress: ${
          promotionsData.filter((p) => p.status === "in_progress").length
        }`
      );
      console.log(
        `  - Rejected: ${
          promotionsData.filter((p) => p.status === "rejected").length
        }`
      );

      setEmployees(managedEmployees);
      setAllUsers(usersData); // Save all users for lookups
      setJobTitles(jobTitlesData);
      setGrades(gradesData);
      setDepartments(departmentsData);
      setSections(sectionsData);
      setPromotions(promotionsData);
      setAllProgress(progressData);

      console.log("=".repeat(60));
      console.log(
        `✅ MANAGER DASHBOARD LOADED: ${managedEmployees.length} employees, ${pendingCount} pending approvals`
      );
      console.log("=".repeat(60));
    } catch (error) {
      console.error("❌ Failed to load manager data:", error);
      console.error("Error details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get employee details
  const getEmployeeDetails = (employee: User) => {
    const jobTitle = jobTitles.find((jt) => jt.id === employee.jobTitleId);
    const grade = grades.find((g) => g.id === employee.gradeId);
    const section = sections.find((s) => s.id === employee.sectionId);
    const activePromotion = promotions.find(
      (p) =>
        p.employeeId === employee.id &&
        (p.status === "pending_approval" ||
          p.status === "assigned" ||
          p.status === "in_progress" ||
          p.status === "rejected")
    );

    let progressStats = { total: 0, mastered: 0, percentage: 0 };
    let status = "On Track";

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

      // Determine status
      if (activePromotion.status === "pending_approval") {
        status = "Pending Approval";
      } else if (activePromotion.status === "rejected") {
        status = "Rejected";
      } else if (progressStats.percentage === 0) {
        status = "Not Started";
      } else if (progressStats.percentage < 50) {
        status = "Behind";
      } else if (progressStats.percentage < 100) {
        status = "On Track";
      } else {
        status = "Ready for Completion";
      }
    }

    return {
      jobTitle,
      grade,
      section,
      activePromotion,
      progressStats,
      status,
    };
  };

  // Handler functions for approval/rejection
  const handleApprovePromotion = async (promotionId: string) => {
    if (!currentUser) {
      showToast("You must be logged in to approve promotions", "error");
      return;
    }

    try {
      const promotion = promotions.find((p) => p.id === promotionId);
      if (!promotion) {
        showToast("Promotion not found", "error");
        return;
      }

      const employee = employees.find((e) => e.id === promotion.employeeId);
      const trainingManager = allUsers.find(
        (u) => u.id === promotion.assignedBy
      );

      await mockApi.approvePromotion(promotionId, currentUser.id);

      // Send notification to employee
      if (employee) {
        await mockApi.createNotification({
          id: `notif-${Date.now()}-${Math.random()}`,
          userId: employee.id,
          type: "promotion_approved",
          title: "Promotion Approved by Manager",
          message: `Your manager has approved your promotion request. Please review and accept it in your dashboard.`,
          relatedId: promotionId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      // Send notification to training manager
      if (trainingManager) {
        await mockApi.createNotification({
          id: `notif-${Date.now()}-${Math.random()}-tm`,
          userId: trainingManager.id,
          type: "promotion_approved",
          title: "Promotion Approved",
          message: `Manager ${
            currentUser.name
          } has approved the promotion for ${employee?.name || "employee"}.`,
          relatedId: promotionId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      showToast("Promotion approved successfully!", "success");
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error("Failed to approve promotion:", error);
      showToast("Failed to approve promotion", "error");
    }
  };

  const handleRejectPromotion = async (promotionId: string) => {
    if (!currentUser) {
      showToast("You must be logged in to reject promotions", "error");
      return;
    }

    const reason = window.prompt(
      "Please provide a reason for rejecting this promotion:"
    );
    if (reason === null) return; // User cancelled

    if (!reason || reason.trim() === "") {
      showToast("Rejection reason is required", "error");
      return;
    }

    try {
      const promotion = promotions.find((p) => p.id === promotionId);
      if (!promotion) {
        showToast("Promotion not found", "error");
        return;
      }

      const employee = employees.find((e) => e.id === promotion.employeeId);
      const trainingManager = allUsers.find(
        (u) => u.id === promotion.assignedBy
      );

      await mockApi.rejectPromotion(promotionId, currentUser.id, reason);

      // Send notification to employee
      if (employee) {
        await mockApi.createNotification({
          id: `notif-${Date.now()}-${Math.random()}`,
          userId: employee.id,
          type: "promotion_rejected",
          title: "Promotion Rejected by Manager",
          message: `Your promotion request has been rejected. Reason: ${reason}`,
          relatedId: promotionId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      // Send notification to training manager
      if (trainingManager) {
        await mockApi.createNotification({
          id: `notif-${Date.now()}-${Math.random()}-tm`,
          userId: trainingManager.id,
          type: "promotion_rejected",
          title: "Promotion Rejected",
          message: `Manager ${
            currentUser.name
          } has rejected the promotion for ${
            employee?.name || "employee"
          }. Reason: ${reason}`,
          relatedId: promotionId,
          createdAt: new Date().toISOString(),
          read: false,
        });
      }

      showToast("Promotion rejected", "info");
      // Reload data to reflect changes
      await loadData();
    } catch (error) {
      console.error("Failed to reject promotion:", error);
      showToast("Failed to reject promotion", "error");
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const details = getEmployeeDetails(emp);

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

    // Status filter
    if (filterStatus && details.status !== filterStatus) {
      return false;
    }

    return true;
  });

  // Statistics
  const pendingApprovalCount = promotions.filter(
    (p) =>
      p.status === "pending_approval" &&
      employees.some((e) => e.id === p.employeeId)
  ).length;

  const activePromotionsCount = promotions.filter(
    (p) =>
      (p.status === "assigned" || p.status === "in_progress") &&
      employees.some((e) => e.id === p.employeeId)
  ).length;

  const completedThisMonthCount = promotions.filter((p) => {
    if (p.status !== "completed" || !p.completedAt) return false;
    if (!employees.some((e) => e.id === p.employeeId)) return false;
    const completedDate = new Date(p.completedAt);
    const now = new Date();
    return (
      completedDate.getMonth() === now.getMonth() &&
      completedDate.getFullYear() === now.getFullYear()
    );
  }).length;

  const rejectedCount = promotions.filter(
    (p) =>
      p.status === "rejected" && employees.some((e) => e.id === p.employeeId)
  ).length;

  // Show loading while auth is initializing
  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600">
          {authLoading
            ? "Checking authentication..."
            : "Loading Manager Dashboard..."}
        </p>
        <p className="text-sm text-gray-500">
          Check console for detailed loading information
        </p>
      </div>
    );
  }

  // If auth finished but no user, we're redirecting (don't show error screen)
  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p className="text-gray-600">Redirecting to login...</p>
      </div>
    );
  }

  // Emergency check: If no employees and not loading, something is wrong
  if (!loading && employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-6 p-8">
        <div className="text-center">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Data Loaded
          </h2>
          <p className="text-gray-600 mb-4">
            The Manager Dashboard couldn't load any employee data.
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 max-w-2xl">
          <h3 className="font-semibold text-yellow-900 mb-3">
            🔍 Diagnostic Information
          </h3>
          <div className="space-y-2 text-sm">
            <p className="text-yellow-800">
              <strong>Current User:</strong>{" "}
              {currentUser ? currentUser.name : "NOT LOGGED IN"}
            </p>
            <p className="text-yellow-800">
              <strong>Department ID:</strong>{" "}
              {currentUser?.departmentId || "MISSING"}
            </p>
            <p className="text-yellow-800">
              <strong>Role:</strong> {currentUser?.role || "MISSING"}
            </p>
            <p className="text-yellow-800">
              <strong>Employees Found:</strong> {employees.length}
            </p>
            <p className="text-yellow-800">
              <strong>Promotions Found:</strong> {promotions.length}
            </p>
          </div>
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 max-w-2xl">
          <h3 className="font-semibold text-blue-900 mb-3">
            🛠️ Troubleshooting Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
            <li>Open browser console (F12) and check for errors</li>
            <li>
              Look for the detailed debug output that starts with "🔵 MANAGER
              DASHBOARD - Loading Data..."
            </li>
            <li>
              Verify you're logged in as Emily Manager (emily.manager@jts.com)
            </li>
            <li>Check that mock data files exist and are loading correctly</li>
            <li>Refresh the page and check console logs again</li>
          </ol>
        </div>

        <button
          onClick={() => {
            console.log("🔄 Manual reload triggered");
            loadData();
          }}
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Try Reload Data
        </button>

        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card bg-linear-to-r from-blue-600 to-indigo-700 text-white">
        <h1 className="text-3xl font-bold mb-2">Manager Dashboard</h1>
        <p className="text-blue-100">
          Oversee employees, approve promotions, and manage team development
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-sm">Total Employees</p>
            <p className="text-2xl font-bold">{employees.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-sm">⏳ Pending Approval</p>
            <p className="text-2xl font-bold">{pendingApprovalCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-sm">Active Promotions</p>
            <p className="text-2xl font-bold">{activePromotionsCount}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-blue-100 text-sm">Completed This Month</p>
            <p className="text-2xl font-bold">{completedThisMonthCount}</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="flex gap-2 border-b border-gray-200 -mx-6 -mt-6 px-6">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <UserGroupIcon className="h-5 w-5 inline mr-2" />
            Employee Overview
          </button>
          <button
            onClick={() => setActiveTab("approvals")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors relative ${
              activeTab === "approvals"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <BellIcon className="h-5 w-5 inline mr-2" />
            Requests & Approvals
            {pendingApprovalCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {pendingApprovalCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "roles"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <CogIcon className="h-5 w-5 inline mr-2" />
            Role Assignments
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === "analytics"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <ChartBarIcon className="h-5 w-5 inline mr-2" />
            Analytics
          </button>
        </div>
      </div>

      {/* Employee Overview Tab */}
      {activeTab === "overview" && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Employee Overview
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <FunnelIcon className="h-5 w-5" />
                Filters
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>

            <select
              value={filterSection}
              onChange={(e) => setFilterSection(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
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

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="On Track">On Track</option>
              <option value="Behind">Behind</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Not Started">Not Started</option>
              <option value="Ready for Completion">Ready for Completion</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          {/* Employee Table */}
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <UserGroupIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">No employees found</p>
              {searchTerm ||
              filterDepartment ||
              filterSection ||
              filterJobTitle ||
              filterGrade ||
              filterStatus ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-2">
                    Try adjusting your filters
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterDepartment("");
                      setFilterSection("");
                      setFilterJobTitle("");
                      setFilterGrade("");
                      setFilterStatus("");
                    }}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <div className="mt-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-500 mb-2">
                    No employees found in your department
                  </p>
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-left text-xs">
                    <p className="text-yellow-800 mb-1">
                      <strong>Debug Info:</strong>
                    </p>
                    <p className="text-yellow-700">
                      Department: {currentUser?.departmentId || "NOT SET"}
                    </p>
                    <p className="text-yellow-700">
                      Total Employees Loaded: {employees.length}
                    </p>
                    <p className="text-yellow-700 mt-2">
                      Check browser console for details
                    </p>
                  </div>
                </div>
              )}
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
                      Section
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Active Promotion
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
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
                            {details.section?.name || "N/A"}
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              details.status === "On Track"
                                ? "bg-green-100 text-green-800"
                                : details.status === "Behind"
                                ? "bg-red-100 text-red-800"
                                : details.status === "Pending Approval"
                                ? "bg-purple-100 text-purple-800"
                                : details.status === "Rejected"
                                ? "bg-red-100 text-red-800"
                                : details.status === "Ready for Completion"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {details.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() =>
                              navigate(`/manager/employee/${employee.id}`)
                            }
                            className="text-indigo-600 hover:text-indigo-900"
                            title="View Details"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Requests & Approvals Tab */}
      {activeTab === "approvals" && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Promotion Approval Requests
          </h2>

          {(() => {
            const pendingPromotions = promotions.filter(
              (p) =>
                p.status === "pending_approval" &&
                employees.some((e) => e.id === p.employeeId)
            );

            console.log("🔔 Approval Tab Debug:");
            console.log(`  - Total Promotions: ${promotions.length}`);
            console.log(
              `  - Pending Promotions Found: ${pendingPromotions.length}`
            );
            pendingPromotions.forEach((p) => {
              const emp = employees.find((e) => e.id === p.employeeId);
              console.log(`  - Pending: ${emp?.name} (${p.id})`);
            });

            if (pendingPromotions.length === 0) {
              return (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <BellIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-600">No pending approval requests</p>
                  <p className="text-sm text-gray-500 mt-2">
                    All promotion requests have been processed
                  </p>
                </div>
              );
            }

            return (
              <div className="space-y-4">
                {pendingPromotions.map((promotion) => {
                  const employee = employees.find(
                    (e) => e.id === promotion.employeeId
                  );
                  if (!employee) return null;

                  const currentJobTitle = jobTitles.find(
                    (jt) => jt.id === employee.jobTitleId
                  );
                  const currentGrade = grades.find(
                    (g) => g.id === employee.gradeId
                  );
                  const targetJobTitle = jobTitles.find(
                    (jt) => jt.id === promotion.targetJobTitleId
                  );
                  const targetGrade = grades.find(
                    (g) => g.id === promotion.targetGradeId
                  );
                  const trainingManager = allUsers.find(
                    (u) => u.id === promotion.assignedBy
                  );

                  return (
                    <div
                      key={promotion.id}
                      className="border border-gray-200 rounded-lg p-6 hover:border-primary-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={
                                employee.avatar ||
                                `https://ui-avatars.com/api/?name=${employee.name}&background=random`
                              }
                              alt={employee.name}
                              className="h-12 w-12 rounded-full"
                            />
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {employee.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Requested by: {trainingManager?.name || "N/A"}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Current Position
                              </p>
                              <p className="text-sm text-gray-900">
                                {currentJobTitle?.name} - {currentGrade?.name}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Promotion To
                              </p>
                              <p className="text-sm text-gray-900 font-semibold text-primary-600">
                                {targetJobTitle?.name} - {targetGrade?.name}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-sm text-gray-600">
                              Requested on:{" "}
                              {new Date(
                                promotion.assignedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-6">
                          <button
                            onClick={() => handleApprovePromotion(promotion.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <CheckIcon className="h-5 w-5" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPromotion(promotion.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                          >
                            <XMarkIcon className="h-5 w-5" />
                            Reject
                          </button>
                          <button
                            onClick={() =>
                              navigate(`/manager/employee/${employee.id}`)
                            }
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <EyeIcon className="h-5 w-5" />
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* Role Assignments Tab */}
      {activeTab === "roles" && (
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Role Assignments
          </h2>
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CogIcon className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">
              Role assignment management coming soon
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Assign Training Managers, Mentors, and Evaluators to departments,
              sections, and grades
            </p>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Department Analytics
            </h2>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 font-medium">
                  Total Employees
                </p>
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {employees.length}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-600 font-medium">
                  Active Promotions
                </p>
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {activePromotionsCount}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-purple-600 font-medium">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {pendingApprovalCount}
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-600 font-medium">
                  Completed This Month
                </p>
                <p className="text-3xl font-bold text-yellow-900 mt-1">
                  {completedThisMonthCount}
                </p>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Employees by Grade */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Employees by Grade
                </h3>
                <div className="space-y-3">
                  {grades.map((grade) => {
                    const count = employees.filter(
                      (e) => e.gradeId === grade.id
                    ).length;
                    const percentage =
                      employees.length > 0
                        ? Math.round((count / employees.length) * 100)
                        : 0;
                    return (
                      <div key={grade.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{grade.name}</span>
                          <span className="text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Employees by Job Title */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">
                  Employees by Job Title
                </h3>
                <div className="space-y-3">
                  {jobTitles.map((jobTitle) => {
                    const count = employees.filter(
                      (e) => e.jobTitleId === jobTitle.id
                    ).length;
                    const percentage =
                      employees.length > 0
                        ? Math.round((count / employees.length) * 100)
                        : 0;
                    return (
                      <div key={jobTitle.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{jobTitle.name}</span>
                          <span className="text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
