import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';

const REGISTER_MUTATION = gql`
  mutation Register($name: String!, $email: String!, $password: String!) {
    register(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
      }
    }
  }
`;

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [register, { data, loading, error }] = useMutation(REGISTER_MUTATION);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await register({
        variables: { name, email, password },
      });
      // Store the token in local storage or state management
      localStorage.setItem('token', response.data.register.token);
      // Redirect user to login page or another page
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Register</h2>
      <img src="/images/quoridor-logo-removebg.png" alt="Quoridor Logo" className="login-logo" />

      {error && <p className="register-error">Error registering</p>}
      <form className="register-form" onSubmit={handleSubmit}>
        
        <div className="register-field">
          <label className="register-label">Name</label>
          <input
            className="register-input"
            type="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label className="register-label">Email</label>
          <input
            className="register-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="register-field">
          <label className="register-label">Password</label>
          <input
            className="register-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <Link to="/login" className='to-login-text'>Do you already have an account? Login</Link>
        <button className="register-button" type="submit" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
  
}

export default Register;
