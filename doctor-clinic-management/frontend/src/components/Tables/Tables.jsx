import React, { useState, useMemo, useCallback } from 'react';
import './Tables.css';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();
  let className = 'status-badge';
  if (['completed', 'active', 'confirmed', 'approved'].includes(normalized)) {
    className += ' status-success';
  } else if (['pending', 'scheduled', 'in-progress', 'in_progress'].includes(normalized)) {
    className += ' status-warning';
  } else if (['cancelled', 'canceled', 'rejected', 'inactive'].includes(normalized)) {
    className += ' status-danger';
  } else {
    className += ' status-default';
  }
  return (
    <span className={className}>
      <span className="status-dot" />
      {status || 'Unknown'}
    </span>
  );
};

const SkeletonRows = ({ rows, columns }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <tr key={`skeleton-${i}`} className="table-row-skeleton">
        {Array.from({ length: columns }).map((_, j) => (
          <td key={j}>
            <div className="skeleton-cell" style={{ width: `${60 + Math.random() * 30}%` }} />
          </td>
        ))}
      </tr>
    ))}
  </>
);

export const DataTable = ({
  columns = [],
  data = [],
  searchable = false,
  pageSize = 10,
  onRowClick,
  loading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        const val = row[col.key];
        if (val == null) return false;
        return String(val).toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredData, sortConfig]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const renderCell = (row, col) => {
    if (col.render) return col.render(row[col.key], row);
    const val = row[col.key];
    if (val == null) return <span className="table-null">—</span>;
    return val;
  };

  const isStatusColumn = (key) => {
    const lower = key.toLowerCase();
    return lower.includes('status') || lower.includes('state') || lower.includes('type');
  };

  return (
    <div className="data-table-wrapper">
      {searchable && (
        <div className="data-table-toolbar">
          <div className="data-table-search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="data-table-search-input"
            />
          </div>
          <span className="data-table-count">{sortedData.length} records</span>
        </div>
      )}

      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`table-header ${col.sortable !== false ? 'table-header-sortable' : ''}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                >
                  <div className="table-header-content">
                    <span>{col.label || col.key}</span>
                    {col.sortable !== false && (
                      <span className="sort-indicator">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ opacity: sortConfig.key === col.key ? 1 : 0.3 }}
                        >
                          {sortConfig.key === col.key && sortConfig.direction === 'asc' ? (
                            <polyline points="18 15 12 9 6 15" />
                          ) : (
                            <polyline points="6 9 12 15 18 9" />
                          )}
                        </svg>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <SkeletonRows rows={pageSize} columns={columns.length} />
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#e2e8f0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p>No data found</p>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || row._id || idx}
                  className={`table-row ${onRowClick ? 'table-row-clickable' : ''}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => (
                    <td key={col.key}>
                      {isStatusColumn(col.key) && !col.render ? (
                        <StatusBadge status={renderCell(row, col)} />
                      ) : (
                        renderCell(row, col)
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="data-table-pagination">
          <button
            className="pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {getPageNumbers().map((page) => (
            <button
              key={page}
              className={`pagination-btn pagination-page ${currentPage === page ? 'active' : ''}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}

          <button
            className="pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
