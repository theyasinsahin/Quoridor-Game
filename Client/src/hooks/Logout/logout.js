import { useNavigate } from 'react-router-dom';

const useLogout = () => {
  const navigate = useNavigate();

  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Optionally, you can also clear any user data from context or state
    // For example, if you use a context to manage user data
    // dispatch({ type: 'LOGOUT' });

    // Redirect to the login page
    navigate('/login');
  };

  return logout;
};

export default useLogout;
