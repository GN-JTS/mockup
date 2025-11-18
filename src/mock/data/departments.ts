import { Department, Section } from "@/types";

export const mockDepartments: Department[] = [
  {
    id: "dept-1",
    name: "Engineering",
  },
  {
    id: "dept-2",
    name: "Operations",
  },
  {
    id: "dept-3",
    name: "Quality Assurance",
  },
];

export const mockSections: Section[] = [
  {
    id: "sec-1",
    name: "Software Development",
    departmentId: "dept-1",
  },
  {
    id: "sec-2",
    name: "Hardware Engineering",
    departmentId: "dept-1",
  },
  {
    id: "sec-3",
    name: "Production",
    departmentId: "dept-2",
  },
  {
    id: "sec-4",
    name: "Maintenance",
    departmentId: "dept-2",
  },
  {
    id: "sec-5",
    name: "Testing",
    departmentId: "dept-3",
  },
];
