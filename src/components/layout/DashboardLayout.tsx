import React, { type JSX } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

function DashboardLayout(): JSX.Element {
  return (
    // This is a responsive drawer layout from daisyUI.
    // It's a static sidebar on large screens (lg:drawer-open) and a hidden,
    // toggleable sidebar on smaller screens.
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main Content Area */}
      <div className="drawer-content flex flex-col bg-base-100">
        <Header
          onToggleSidebar={() => {
            const checkbox = document.getElementById(
              "app-drawer"
            ) as HTMLInputElement;
            if (checkbox) checkbox.checked = !checkbox.checked;
          }}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-base-200 overflow-y-auto">
          <Outlet /> {/* Your pages will render here */}
        </main>
      </div>

      {/* Sidebar that slides in on mobile */}
      <div className="drawer-side z-40">
        <label
          htmlFor="app-drawer"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <Sidebar />
      </div>
    </div>
  );
}

export default DashboardLayout;
