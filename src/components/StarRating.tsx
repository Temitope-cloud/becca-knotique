import { Star } from "lucide-react";

type StarRatingProps = {
  rating: number; // supports decimals like 4.5
  size?: number; // optional size control
};

const StarRating = ({ rating, size = 5 }: StarRatingProps) => {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i + 1 <= rating;
        const isHalf = i < rating && i + 1 > rating;

        return (
          <div key={i} className="relative">
            {/* Empty Star */}
            <Star className={`h-${size} w-${size} text-gray-300`} />

            {/* Full Star */}
            {isFull && (
              <Star
                className={`absolute top-0 left-0 h-${size} w-${size} fill-yellow-400 text-yellow-400`}
              />
            )}

            {/* Half Star */}
            {isHalf && (
              <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
                <Star
                  className={`h-${size} w-${size} fill-yellow-400 text-yellow-400`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
