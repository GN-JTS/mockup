import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { UserRole, RoleDisplayNames } from "@/utils/constants";
import {
  HomeIcon,
  CalendarIcon,
  AcademicCapIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClipboardDocumentCheckIcon,
  TableCellsIcon,
  BellIcon,
  UserGroupIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const menuItems = [
    {
      icon: HomeIcon,
      label: "Dashboard",
      path: "/",
      roles: Object.values(UserRole),
    },
    {
      icon: AcademicCapIcon,
      label: "Training Requirements",
      path: "/requirements",
      roles: Object.values(UserRole),
    },
    {
      icon: CalendarIcon,
      label: "Appointments",
      path: "/appointments",
      roles: [UserRole.EMPLOYEE, UserRole.MENTOR, UserRole.EVALUATOR],
    },
    {
      icon: AcademicCapIcon,
      label: "Certificates",
      path: "/certificates",
      roles: [UserRole.EMPLOYEE],
    },
    {
      icon: ChartBarIcon,
      label: "Evaluations",
      path: "/evaluations",
      roles: [UserRole.MENTOR, UserRole.EVALUATOR],
    },
    // Manager-specific navigation
    {
      icon: UserGroupIcon,
      label: "Employees",
      path: "/manager",
      roles: [UserRole.MANAGER],
    },
    {
      icon: BellIcon,
      label: "Approvals",
      path: "/manager/approvals",
      roles: [UserRole.MANAGER],
    },
    {
      icon: Cog6ToothIcon,
      label: "Role Assignments",
      path: "/manager/roles",
      roles: [UserRole.MANAGER],
    },
    {
      icon: ChartBarIcon,
      label: "Analytics",
      path: "/manager/analytics",
      roles: [UserRole.MANAGER],
    },
    {
      icon: TableCellsIcon,
      label: "Promotion Matrix",
      path: "/admin/promotion-requirements",
      roles: [UserRole.MANAGER],
    },
    {
      icon: UsersIcon,
      label: "Users",
      path: "/users",
      roles: [UserRole.ADMIN, UserRole.UPPER_MANAGER],
    },
    {
      icon: ClipboardDocumentCheckIcon,
      label: "Tasks",
      path: "/admin/tasks",
      roles: [UserRole.ADMIN, UserRole.UPPER_MANAGER],
    },
    {
      icon: Squares2X2Icon,
      label: "Company Structure",
      path: "/admin/company-structure",
      roles: [UserRole.ADMIN, UserRole.UPPER_MANAGER],
    },
    {
      icon: TableCellsIcon,
      label: "Promotion Requirements",
      path: "/admin/promotion-requirements",
      roles: [UserRole.ADMIN, UserRole.UPPER_MANAGER],
    },
    {
      icon: Cog6ToothIcon,
      label: "Settings",
      path: "/settings",
      roles: [UserRole.ADMIN, UserRole.UPPER_MANAGER],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-600">JTS System</h1>
        <p className="text-sm text-gray-600 mt-1">
          {RoleDisplayNames[user.role]}
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-primary-100 text-primary-700 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5 mr-3" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
