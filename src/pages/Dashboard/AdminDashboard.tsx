import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "@/mock/services/mockApi";
import { User, JobTitle, Grade, Task, PromotionRequirement } from "@/types";
import { RoleDisplayNames, UserRole } from "@/utils/constants";
import {
  UsersIcon,
  ClipboardDocumentListIcon,
  BriefcaseIcon,
  TrophyIcon,
  TableCellsIcon,
  BuildingOfficeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [promotionRequirements, setPromotionRequirements] = useState<
    PromotionRequirement[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          usersData,
          jobTitlesData,
          gradesData,
          tasksData,
          requirementsData,
        ] = await Promise.all([
          mockApi.getUsers(),
          mockApi.getJobTitles(),
          mockApi.getGrades(),
          mockApi.getTasks(),
          mockApi.getPromotionRequirements(),
        ]);
        setUsers(usersData);
        setJobTitles(jobTitlesData);
        setGrades(gradesData);
        setTasks(tasksData);
        setPromotionRequirements(requirementsData);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Total Users",
      count: users.length,
      icon: UsersIcon,
      color: "primary",
      path: "/users",
    },
    {
      label: "Job Titles",
      count: jobTitles.length,
      icon: BriefcaseIcon,
      color: "blue",
      path: "/admin/job-titles",
    },
    {
      label: "Grades",
      count: grades.length,
      icon: TrophyIcon,
      color: "green",
      path: "/admin/grades",
    },
    {
      label: "Tasks",
      count: tasks.length,
      icon: ClipboardDocumentListIcon,
      color: "purple",
      path: "/admin/tasks",
    },
    {
      label: "Promotion Requirements",
      count: promotionRequirements.length,
      icon: TableCellsIcon,
      color: "orange",
      path: "/admin/promotion-requirements",
    },
    {
      label: "Departments",
      count: 3,
      icon: BuildingOfficeIcon,
      color: "yellow",
      path: "/admin/departments",
    },
    {
      label: "Company Structure",
      count: 0,
      icon: Squares2X2Icon,
      color: "primary",
      path: "/admin/company-structure",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      primary: { bg: "bg-primary-100", text: "text-primary-600" },
      blue: { bg: "bg-blue-100", text: "text-blue-600" },
      green: { bg: "bg-green-100", text: "text-green-600" },
      purple: { bg: "bg-purple-100", text: "text-purple-600" },
      orange: { bg: "bg-orange-100", text: "text-orange-600" },
      yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    };
    return colors[color] || colors.primary;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">
          System overview and configuration management
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const colors = getColorClasses(card.color);
          return (
            <button
              key={card.label}
              onClick={() => navigate(card.path)}
              className="card hover:shadow-lg transition-shadow text-left cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {card.count}
                  </p>
                  <p className={`text-sm mt-2 ${colors.text}`}>Manage →</p>
                </div>
                <div
                  className={`h-14 w-14 ${colors.bg} rounded-lg flex items-center justify-center`}
                >
                  <card.icon className={`h-7 w-7 ${colors.text}`} />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* User Distribution */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          User Distribution by Role
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(UserRole).map((role) => (
            <div
              key={role}
              className="p-4 border border-gray-200 rounded-lg flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <p className="font-medium text-gray-700">
                {RoleDisplayNames[role]}
              </p>
              <span className="text-xl font-bold text-primary-600">
                {users.filter((u) => u.role === role).length}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Titles Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Job Titles</h2>
            <button
              onClick={() => navigate("/admin/job-titles")}
              className="btn btn-secondary text-sm"
            >
              Manage
            </button>
          </div>
          <div className="space-y-2">
            {jobTitles.slice(0, 5).map((jobTitle) => (
              <div
                key={jobTitle.id}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <h4 className="font-medium text-gray-900">{jobTitle.name}</h4>
                  <p className="text-sm text-gray-600">
                    {jobTitle.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Promotion Requirements Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Promotion Requirements
            </h2>
            <button
              onClick={() => navigate("/admin/promotion-requirements")}
              className="btn btn-secondary text-sm"
            >
              Configure
            </button>
          </div>
          <div className="space-y-2">
            {promotionRequirements.slice(0, 5).map((req) => {
              const jobTitle = jobTitles.find((jt) => jt.id === req.jobTitleId);
              const grade = grades.find((g) => g.id === req.gradeId);
              const totalSubtasks = req.required.reduce(
                (sum, r) => sum + r.subtaskIds.length,
                0
              );
              return (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {jobTitle?.name} - {grade?.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {req.required.length} tasks, {totalSubtasks} subtasks
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/admin/job-titles")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-center"
          >
            <BriefcaseIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Add Job Title</p>
          </button>
          <button
            onClick={() => navigate("/admin/grades")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <TrophyIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Add Grade</p>
          </button>
          <button
            onClick={() => navigate("/admin/promotion-requirements")}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-center"
          >
            <TableCellsIcon className="h-8 w-8 mx-auto text-gray-400 mb-2" />
            <p className="font-medium text-gray-700">Configure Requirements</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
