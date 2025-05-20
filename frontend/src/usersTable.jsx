import React, { useEffect, useState } from "react";


// Helper function to format ISO date strings as "Feb 3 2022"
function formatDate(dateString) {
    if (!dateString) return "";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString; // fallback if invalid date
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }


function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then(res => res.json())
      .then(data => {
        setUsers(data.data); 
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!users.length) return <div>No users found.</div>;

  const dateKeys = ["CreateDate", "PasswordChangedDate", "LastAccessDate"];
  const headers = Object.keys(users[0]);

  return (
    <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
      <thead>
        <tr>
          {
            headers.map(key => 
                <th key = {key}>{key}</th>
            )
          /* {Object.keys(users[0]).map(key => (
            <th key={key}>{key}</th>
          ))} */
          }
        </tr>
      </thead>
      <tbody>
        {users.map((user, idx) => (
          <tr key={idx}>
            {
                headers.map((key, i) => {
                    let val = user[key];
                    if (dateKeys.includes(key)){
                        val = formatDate(val);
                    } else if (key == "MFAEnabled"){
                        val = val ? "Yes" : "No";
                    }
                    return <td key={i}>{val}</td>
                })
            
            /* {Object.values(user).map((val, i) => (
              <td key={i}>{val}</td>
            ))} */
            
            }
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UserTable;
