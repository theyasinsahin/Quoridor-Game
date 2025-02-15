import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

import Game from './pages/Game/Game';
import StartPage from './pages/Start/StartPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Profile from './pages/Profile/Profile';
import HighRatingTablePage from './pages/HighRating/HighRatingPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import WaitingPage from './pages/Game/WaitingPage';
import LandingPage from './components/LandingPage';
import './App.css';

// Apollo Client Setup
const client = new ApolloClient({
  uri: 'http://localhost:5000', // your Apollo Server URL
  cache: new InMemoryCache(),
  headers: {
    authorization: `Bearer ${localStorage.getItem('token') || ''}`,
  }
});

const App = () => {
  return (
    <ApolloProvider client={client}>
      <Router>
        <div className="App">
            <Routes>
              <Route path="/" element={<ProtectedRoute> <LandingPage /> </ProtectedRoute> } />
              <Route path="/start" element={<ProtectedRoute> <StartPage /> </ProtectedRoute> } />
              <Route path="/game" element={<ProtectedRoute><Game /> </ProtectedRoute> } />
              <Route path="/waiting-page" element={<ProtectedRoute><WaitingPage /> </ProtectedRoute> } />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/high-rating-table" element={<ProtectedRoute><HighRatingTablePage /> </ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            </Routes>   
        </div>
      </Router>
    </ApolloProvider>

  );
}

export default App;
