import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import LoginPage from "@/pages/Auth/LoginPage";
import EmployeeDashboard from "@/pages/Dashboard/EmployeeDashboard";
import ManagerDashboard from "@/pages/Dashboard/ManagerDashboard";
import TrainingManagerDashboard from "@/pages/Dashboard/TrainingManagerDashboard";
import MentorDashboard from "@/pages/Dashboard/MentorDashboard";
import EvaluatorDashboard from "@/pages/Dashboard/EvaluatorDashboard";
import AdminDashboard from "@/pages/Dashboard/AdminDashboard";
import AppointmentBooking from "@/pages/Appointments/AppointmentBooking";
import AppointmentManagement from "@/pages/Appointments/AppointmentManagement";
import PromotionEvaluationInterface from "@/pages/Evaluation/PromotionEvaluationInterface";
import RequirementsTreeView from "@/pages/Training/RequirementsTreeView";
import CertificatesList from "@/pages/Certificates/CertificatesList";
import CertificateView from "@/pages/Certificates/CertificateView";
import UserManagement from "@/pages/Admin/UserManagement";
import PromotionProgress from "@/pages/Employee/PromotionProgress";
import TasksManagement from "@/pages/Admin/TasksManagement";
import PromotionRequirementsManagement from "@/pages/Admin/PromotionRequirementsManagement";
import CompanyStructure from "@/pages/Admin/CompanyStructure";
import AssignPromotion from "@/pages/TrainingManager/AssignPromotion";
import EmployeeProgressView from "@/pages/TrainingManager/EmployeeProgressView";
import { UserRole } from "@/utils/constants";

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // Role-based dashboard routing
  const getDashboardComponent = () => {
    switch (user.role) {
      case UserRole.ADMIN:
      case UserRole.UPPER_MANAGER:
        return <AdminDashboard />;
      case UserRole.MANAGER:
        return <ManagerDashboard />;
      case UserRole.TRAINING_MANAGER:
        return <TrainingManagerDashboard />;
      case UserRole.MENTOR:
        return <MentorDashboard />;
      case UserRole.EVALUATOR:
        return <EvaluatorDashboard />;
      case UserRole.EMPLOYEE:
      default:
        return <EmployeeDashboard />;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={getDashboardComponent()} />
          <Route path="dashboard" element={getDashboardComponent()} />

          {/* Employee Promotion Routes */}
          <Route
            path="promotions/:promotionId"
            element={<PromotionProgress />}
          />

          {/* Training Manager Routes */}
          <Route
            path="training-manager/assign/:employeeId"
            element={<AssignPromotion />}
          />
          <Route
            path="training-manager/progress/:employeeId"
            element={<EmployeeProgressView />}
          />
          <Route
            path="training-manager/employees"
            element={<TrainingManagerDashboard />}
          />
          <Route
            path="training-manager/assignments"
            element={<TrainingManagerDashboard />}
          />
          <Route
            path="training-manager/history/:employeeId"
            element={<EmployeeProgressView />}
          />
          <Route
            path="training-manager/appointments/:employeeId"
            element={<AppointmentManagement />}
          />

          {/* Manager Routes */}
          <Route path="manager" element={<ManagerDashboard />} />
          <Route
            path="manager/employee/:employeeId"
            element={<EmployeeProgressView />}
          />
          <Route
            path="manager/approve-promotion/:promotionId"
            element={<ManagerDashboard />}
          />
          <Route
            path="manager/reject-promotion/:promotionId"
            element={<ManagerDashboard />}
          />
          <Route path="manager/approvals" element={<ManagerDashboard />} />
          <Route path="manager/roles" element={<ManagerDashboard />} />
          <Route path="manager/analytics" element={<ManagerDashboard />} />

          {/* Requirements Tree View */}
          <Route path="requirements" element={<RequirementsTreeView />} />

          {/* Appointments Routes */}
          <Route path="appointments" element={<AppointmentManagement />} />
          <Route path="appointments/book" element={<AppointmentBooking />} />

          {/* Evaluation Routes */}
          <Route path="evaluations" element={getDashboardComponent()} />
          <Route
            path="evaluate/:promotionId"
            element={<PromotionEvaluationInterface />}
          />

          {/* Mentor/Evaluator Employee Promotion Views */}
          <Route
            path="mentor/employee-promotion/:promotionId"
            element={<PromotionEvaluationInterface />}
          />
          <Route
            path="evaluator/employee-promotion/:promotionId"
            element={<PromotionEvaluationInterface />}
          />

          {/* Certificates Routes */}
          <Route path="certificates" element={<CertificatesList />} />
          <Route path="certificates/:id" element={<CertificateView />} />

          {/* Admin Routes */}
          <Route path="users" element={<UserManagement />} />
          <Route path="admin/tasks" element={<TasksManagement />} />
          {/* Redirect old separate pages to Company Structure */}
          <Route
            path="admin/job-titles"
            element={<Navigate to="/admin/company-structure" replace />}
          />
          <Route
            path="admin/grades"
            element={<Navigate to="/admin/company-structure" replace />}
          />
          <Route
            path="admin/departments"
            element={<Navigate to="/admin/company-structure" replace />}
          />
          <Route
            path="admin/promotion-requirements"
            element={<PromotionRequirementsManagement />}
          />
          <Route
            path="admin/company-structure"
            element={<CompanyStructure />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
