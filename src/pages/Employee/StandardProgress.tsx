// @ts-nocheck
// Legacy file - This component uses the old "Standard" system which has been replaced
// with the new promotion-based system. Keeping for reference but disabled from build.

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { mockApi } from "@/mock/services/mockApi";
import { Task, Subtask, User, AppointmentRequest } from "@/types";
import {
  EvaluationStatus,
  EvaluationStatusNames,
  EvaluationStatusColors,
  AppointmentStatusNames,
} from "@/utils/constants";
import {
  AcademicCapIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const StandardProgress = () => {
  return (
    <div className="card text-center py-12">
      <AcademicCapIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Legacy Component
      </h2>
      <p className="text-gray-600">
        This component uses the old "Standard" system which has been replaced
        with the new promotion-based system.
      </p>
      <p className="text-gray-500 text-sm mt-2">
        Please use the Promotion Progress view instead.
      </p>
    </div>
  );
};

export default StandardProgress;
