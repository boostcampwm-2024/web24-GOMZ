import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return localStorage.getItem('userId') ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
