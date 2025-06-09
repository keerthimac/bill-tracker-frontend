import React, { type JSX } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../features/auth/authSlice';
import { FiHome, FiFileText, FiPackage, FiBriefcase, FiTag, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';
import { FaBoxOpen } from 'react-icons/fa';

const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    return isActive ? 'active' : '';
};

// Define navigation items for each role
const poNavItems = [
    { label: 'Dashboard', path: '/', icon: <FiHome /> },
    { label: 'Purchase Bills', path: '/purchase-bills', icon: <FiFileText /> },
    { label: 'Master Materials', path: '/master-materials', icon: <FiPackage /> },
    { label: 'Suppliers', path: '/suppliers', icon: <FiBriefcase /> },
];

const adminNavItems = [
    { label: 'Dashboard', path: '/', icon: <FiHome /> },
    { label: 'Purchase Bills', path: '/purchase-bills', icon: <FiFileText /> },
    { group: 'Management' },
    { label: 'Master Materials', path: '/master-materials', icon: <FiPackage /> },
    { label: 'Suppliers', path: '/suppliers', icon: <FiBriefcase /> },
    { label: 'Brands', path: '/brands', icon: <FiTag /> },
    { label: 'Supplier Prices', path: '/supplier-prices', icon: <FaBoxOpen /> },
    { group: 'Setup' },
    { label: 'Sites', path: '/sites', icon: <FiUsers /> },
    { label: 'Item Categories', path: '/item-categories', icon: <FiSettings /> },
];


function Sidebar({ onLogout }: { onLogout: () => void }): JSX.Element {
    const currentUser = useAppSelector(selectCurrentUser);
    const logoUrl = '/assets/logo.png';

    const navigationItems = currentUser?.role === 'admin' ? adminNavItems : poNavItems;

    return (
        <ul className="menu p-4 w-64 min-h-full bg-base-200 text-base-content">
            <li className="mb-4"><NavLink to="/" className="text-xl font-bold p-2 hover:bg-transparent flex items-center gap-2"><img src={logoUrl} alt="Logo" className="h-8 w-auto" /><span>Bill Tracker</span></NavLink></li>
            {currentUser && <li className="menu-title text-xs px-4"><span>{currentUser.displayName} ({currentUser.role})</span></li>}
            
            {navigationItems.map((item, index) => (
                item.group 
                    ? <li key={`group-${index}`} className="menu-title mt-4"><span>{item.group}</span></li>
                    : <li key={item.label}><NavLink to={item.path} className={getNavLinkClass} end={item.path === '/'}><span className="text-lg">{item.icon}</span>{item.label}</NavLink></li>
            ))}

            <li className="mt-auto"><button onClick={onLogout} className="btn btn-error btn-sm"><FiLogOut className="mr-2"/>Log Out</button></li>
        </ul>
    );
}
export default Sidebar;