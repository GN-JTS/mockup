import { JobTitle } from "@/types";

export const mockJobTitles: JobTitle[] = [
  {
    id: "job-field-operator",
    name: "Field Operator",
    description:
      "Performs field operations and equipment monitoring in the Control Section",
    sectionId: "sec-1", // Migrated to default section
  },
  {
    id: "job-console-operator",
    name: "Console Operator",
    description:
      "Operates DCS console and monitors plant systems in the Control Section",
    sectionId: "sec-1", // Migrated to default section
  },
  {
    id: "job-shift-supervisor",
    name: "Shift Supervisor",
    description:
      "Supervises shift operations and coordinates team activities in the Control Section",
    sectionId: "sec-1", // Migrated to default section
  },
];
