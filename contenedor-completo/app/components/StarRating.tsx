import * as React from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value,
  max = 5,
  onChange,
  readOnly = false,
  size = 24,
  className = "",
}: StarRatingProps) => {
  const [hovered, setHovered] = React.useState<number | null>(null);

  const handleClick = (idx: number) => {
    if (!readOnly && onChange) {
      onChange(idx + 1);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }).map((_, idx) => {
        const filled = hovered !== null ? idx < hovered + 1 : idx < value;
        return (
          <button
            key={idx}
            type="button"
            className="p-0 m-0 bg-transparent border-none cursor-pointer focus:outline-none"
            style={{ lineHeight: 0 }}
            onClick={() => handleClick(idx)}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
            disabled={readOnly}
            aria-label={`Calificar con ${idx + 1} estrellas`}
          >
            <Star
              size={size}
              fill={filled ? "#facc15" : "none"}
              stroke="#facc15"
              className={filled ? "text-yellow-400" : "text-gray-400"}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">{value}/{max}</span>
    </div>
  );
}; 