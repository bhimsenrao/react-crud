// INSTALL AXIOS: npm install axios

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

function AccountsCRUD3() {

  // ============================
  // STATE
  // ============================

  const [accounts, setAccounts] = useState([]);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [editId, setEditId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Configuration
  const accountsPerPage = 5;
  // const API = process.env.REACT_APP_API_URL || 'https://magnetic-depose-probing.ngrok-free.dev/accounts';
  const API = 'https://magnetic-depose-probing.ngrok-free.dev/accounts';

  // Create axios instance with default config
  const api = useMemo(() => {
    return axios.create({
      baseURL: API,
      timeout: 5000
    });
  }, []);


  // ============================
  // HELPER: Clear messages
  // ============================

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };


  // ============================
  // VALIDATION
  // ============================

  const validateForm = () => {
    clearMessages();

    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!balance || isNaN(balance) || Number(balance) < 0) {
      setError('Balance must be a positive number');
      return false;
    }

    return true;
  };


  // ============================
  // READ - GET ACCOUNTS
  // ============================

  const fetchAccounts = async () => {
    setLoading(true);
    clearMessages();

    try {
      const response = await api.get('/');
      setAccounts(response.data || []);
    } catch (err) {
      setError(`Failed to fetch accounts: ${err.message}`);
      console.error('Error fetching accounts:', err);
    } finally {
      setLoading(false);
    }
  };


  // ============================
  // COMPONENT LOAD
  // ============================

  useEffect(() => {
    fetchAccounts();
  }, [api]);


  // ============================
  // CREATE / UPDATE
  // ============================

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearMessages();

    if (!validateForm()) {
      return;
    }

    const payload = {
      name: name.trim(),
      balance: Number(balance)
    };

    setLoading(true);

    try {
      // UPDATE
      if (editId) {
        await api.put(`/${editId}`, payload);
        setSuccess('Account updated successfully');
        setEditId(null);
      }
      // CREATE
      else {
        await api.post('/', payload);
        setSuccess('Account created successfully');
        setCurrentPage(1);
      }

      resetForm();
      await fetchAccounts();
    } catch (err) {
      setError(`Failed to save account: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };


  // ============================
  // DELETE
  // ============================

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) {
      return;
    }

    clearMessages();
    setLoading(true);

    try {
      await api.delete(`/${id}`);
      setSuccess('Account deleted successfully');
      setCurrentPage(1);
      await fetchAccounts();
    } catch (err) {
      setError(`Failed to delete account: ${err.message}`);
      console.error('Delete error:', err);
    } finally {
      setLoading(false);
    }
  };


  // ============================
  // EDIT
  // ============================

  const handleEdit = (account) => {
    setEditId(account.id);
    setName(account.name);
    setBalance(account.balance);
    clearMessages();
  };


  // ============================
  // RESET FORM
  // ============================

  const resetForm = () => {
    setName('');
    setBalance('');
    setEditId(null);
  };


  // ============================
  // PAGINATION
  // ============================

  const totalPages = Math.ceil(accounts.length / accountsPerPage);

  const currentAccounts = useMemo(() => {
    const startIndex = (currentPage - 1) * accountsPerPage;
    const endIndex = startIndex + accountsPerPage;
    return accounts.slice(startIndex, endIndex);
  }, [accounts, currentPage]);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };


  // ============================
  // HELPER: Format currency
  // ============================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };


  // ============================
  // JSX
  // ============================

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '900px',
        margin: 'auto',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h2>Bank Accounts</h2>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#ffebee',
            color: '#c62828',
            borderRadius: '4px',
            border: '1px solid #ef5350'
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div
          style={{
            padding: '12px',
            marginBottom: '15px',
            backgroundColor: '#e8f5e9',
            color: '#2e7d32',
            borderRadius: '4px',
            border: '1px solid #66bb6a'
          }}
        >
          ✅ {success}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}
      >
        <div>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
            Account Holder Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
          />
        </div>

        <div>
          <label htmlFor="balance" style={{ display: 'block', marginBottom: '5px' }}>
            Balance
          </label>
          <input
            id="balance"
            type="number"
            placeholder="0.00"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            disabled={loading}
            min="0"
            step="0.01"
            style={{
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc'
            }}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            alignSelf: 'flex-end'
          }}
        >
          {loading ? 'Processing...' : editId ? 'Update' : 'Add'} Account
        </button>

        {editId && (
          <button
            type="button"
            onClick={() => {
              resetForm();
              clearMessages();
            }}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#757575',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              alignSelf: 'flex-end'
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* Loading Indicator */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          ⏳ Loading...
        </div>
      )}

      {/* Table */}
      {!loading && (
        <table
          border="1"
          cellPadding="10"
          style={{
            marginTop: '20px',
            width: '100%',
            textAlign: 'center',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th>ID</th>
              <th>Name</th>
              <th>Balance</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {currentAccounts.length > 0 ? (
              currentAccounts.map((account) => (
                <tr key={account.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td>{account.id}</td>
                  <td>{account.name}</td>
                  <td>{formatCurrency(account.balance)}</td>
                  <td>
                    <button
                      onClick={() => handleEdit(account)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        marginRight: '5px',
                        backgroundColor: '#ff9800',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() => handleDelete(account.id)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.6 : 1
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No accounts found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Pagination */}
      {!loading && accounts.length > 0 && (
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button
            onClick={previousPage}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              marginRight: '10px',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            Previous
          </button>

          <span style={{ margin: '0 20px', fontWeight: 'bold' }}>
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Total Accounts */}
      {!loading && (
        <p style={{ textAlign: 'center', marginTop: '10px', color: '#666' }}>
          Total Accounts: {accounts.length}
        </p>
      )}
    </div>
  );
}

export default AccountsCRUD3;
