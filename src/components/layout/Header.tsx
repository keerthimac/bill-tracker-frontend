import { type JSX } from 'react';
import { FiMenu, FiBell, FiUser } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';

interface HeaderProps { onToggleSidebar: () => void; }

function Header({ onToggleSidebar }: HeaderProps): JSX.Element {
    const currentUser = useAppSelector(selectCurrentUser);
    return (
        <header className="navbar bg-white shadow-sm px-6 sticky top-0 z-30 border-b border-slate-100">
            <div className="flex-none lg:hidden">
                <label htmlFor="app-drawer-toggle" className="btn btn-square btn-ghost hover:bg-blue-50 transition-colors" onClick={onToggleSidebar}>
                    <FiMenu className="text-xl text-slate-700" />
                </label>
            </div>
            <div className="flex-1">
                <span className="text-xl font-heading font-bold text-gradient-blue">
                    Bill Tracker
                </span>
            </div>
            <div className="flex-none gap-3">
                <button className="btn btn-ghost btn-circle hover:bg-blue-50 transition-all relative">
                    <div className="indicator">
                        <FiBell className="text-xl text-slate-600" />
                        <span className="badge badge-xs bg-orange-500 border-none indicator-item animate-pulse"></span>
                    </div>
                </button>
                <div className="dropdown dropdown-end">
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:ring-2 hover:ring-blue-400 transition-all">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-blue-100">
                            <FiUser className="text-white text-lg" />
                        </div>
                    </div>
                    <ul tabIndex={0} className="mt-3 z-[1] p-3 shadow-lg menu menu-sm dropdown-content bg-white rounded-xl w-56 border border-slate-100">
                        <li className="px-3 py-2 mb-2">
                            <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-800">{currentUser?.displayName || 'User'}</span>
                                <span className="badge badge-blue text-xs">{currentUser?.role || 'User'}</span>
                            </div>
                        </li>
                        <div className="divider my-1"></div>
                        <li><a className="hover:bg-blue-50 rounded-lg">Profile Settings</a></li>
                        <li><a className="hover:bg-blue-50 rounded-lg">Preferences</a></li>
                    </ul>
                </div>
            </div>
        </header>
    );
}
export default Header;