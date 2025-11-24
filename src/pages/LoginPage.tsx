import { useEffect, type JSX } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { loginUser, selectIsLoggedIn, selectAuthIsLoading, selectAuthError, clearAuthError } from '../features/auth/authSlice';
import LoginForm from '../components/auth/LoginForm';

function LoginPage(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const authError = useAppSelector(selectAuthError);

  useEffect(() => {
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, location.state]);

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleLoginSubmit = (credentials: { username: string, password: string }) => {
    dispatch(loginUser(credentials));
  };
  
  const logoUrl = '/assets/logo.png'; 

  return (
    <div className="flex items-center justify-center min-h-screen bg-blobs bg-pattern-dots px-4 py-12">
      <div className="card-clean w-full max-w-md p-8 animate-scale-in">
        <div className="text-center mb-8">
          <div className="mb-6 inline-block">
            <img src={logoUrl} alt="Company Logo" className="h-20 w-auto mx-auto drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-heading text-gradient-colorful mb-2">
            Bill Tracker
          </h1>
          <p className="text-slate-600 text-sm">Welcome back! Please sign in to continue</p>
        </div>
        <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} serverError={authError} />
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Secure inventory management system</p>
        </div>
      </div>
    </div>
  );
}
export default LoginPage;