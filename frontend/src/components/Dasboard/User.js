// UserTable.js
import React from 'react';

const User = ({ users }) => {
  return (
    <div>
      <h2>User Table</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            {/* Add more columns if needed */}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              {/* Add more cells based on user properties */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default User;
