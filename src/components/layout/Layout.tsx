import React, { type JSX } from "react";
import { NavLink, Outlet } from "react-router-dom";

// --- Import Icons ---
import {
  FiHome,
  FiBox,
  FiBriefcase,
  FiPackage,
  FiUsers,
  FiTag,
  FiFileText,
  FiSettings,
} from "react-icons/fi";

function Layout(): JSX.Element {
  // This function adds Tailwind/daisyUI classes to active NavLink items
  const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
    // daisyUI's "active" class on a menu item highlights it
    return isActive ? "active" : "";
  };

  return (
    <div className="flex min-h-screen bg-base-200 text-base-content">
      {/* --- Sidebar --- */}
      <aside className="w-64 bg-base-300 shadow-xl flex flex-col">
        {/* Sidebar Header/Logo */}
        <div className="p-4 text-2xl font-bold text-center border-b border-base-200">
          <NavLink to="/" className="flex items-center justify-center gap-2">
            <FiBox />
            <span>Bill Tracker</span>
          </NavLink>
        </div>

        {/* Navigation Menu */}
        <ul className="menu p-4 flex-grow">
          <li>
            <NavLink to="/" className={getNavLinkClass} end>
              <FiHome /> Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/purchase-bills" className={getNavLinkClass}>
              <FiFileText /> Purchase Bills
            </NavLink>
          </li>

          <div className="divider"></div>

          <li className="menu-title">
            <span>Management</span>
          </li>
          <li>
            <NavLink to="/master-materials" className={getNavLinkClass}>
              <FiPackage /> Master Materials
            </NavLink>
          </li>
          <li>
            <NavLink to="/suppliers" className={getNavLinkClass}>
              <FiBriefcase /> Suppliers
            </NavLink>
          </li>
          <li>
            <NavLink to="/brands" className={getNavLinkClass}>
              <FiTag /> Brands
            </NavLink>
          </li>

          <div className="divider"></div>

          <li className="menu-title">
            <span>Setup</span>
          </li>
          <li>
            <NavLink to="/sites" className={getNavLinkClass}>
              <FiUsers /> Sites
            </NavLink>
          </li>
          <li>
            <NavLink to="/item-categories" className={getNavLinkClass}>
              <FiSettings /> Item Categories
            </NavLink>
          </li>
        </ul>

        {/* Optional: Footer of Sidebar */}
        <div className="p-4 text-center text-xs border-t border-base-200">
          <p>Version 1.0</p>
        </div>
      </aside>

      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col">
        {/* Optional Top Bar inside the main content area */}
        <header className="navbar bg-base-100 shadow-sm sticky top-0 z-40">
          <div className="flex-1">
            {/* Can be used for page titles or breadcrumbs later */}
            <h1 className="text-xl font-semibold">Dashboard</h1>
          </div>
          <div className="flex-none gap-2">
            {/* User profile, notifications etc. can go here */}
            <div className="dropdown dropdown-end">
              <div
                tabIndex={0}
                role="button"
                className="btn btn-ghost btn-circle avatar"
              >
                <div className="w-10 rounded-full">
                  <img
                    alt="User Avatar"
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg"
                  />
                </div>
              </div>
              <ul
                tabIndex={0}
                className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
              >
                <li>
                  <a>Profile</a>
                </li>
                <li>
                  <a>Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </header>

        {/* The actual page content will be rendered here */}
        <main className="flex-grow p-6 bg-base-100">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
