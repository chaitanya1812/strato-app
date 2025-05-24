import logo from './strato.svg';
import './App.css';
import React, { useEffect, useMemo, useState } from 'react';
import { greaterThanNumber } from './utils.js';

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
    const showClear = !!column.getFilterValue();
    // Determine placeholder based on filterFn
    let placeholder = "Filter...";
    if (column.columnDef.filterFn === greaterThanNumber) {
      placeholder = "Greater than...";
    } else if (column.columnDef.filterFn === 'lessThan') {
      placeholder = "Less than...";
    } else if (column.columnDef.filterFn === 'includesString') {
      placeholder = "String match...";
    }
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', minWidth: 0 }}>
        <input
          value={column.getFilterValue() ?? ''}
          onChange={e => column.setFilterValue(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, minWidth: 0 ,  borderRadius:'8px'}}
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
        const users = res.data;
        // console.log('Fetched users:', users);
  
        const formatted = users.map(user => ({
            ...user,
            create_date: formatDate(user.create_date),
            password_changed_date: formatDate(user.password_changed_date),
            last_access_date: formatDate(user.last_access_date),
            mfa_enabled: user.mfa_enabled ? 'Yes' : 'No',
        }));
        // console.log('Fetched users:', users);
  
        setData(formatted);
      })
      .catch(err => console.error('Failed to fetch users:', err));
  }, []);

  const columns = useMemo(() => [
    {
      header: 'Human User',
      accessorKey: 'human_user',
    },
    {
      header: 'Create Date',
      accessorKey: 'create_date',
    },
    {
      header: 'Password Changed Date',
      accessorKey: 'password_changed_date',
    },
    {
      header: 'Days Since Password Change',
      accessorKey: 'days_since_password_change',
      filterFn: greaterThanNumber,
    },
    {
      header: 'Last Access Date',
      accessorKey: 'last_access_date',
    },
    {
      header: 'Days Since Last Access',
      accessorKey: 'days_since_last_access',
      filterFn: greaterThanNumber,
    },
    {
      header: 'MFA Enabled',
      accessorKey: 'mfa_enabled',
    },
  ], []);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    defaultColumn: {
      filterFn: 'includesString',
      // cell: info => info.getValue(),
      header: ({ column }) => column.columnDef.header,
      footer: ({ column }) => column.id,
      Filter: DefaultColumnFilter,
    },
  });

  const [hoveredRow, setHoveredRow] = useState(null);
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

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          width: '100%',
          padding: '20px'
        }}
      >
         <a href="https://www.strato-cloud.io/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img src={logo} className="App-logo" alt="logo" style={{ height: '100px' }} />
            <h1 style={{ margin: 0 }}>StratoCloud</h1>
          </div>
        </a>

          {/* Right: Inputs and Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end',  marginRight: '20px' }}>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="number"
              min="0"
              placeholder="Days since password change"
              value={pwDays}
              onChange={(e) => setPwDays(e.target.value)}
              style={{ marginRight: '10px', width: "200px" }}
              title="Enter the number of days since last password change"
            />
            <button
             className='highlight_users_btn'
            onClick={() => {highlightStalePasswords(); setAccessDays('');}} 
            // style={{ width: '210px', borderRadius:'8px' }}
            >
              Highlight Password Stale Users
            </button>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <input
              type="number"
              min="0"
              placeholder="Days since last access"
              value={accessDays}
              onChange={(e) => setAccessDays(e.target.value)}
              style={{ marginRight: '10px', width: "200px" }}
              title="Enter the number of days since last access"
            />
            <button 
            className='highlight_users_btn'
            onClick={() =>{ highlightInactiveUsers(); setPwDays('');}} 
            // style={{ width: '210px' ,  borderRadius:'8px'}}
            >
              Highlight Inactive Users
            </button>
          </div>
          <div>

            

            <button 
              className="clear_all_button"
              // className="button-elegante"
              onClick={() => { table.resetColumnFilters(); setHighlightedRows(new Set()); setPwDays(''); setAccessDays(''); }}
              // style={{ marginBottom: '10px', padding: '5px 10px', background: "#ef3f27" , borderRadius: "8px"}}
            >
              Clear All Filters and Highlights
            </button>
            <button 
            className="clear_highlights_button"
            // className='clear_high_btn'
              onClick={() => { setHighlightedRows(new Set()); setPwDays(''); setAccessDays(''); }}
              // style={{ marginBottom: '10px', padding: '5px 10px', marginRight: '20px', background: "#fb8a63" }}
            >
              Clear Highlights
            </button>

          </div>
        </div>


      </div>

      <div className="table-container"
      // style={{ maxHeight: '455px', overflow: 'auto', width: '100%' ,borderBottom: '1px solid #222'}}
      >
        <table className="cool-table"
        border="0" cellPadding="8" 
        // style={{
        //   width: '100%',
        //   borderCollapse: 'separate',
        //   borderSpacing: 0.1
        // }}
        >
          <thead className="table-header"
          // style={{
          //       position: 'sticky',
          //       top: 0,
          //       background: '#fff',
          //       borderBottom: '2px solid #222',
          //       zIndex: 3
          //     }}
              >
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
                      // backgroundColor: highlightedRows.has(row.id) ? 'lightyellow' : 'white',
                      backgroundColor: highlightedRows.has(row.id)
                        ? 'lightyellow'
                        : hoveredRow === row.id
                          ? '#d4e3f6' // hover color
                          : 'white',
                      transition: 'background-color 0.2s',
                      textAlign: 'center'
                    }}
                    onMouseEnter={() => setHoveredRow(row.id)}
                    onMouseLeave={() => setHoveredRow(null)}
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
      <div 
      className="table-summary"
      // style={{ marginTop: '8px' , textAlign: 'center' }}
      >
        Showing {table.getFilteredRowModel().rows.length} of {table.getPreFilteredRowModel().rows.length} rows
      </div>

      </div>
  );
}
