import React, { type JSX } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiFileText,
  FiPackage,
  FiBriefcase,
  FiTag,
  FiUsers,
  FiSettings,
} from "react-icons/fi";

const getNavLinkClass = ({ isActive }: { isActive: boolean }): string => {
  return `flex items-center p-3 rounded-lg hover:bg-primary hover:text-primary-content transition-colors duration-200 ease-in-out ${
    isActive
      ? "active bg-primary text-primary-content font-semibold shadow-lg"
      : "text-base-content/80"
  }`;
};

function Sidebar(): JSX.Element {
  const logoUrl = "/assets/logo.png"; // Make sure you have a logo in `public/assets/`

  return (
    <ul className="menu p-4 w-64 min-h-full bg-base-100 text-base-content shadow-lg">
      <li className="menu-title mb-2 flex items-center gap-2 px-0">
        <img src={logoUrl} alt="Logo" className="h-10 w-auto" />
        <span className="font-semibold text-lg text-primary">Bill Tracker</span>
      </li>

      <li>
        <NavLink to="/" className={getNavLinkClass} end>
          <FiHome className="mr-3 text-xl" /> Dashboard
        </NavLink>
      </li>
      <li>
        <NavLink to="/purchase-bills" className={getNavLinkClass}>
          <FiFileText className="mr-3 text-xl" /> Purchase Bills
        </NavLink>
      </li>

      <div className="divider"></div>

      <li className="menu-title">
        <span>Management</span>
      </li>
      <li>
        <NavLink to="/master-materials" className={getNavLinkClass}>
          <FiPackage className="mr-3 text-xl" /> Master Materials
        </NavLink>
      </li>
      <li>
        <NavLink to="/suppliers" className={getNavLinkClass}>
          <FiBriefcase className="mr-3 text-xl" /> Suppliers
        </NavLink>
      </li>
      <li>
        <NavLink to="/brands" className={getNavLinkClass}>
          <FiTag className="mr-3 text-xl" /> Brands
        </NavLink>
      </li>
      <li>
        <NavLink to="/sites" className={getNavLinkClass}>
          <FiUsers className="mr-3 text-xl" /> Sites
        </NavLink>
      </li>
      <li>
        <NavLink to="/item-categories" className={getNavLinkClass}>
          <FiSettings className="mr-3 text-xl" /> Item Categories
        </NavLink>
      </li>
      <li>
        <NavLink to="/supplier-prices" className={getNavLinkClass}>
          <span className="text-xl mr-3">$</span> Supplier Prices
        </NavLink>
      </li>
    </ul>
  );
}

export default Sidebar;
