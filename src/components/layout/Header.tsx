import React, { type JSX } from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';

interface HeaderProps { onToggleSidebar: () => void; }

function Header({ onToggleSidebar }: HeaderProps): JSX.Element {
    const currentUser = useAppSelector(selectCurrentUser);
    return (
        <header className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-30">
            <div className="flex-none lg:hidden">
                <label htmlFor="app-drawer-toggle" className="btn btn-square btn-ghost" onClick={onToggleSidebar}>
                    <FiMenu className="text-xl" />
                </label>
            </div>
            <div className="flex-1"><span className="text-xl font-semibold">Company System</span></div>
            <div className="flex-none gap-2">
                <button className="btn btn-ghost btn-circle"><div className="indicator"><FiBell className="text-xl" /><span className="badge badge-xs badge-secondary indicator-item"></span></div></button>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-1"><FiUser className="w-full h-full text-primary p-1" /></div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52">
                        <li className="menu-title px-4 py-2"><span>{currentUser?.displayName || 'User'}</span></li>
                        <li><a>Profile</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
export default Header;