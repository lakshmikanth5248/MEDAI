import React from 'react';
import './Loader.css';

export const Loader = ({ size = 'md', text }) => {
  return (
    <div className={`loader loader-${size}`}>
      <div className="loader-spinner">
        <svg viewBox="0 0 50 50">
          <circle className="loader-circle" cx="25" cy="25" r="20" fill="none" strokeWidth="4" strokeLinecap="round" />
        </svg>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="page-loader">
      <Loader size="lg" text="Loading..." />
    </div>
  );
};

export const Skeleton = ({ width = '100%', height = 16, borderRadius = 6, count = 1 }) => {
  return (
    <div className="skeleton-wrapper">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-block"
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            borderRadius: typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius,
            marginBottom: count > 1 && i < count - 1 ? '10px' : 0,
          }}
        />
      ))}
    </div>
  );
};

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="table-skeleton">
      <div className="table-skeleton-header">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`h-${i}`} className="skeleton-block" style={{ width: `${80 + Math.random() * 40}px`, height: 16 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="table-skeleton-row">
          {Array.from({ length: columns }).map((_, c) => (
            <div
              key={`c-${c}`}
              className="skeleton-block"
              style={{ width: `${60 + Math.random() * 60}%`, height: 14 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
