import React from "react";

export interface TableProps {
  headers?: string[];
  data?: (string | React.ReactNode)[][];
  children?: React.ReactNode;
  className?: string;
}

/**
 * A consistent, themed table component for documentation.
 * Can be used by passing structured 'headers' and 'data' props,
 * or by wrapping standard <thead>/<tbody> elements.
 */
export function Table({
  headers,
  data,
  children,
  className = "",
}: TableProps) {
  const tableContent = children ? (
    children
  ) : (
    <>
      {headers && (
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th key={i}>{header}</th>
            ))}
          </tr>
        </thead>
      )}
      {data && (
        <tbody>
          {data.map((row, i) => (
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
      <table className="ld-table">{tableContent}</table>
    </div>
  );
}
