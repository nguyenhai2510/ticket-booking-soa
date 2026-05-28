import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function useRequireAuth() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login', { replace: true, state: { from: location.pathname } });
    }
  }, [location.pathname, navigate]);
}

export function getUserId(): string | null {
  return localStorage.getItem('userId');
}
