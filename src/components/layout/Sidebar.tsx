import { type JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { FiHome, FiFileText, FiPackage, FiBriefcase, FiTag, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';

const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? 'nav-item active' : 'nav-item';
};

// Define navigation items with colors for each icon
const poNavItems = [
    { label: 'Dashboard', path: '/', icon: <FiHome />, iconColor: 'nav-icon-blue' },
    { label: 'Purchase Bills', path: '/purchase-bills', icon: <FiFileText />, iconColor: 'nav-icon-purple' },
    { label: 'Master Materials', path: '/master-materials', icon: <FiPackage />, iconColor: 'nav-icon-green' },
    { label: 'Suppliers', path: '/suppliers', icon: <FiBriefcase />, iconColor: 'nav-icon-teal' },
];

const adminNavItems = [
    { label: 'Dashboard', path: '/', icon: <FiHome />, iconColor: 'nav-icon-blue' },
    { label: 'Purchase Bills', path: '/purchase-bills', icon: <FiFileText />, iconColor: 'nav-icon-purple' },
    { group: 'Management' },
    { label: 'Master Materials', path: '/master-materials', icon: <FiPackage />, iconColor: 'nav-icon-green' },
    { label: 'Suppliers', path: '/suppliers', icon: <FiBriefcase />, iconColor: 'nav-icon-teal' },
    { label: 'Brands', path: '/brands', icon: <FiTag />, iconColor: 'nav-icon-pink' },
    { label: 'Supplier Prices', path: '/supplier-prices', icon: <FaBoxOpen />, iconColor: 'nav-icon-orange' },
    { group: 'Setup' },
    { label: 'Sites', path: '/sites', icon: <FiUsers />, iconColor: 'nav-icon-purple' },
    { label: 'Item Categories', path: '/item-categories', icon: <FiSettings />, iconColor: 'nav-icon-blue' },
];


function Sidebar({ onLogout }: { onLogout: () => void }): JSX.Element {
    const currentUser = useAppSelector(selectCurrentUser);
    const logoUrl = '/assets/logo.png';

    const navigationItems = currentUser?.role === 'admin' ? adminNavItems : poNavItems;

    return (
        <aside className="flex flex-col w-64 min-h-full bg-white border-r border-slate-100 p-4">
            {/* Logo & Branding */}
            <div className="mb-8">
                <NavLink to="/" className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors" end>
                    <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
                    <div className="flex flex-col">
                        <span className="text-xl font-heading font-bold text-gradient-colorful">
                            Bill Tracker
                        </span>
                        <span className="text-xs text-slate-500">Inventory System</span>
                    </div>
                </NavLink>
            </div>
            
            {/* User Card */}
            {currentUser && (
                <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {currentUser.displayName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-slate-800 truncate">{currentUser.displayName}</p>
                            <span className="badge badge-blue text-xs capitalize">{currentUser.role}</span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navigationItems.map((item, index) => {
                    if ('group' in item) {
                        return (
                            <div key={`group-${index}`} className="pt-6 pb-2 px-3">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                    {item.group}
                                </span>
                            </div>
                        );
                    }
                    return (
                        <NavLink 
                            key={item.label}
                            to={item.path} 
                            className={getNavLinkClass} 
                            end={item.path === '/'}
                        >
                            <span className={`text-xl ${item.iconColor}`}>{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Logout Button */}
            <div className="pt-4 mt-4 border-t border-slate-100">
                <button 
                    onClick={onLogout} 
                    className="btn btn-ghost w-full justify-start gap-3 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                    <FiLogOut className="text-lg" />
                    <span className="font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
export default Sidebar;