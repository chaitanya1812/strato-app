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

// function DefaultColumnFilter({ column }) {
//   return (
//     <div style={{ display: 'flex', gap: '4px' }}>
//       <input
//         value={(column.getFilterValue() ?? '')}
//         onChange={e => column.setFilterValue(e.target.value)}
//         placeholder={`Filter...`}
//         style={{ flex: 1 }}
//       />
//       {column.getFilterValue() && (
//         <button onClick={() => column.setFilterValue(undefined)}>✕</button>
//       )}
//     </div>
//   );
// }



function DefaultColumnFilter({ column }) {
    const showClear = !!column.getFilterValue();
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', minWidth: 0 }}>
        <input
          value={column.getFilterValue() ?? ''}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder="Filter..."
          style={{ flex: 1, minWidth: 0 }}
        />
        <span style={{ width: 24, display: 'inline-flex', justifyContent: 'center' }}>
          <button
            onClick={() => column.setFilterValue(undefined)}
            style={{
              visibility: showClear ? 'visible' : 'hidden',
              width: 20,
              height: 20,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: showClear ? 'pointer' : 'default'
            }}
            tabIndex={showClear ? 0 : -1}
          >
            ✕
          </button>
        </span>
      </div>
    );
  }

  
export default function UserTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(res => {
        const users = res.data; // <- FIXED here
        console.log('Fetched users:', users);
  
        const formatted = users.map(user => ({
            ...user,
            // createDateRaw: user.create_date,
            // passwordChangedDateRaw: user.password_changed_date,
            // lastAccessDateRaw: user.last_access_date,
            create_date: formatDate(user.create_date),
            password_changed_date: formatDate(user.password_changed_date),
            last_access_date: formatDate(user.last_access_date),
            mfa_enabled: user.mfa_enabled ? 'Yes' : 'No',
        }));
  
        setData(formatted);
      })
      .catch(err => console.error('Failed to fetch users:', err));
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
    //   cell: info => (info.getValue() ? 'Yes' : 'No'),
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

  const [highlightedRows, setHighlightedRows] = useState(new Set());
const [pwDays, setPwDays] = useState('');
const [accessDays, setAccessDays] = useState('');

const highlightStalePasswords = () => {
  const days = parseInt(pwDays);
  const rows = table.getRowModel().rows;
  const ids = new Set();
  rows.forEach(row => {
    if (row.original.days_since_password_change > days) {
      ids.add(row.id);
    }
  });
  setHighlightedRows(ids);
};

const highlightInactiveUsers = () => {
  const days = parseInt(accessDays);
  const rows = table.getRowModel().rows;
  const ids = new Set();
  rows.forEach(row => {
    if (row.original.days_since_last_access > days) {
      ids.add(row.id);
    }
  });
  setHighlightedRows(ids);
};


  return (
    <div style={{ padding: '20px' }}>
        <div style={{ marginBottom: '15px' }}>
            <input
                type="number"
                placeholder="Days since password change"
                value={pwDays}
                onChange={(e) => setPwDays(e.target.value)}
                style={{ marginRight: '10px', width:"200px"}}
                title="Enter the number of days since last password change"
            />
            <button onClick={() => highlightStalePasswords()} style={{ width:'210px'}}>
                Highlight Password Stale Users
            </button>

        </div>
        <div style={{ marginBottom: '15px' }}>
            <input
                type="number"
                placeholder="Days since last access"
                value={accessDays}
                onChange={(e) => setAccessDays(e.target.value)}
                style={{ marginRight: '10px', width:"200px" }}
                title="Enter the number of days since last access"
            />
            <button onClick={() => highlightInactiveUsers()} style={{ width:'210px' }}>
                Highlight Inactive Users
            </button>

            {/* <button onClick={() => setHighlightedRows(new Set())} style={{ marginRight: '20px' }}>
                Undo
            </button> */}

        </div>


        <div>
      {/* <h2>User Table</h2> */}


      <button
        onClick={() => {setHighlightedRows(new Set())}}
        style={{ marginBottom: '10px', padding: '5px 10px' , marginRight: '20px', background:"#fb8a63"}}
      >
        Clear Higlight Filters
      </button>

      <button
        onClick={() => {table.resetColumnFilters(); setHighlightedRows(new Set())}}
        style={{ marginBottom: '10px', padding: '5px 10px', background:"#ef3f27" }}
      >
        Clear All Filters
      </button>


        </div>
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
                <tr
                  key={row.id}
                  style={{
                    backgroundColor: highlightedRows.has(row.id) ? 'lightyellow' : 'white',
                  }}
                >
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
