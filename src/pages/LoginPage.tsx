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
    <div className="flex items-center justify-center min-h-screen bg-base-200 px-4 py-12">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body items-center text-center">
          <div className="mb-6"><img src={logoUrl} alt="Company Logo" className="h-20 w-auto" /></div>
          <h1 className="card-title text-3xl !mb-1 text-primary">Bill Tracker System</h1>
          <p className="mt-0 text-sm text-base-content/70">Please log in to continue</p>
          <LoginForm onSubmit={handleLoginSubmit} isLoading={isLoading} serverError={authError} />
        </div>
      </div>
    </div>
  );
}
export default LoginPage;