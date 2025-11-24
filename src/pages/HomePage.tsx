import { type JSX } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiPackage, FiBriefcase, FiTrendingUp, FiShoppingCart, FiDollarSign } from 'react-icons/fi';

function HomePage(): JSX.Element {
  // Mock data - replace with real data from your store
  const stats = [
    { 
      label: 'Total Purchase Bills', 
      value: '248', 
      change: '+12%', 
      icon: <FiFileText />, 
      color: 'blue',
      link: '/purchase-bills'
    },
    { 
      label: 'Master Materials', 
      value: '1,234', 
      change: '+8%', 
      icon: <FiPackage />, 
      color: 'green',
      link: '/master-materials'
    },
    { 
      label: 'Active Suppliers', 
      value: '42', 
      change: '+3', 
      icon: <FiBriefcase />, 
      color: 'teal',
      link: '/suppliers'
    },
    { 
      label: 'Monthly Spending', 
      value: '$45.2K', 
      change: '-5%', 
      icon: <FiDollarSign />, 
      color: 'purple',
      link: '/purchase-bills'
    },
  ];

  const quickActions = [
    { label: 'New Purchase Bill', icon: <FiShoppingCart />, color: 'blue', link: '/purchase-bills/add' },
    { label: 'Add Material', icon: <FiPackage />, color: 'green', link: '/master-materials' },
    { label: 'Add Supplier', icon: <FiBriefcase />, color: 'teal', link: '/suppliers' },
    { label: 'View Reports', icon: <FiTrendingUp />, color: 'purple', link: '/purchase-bills' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">
          Dashboard Overview
        </h1>
        <p className="text-slate-600">Welcome back! Here's what's happening with your inventory.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Link 
            key={index} 
            to={stat.link}
            className={`card-clean card-${stat.color} p-6 hover:shadow-lg transition-all group`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-100 flex items-center justify-center text-${stat.color}-600 text-xl group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <span className={`text-sm font-semibold ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions - Enhanced Design */}
      <div className="card-clean p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-slate-800">Quick Actions</h2>
            <p className="text-sm text-slate-500 mt-1">Frequently used actions for faster workflow</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.link}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-white to-slate-50 border-2 border-slate-100 hover:border-slate-200 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Colored accent bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
                action.color === 'blue' ? 'from-blue-400 to-blue-600' :
                action.color === 'green' ? 'from-green-400 to-green-600' :
                action.color === 'teal' ? 'from-teal-400 to-teal-600' :
                'from-purple-400 to-purple-600'
              }`}></div>
              
              {/* Icon with gradient background */}
              <div className="mb-4">
                <div className={`inline-flex w-14 h-14 rounded-xl items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300 ${
                  action.color === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                  action.color === 'green' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                  action.color === 'teal' ? 'bg-gradient-to-br from-teal-500 to-teal-600' :
                  'bg-gradient-to-br from-purple-500 to-purple-600'
                }`}>
                  {action.icon}
                </div>
              </div>
              
              {/* Text content */}
              <div>
                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-slate-900">
                  {action.label}
                </h3>
                <p className="text-xs text-slate-500">
                  {action.color === 'blue' ? 'Create new purchase record' :
                   action.color === 'green' ? 'Add inventory item' :
                   action.color === 'teal' ? 'Register new supplier' :
                   'View analytics & insights'}
                </p>
              </div>
              
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-clean p-6">
          <h2 className="text-xl font-heading font-bold text-slate-800 mb-4">Recent Purchase Bills</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
                  <FiFileText />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800">Bill #PB-2024-{1000 + item}</p>
                  <p className="text-xs text-slate-500">Supplier ABC Ltd • 2 hours ago</p>
                </div>
                <span className="text-sm font-semibold text-slate-700">$1,234</span>
              </div>
            ))}
          </div>
          <Link to="/purchase-bills" className="btn btn-ghost btn-sm w-full mt-4 text-blue-600 hover:bg-blue-50">
            View All Bills →
          </Link>
        </div>

        <div className="card-clean p-6">
          <h2 className="text-xl font-heading font-bold text-slate-800 mb-4">Top Materials</h2>
          <div className="space-y-3">
            {[
              { name: 'Steel Rods', qty: '1,234 units', color: 'green' },
              { name: 'Cement Bags', qty: '856 units', color: 'orange' },
              { name: 'Paint Cans', qty: '432 units', color: 'pink' },
            ].map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className={`w-10 h-10 rounded-lg bg-${item.color}-100 flex items-center justify-center text-${item.color}-600`}>
                  <FiPackage />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.qty}</p>
                </div>
                <span className={`badge badge-${item.color}`}>In Stock</span>
              </div>
            ))}
          </div>
          <Link to="/master-materials" className="btn btn-ghost btn-sm w-full mt-4 text-blue-600 hover:bg-blue-50">
            View All Materials →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HomePage;