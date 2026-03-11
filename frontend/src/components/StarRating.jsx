import { useMemo, useState } from "react";

const clamp = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(5, n));
};

const iconForIndex = (value, index) => {
  const v = clamp(value);
  const full = Math.floor(v);
  const frac = v - full;

  if (index <= full) return "bi-star-fill";
  if (index === full + 1 && frac >= 0.5) return "bi-star-half";
  return "bi-star";
};

const StarRating = ({ value = 0, outOf = 5, readOnly = false, onChange, className = "" }) => {
  const [hover, setHover] = useState(null);

  const displayValue = hover != null ? hover : value;

  const stars = useMemo(() => {
    const total = Math.max(1, Number(outOf) || 5);
    return Array.from({ length: total }, (_, i) => i + 1);
  }, [outOf]);

  return (
    <div className={`star-rating ${readOnly ? "readonly" : ""} ${className}`.trim()}>
      {stars.map((idx) => {
        const icon = iconForIndex(displayValue, idx);
        const label = `${idx} / ${stars.length}`;
        return (
          <button
            key={idx}
            type="button"
            className="star-btn"
            aria-label={label}
            title={label}
            disabled={readOnly}
            onMouseEnter={() => !readOnly && setHover(idx)}
            onMouseLeave={() => !readOnly && setHover(null)}
            onClick={() => !readOnly && onChange && onChange(idx)}
          >
            <i className={`bi ${icon}`} />
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;