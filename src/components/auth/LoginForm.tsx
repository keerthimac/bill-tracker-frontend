import React, { useState, type JSX } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface LoginFormProps {
    onSubmit: (credentials: { username: string, password: string }) => void;
    isLoading: boolean;
    serverError: string | null;
}

function LoginForm({ onSubmit, isLoading, serverError }: LoginFormProps): JSX.Element {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit({ username, password });
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6 w-full">
      {serverError && (
        <div role="alert" className="alert alert-error shadow-lg text-sm p-3">
          <span>{serverError}</span>
        </div>
      )}
      <div className="form-control w-full">
        <label className="label sr-only"><span className="label-text">Email address</span></label>
        <input type="text" placeholder="Email address" value={username} onChange={(e) => setUsername(e.target.value)} className="input input-bordered w-full" required />
      </div>
      <div className="form-control w-full">
        <label className="label sr-only"><span className="label-text">Password</span></label>
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full" required />
      </div>
      <div>
        <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
          {isLoading && <FaSpinner className="animate-spin mr-2" />}
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
      </div>
    </form>
  );
}
export default LoginForm;