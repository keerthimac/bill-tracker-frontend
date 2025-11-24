import { type JSX } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import Header from './Header';
import Sidebar from './Sidebar';
import { logoutUser } from '../../features/auth/authSlice';

function DashboardLayout(): JSX.Element {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer-toggle" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col bg-slate-50">
        <Header onToggleSidebar={() => { const checkbox = document.getElementById('app-drawer-toggle') as HTMLInputElement; if (checkbox) checkbox.checked = !checkbox.checked; }} />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
      <div className="drawer-side z-40">
        <label htmlFor="app-drawer-toggle" aria-label="close sidebar" className="drawer-overlay"></label> 
        <Sidebar onLogout={handleLogout} />
      </div>
    </div>
  );
}
export default DashboardLayout;