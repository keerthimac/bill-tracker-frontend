import React, { type JSX } from 'react';
import { Link, Outlet } from 'react-router-dom';

// Basic styling for the navbar (can be moved to a CSS file)
const navStyle: React.CSSProperties = {
    backgroundColor: '#f0f0f0',
    padding: '10px 20px',
    marginBottom: '20px',
};

const ulStyle: React.CSSProperties = {
    listStyleType: 'none',
    margin: 0,
    padding: 0,
    display: 'flex',
    gap: '20px',
};

const linkStyle: React.CSSProperties = {
    textDecoration: 'none',
    color: '#333',
    fontWeight: 'bold',
};

function Layout(): JSX.Element {
    return (
        <div>
            <nav style={navStyle}>
                <ul style={ulStyle}>
                    <li><Link to="/" style={linkStyle}>Home</Link></li>
                    <li><Link to="/sites" style={linkStyle}>Sites</Link></li>
                    <li><Link to="/item-categories" style={linkStyle}>Item Categories</Link></li>
                    <li><Link to="/suppliers" style={linkStyle}>Suppliers</Link></li>
                    {/* Add link for Purchase Bills later */}
                    {/* <li><Link to="/purchase-bills" style={linkStyle}>Purchase Bills</Link></li> */}
                </ul>
            </nav>
            <main style={{ padding: '0 20px' }}>
                <Outlet /> {/* Child routes will render here */}
            </main>
        </div>
    );
}

export default Layout;