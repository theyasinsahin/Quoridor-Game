import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
      }
    }
  }
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await login({
        variables: { email, password },
      });
      const {token, user} = response.data.login;
      // Store the token in local storage or state management
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect user to another page
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">Login</h2>

      <img src="/images/quoridor-logo-removebg.png" alt="Quoridor Logo" className="login-logo" />
      {error && <p className="login-error">Error logging in</p>}
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-field">
          <label className='login-label'>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="login-input"
          />
        </div>
        <div className="login-field">
          <label className='login-label'>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="login-input"
          />
        </div>
        <Link to="/register" className='to-register-text'> Don't you have an account? Register now</Link>
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
  
}

export default Login;
