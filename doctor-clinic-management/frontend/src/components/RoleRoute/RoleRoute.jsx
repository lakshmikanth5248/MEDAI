import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_ROUTE_PREFIX = {
  admin: 'admin',
  reception: 'reception',
  doctor: 'doctor',
  patient: 'patient',
  medical_store: 'medical-store',
};

export function RoleRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const userPath = ROLE_ROUTE_PREFIX[user.role];
    return <Navigate to={`/${userPath}/dashboard`} replace />;
  }

  return children;
}
