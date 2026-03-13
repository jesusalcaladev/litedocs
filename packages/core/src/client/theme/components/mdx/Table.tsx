import React, { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export interface TableProps {
  headers?: string[];
  data?: (string | React.ReactNode)[][];
  children?: React.ReactNode;
  className?: string;
  sortable?: boolean;
  paginated?: boolean;
  pageSize?: number;
}

export function Table({
  headers,
  data,
  children,
  className = "",
  sortable = false,
  paginated = false,
  pageSize = 10,
}: TableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: number; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const processedData = useMemo(() => {
    if (!data) return [];
    let items = [...data];

    if (sortable && sortConfig !== null) {
      items.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        // Simple string comparison for sorting
        const aStr = typeof aVal === 'string' ? aVal : '';
        const bStr = typeof bVal === 'string' ? bVal : '';

        if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return items;
  }, [data, sortConfig, sortable]);

  const totalPages = Math.ceil(processedData.length / pageSize);
  const paginatedData = useMemo(() => {
    if (!paginated) return processedData;
    const start = (currentPage - 1) * pageSize;
    return processedData.slice(start, start + pageSize);
  }, [processedData, paginated, currentPage, pageSize]);

  const requestSort = (index: number) => {
    if (!sortable) return;
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === index && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: index, direction });
  };

  const renderSortIcon = (index: number) => {
    if (!sortable) return null;
    if (sortConfig?.key !== index) return <ChevronDown size={14} className="ld-table-sort-icon ld-table-sort-icon--hidden" />;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} className="ld-table-sort-icon" /> : <ChevronDown size={14} className="ld-table-sort-icon" />;
  };

  const tableContent = children ? (
    children
  ) : (
    <>
      {headers && (
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th 
                key={i} 
                onClick={() => requestSort(i)}
                className={sortable ? "ld-table-header--sortable" : ""}
              >
                <div className="ld-table-header-content">
                  {header}
                  {renderSortIcon(i)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
      )}
      {paginatedData && (
        <tbody>
          {paginatedData.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      )}
    </>
  );

  return (
    <div className={`ld-table-container ${className}`.trim()}>
      <div className="ld-table-wrapper">
        <table className="ld-table">{tableContent}</table>
      </div>
      
      {paginated && totalPages > 1 && (
        <div className="ld-table-pagination">
          <div className="ld-table-pagination-info">
            Page {currentPage} of {totalPages}
          </div>
          <div className="ld-table-pagination-controls">
            <button 
              onClick={() => setCurrentPage(1)} 
              disabled={currentPage === 1}
              className="ld-table-pagination-btn"
            >
              <ChevronsLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              className="ld-table-pagination-btn"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              className="ld-table-pagination-btn"
            >
              <ChevronRight size={16} />
            </button>
            <button 
              onClick={() => setCurrentPage(totalPages)} 
              disabled={currentPage === totalPages}
              className="ld-table-pagination-btn"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
