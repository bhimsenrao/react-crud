import { useState, useEffect } from 'react';

function AccountsCRUD() {
  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [editId, setEditId] = useState(null);

  const API = 'http://localhost:5000/accounts';

  // READ
  const fetchAccounts = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => setAccounts(data));
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // CREATE or UPDATE
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { name, balance: Number(balance) };

    if (editId) {
      // UPDATE
      fetch(`${API}/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        setEditId(null);
        resetForm();
        fetchAccounts();
      });
    } else {
      // CREATE
      fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(() => {
        resetForm();
        fetchAccounts();
      });
    }
  };

  // DELETE
  const handleDelete = (id) => {
    fetch(`${API}/${id}`, { method: 'DELETE' }).then(() => fetchAccounts());
  };

  const handleEdit = (account) => {
    setEditId(account.id);
    setName(account.name);
    setBalance(account.balance);
  };

  const resetForm = () => {
    setName('');
    setBalance('');
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Bank Accounts (CRUD with SQLite3)</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Account Holder Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Balance"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
          required
        />
        <button type="submit">{editId ? 'Update' : 'Add'} Account</button>
      </form>

      <table border="1" cellPadding="10" style={{ marginTop: 20, width: '100%' , alignContent: 'center'}}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((acc) => (
            <tr key={acc.id}>
              <td>{acc.name}</td>
              <td>{acc.balance}</td>
              <td>
                <button onClick={() => handleEdit(acc)}>Edit</button>
                <button onClick={() => handleDelete(acc.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AccountsCRUD;