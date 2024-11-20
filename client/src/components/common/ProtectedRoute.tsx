import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  return localStorage.getItem('nickName') ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;
