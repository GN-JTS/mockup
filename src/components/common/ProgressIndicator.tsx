interface ProgressIndicatorProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  variant?: "primary" | "mentor" | "evaluator";
  size?: "sm" | "md" | "lg";
}

const ProgressIndicator = ({
  current,
  total,
  label,
  showPercentage = false,
  variant = "primary",
  size = "md",
}: ProgressIndicatorProps) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const variantColors = {
    primary: "bg-primary-600",
    mentor: "bg-indigo-600",
    evaluator: "bg-red-600",
  };

  const variantBackgrounds = {
    primary: "bg-primary-100",
    mentor: "bg-indigo-100",
    evaluator: "bg-red-100",
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-gray-900">
              {percentage}%
            </span>
          )}
          {!showPercentage && (
            <span className="text-sm text-gray-600">
              {current} / {total}
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${variantBackgrounds[variant]} rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`${variantColors[variant]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressIndicator;
