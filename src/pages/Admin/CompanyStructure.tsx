import { useState } from "react";
import {
  BriefcaseIcon,
  TrophyIcon,
  BuildingOfficeIcon,
  Squares2X2Icon,
} from "@heroicons/react/24/outline";
import JobTitlesManagement from "./JobTitlesManagement";
import GradesManagement from "./GradesManagement";
import DepartmentsManagement from "./DepartmentsManagement";
import SectionsManagement from "./SectionsManagement";

type TabType = "job-titles" | "grades" | "departments" | "sections";

const CompanyStructure = () => {
  const [activeTab, setActiveTab] = useState<TabType>("job-titles");

  const tabs = [
    {
      id: "job-titles" as TabType,
      label: "Job Titles",
      icon: BriefcaseIcon,
    },
    {
      id: "grades" as TabType,
      label: "Grades",
      icon: TrophyIcon,
    },
    {
      id: "departments" as TabType,
      label: "Departments",
      icon: BuildingOfficeIcon,
    },
    {
      id: "sections" as TabType,
      label: "Sections",
      icon: Squares2X2Icon,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Company Structure
        </h1>
        <p className="text-gray-600">
          Manage job titles, grades, departments, and sections. Configure
          section-based mappings and grade ranges.
        </p>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${
                      activeTab === tab.id
                        ? "border-primary-500 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon
                    className={`
                      -ml-0.5 mr-2 h-5 w-5
                      ${
                        activeTab === tab.id
                          ? "text-primary-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      }
                    `}
                  />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "job-titles" && <JobTitlesManagement />}
          {activeTab === "grades" && <GradesManagement />}
          {activeTab === "departments" && <DepartmentsManagement />}
          {activeTab === "sections" && <SectionsManagement />}
        </div>
      </div>
    </div>
  );
};

export default CompanyStructure;
