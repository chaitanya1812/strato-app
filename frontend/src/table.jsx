import React, { useEffect, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
} from '@tanstack/react-table';

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function DefaultColumnFilter({ column }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      <input
        value={(column.getFilterValue() ?? '')}
        onChange={e => column.setFilterValue(e.target.value)}
        placeholder={`Filter...`}
        style={{ flex: 1 }}
      />
      {column.getFilterValue() && (
        <button onClick={() => column.setFilterValue(undefined)}>✕</button>
      )}
    </div>
  );
}

export default function UserTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(users => {
        console.log('Fetched users:', users.data);
        setData(users.data);
      });
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Human User',
      accessorKey: 'human_user',
      filterFn: 'includesString',
      cell: info => info.getValue(),
    },
    {
      header: 'Create Date',
      accessorKey: 'create_date',
      cell: info => formatDate(info.getValue()),
      filterFn: 'includesString',
    },
    {
      header: 'Password Changed Date',
      accessorKey: 'password_changed_date',
      cell: info => formatDate(info.getValue()),
    },
    {
      header: 'Days Since Password Change',
      accessorKey: 'days_since_password_change',
    },
    {
      header: 'Last Access Date',
      accessorKey: 'last_access_date',
      cell: info => formatDate(info.getValue()),
    },
    {
      header: 'Days Since Last Access',
      accessorKey: 'days_since_last_access',
    },
    {
      header: 'MFA Enabled',
      accessorKey: 'mfa_enabled',
      cell: info => (info.getValue() ? 'Yes' : 'No'),
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      filterFn: 'includesString',
      cell: info => info.getValue(),
      header: ({ column }) => column.columnDef.header,
      footer: ({ column }) => column.id,
      Filter: DefaultColumnFilter,
    },
  });

  return (
    <div style={{ padding: '20px' }}>
      {/* <h2>User Table</h2> */}
      <button
        onClick={() => table.resetColumnFilters()}
        style={{ marginBottom: '10px', padding: '5px 10px' }}
      >
        Clear All Filters
      </button>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <React.Fragment key={headerGroup.id}>
              <tr>
                {headerGroup.headers.map(header => (
                  <th key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
              <tr>
                {headerGroup.headers.map(header => (
                  <td key={header.id}>
                    {header.column.getCanFilter()
                      ? flexRender(
                          header.column.columnDef.Filter,
                          { column: header.column, table }
                        )
                      : null}
                  </td>
                ))}
              </tr>
            </React.Fragment>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                No data available.
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
