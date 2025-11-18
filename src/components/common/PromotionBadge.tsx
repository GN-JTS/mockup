import { JobTitle, Grade } from "@/types";

interface PromotionBadgeProps {
  jobTitle: JobTitle;
  grade: Grade;
  variant?: "current" | "target";
  size?: "sm" | "md" | "lg";
}

const PromotionBadge = ({
  jobTitle,
  grade,
  variant = "current",
  size = "md",
}: PromotionBadgeProps) => {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const variantClasses = {
    current: "bg-blue-100 text-blue-800 border-blue-300",
    target: "bg-green-100 text-green-800 border-green-300",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-lg border-2 font-medium ${sizeClasses[size]} ${variantClasses[variant]}`}
    >
      <span className="font-semibold">{jobTitle.name}</span>
      <span className="opacity-75">•</span>
      <span className="font-bold">{grade.name}</span>
      {variant === "target" && (
        <span className="ml-1 text-xs opacity-75">(Target)</span>
      )}
    </div>
  );
};

export default PromotionBadge;
