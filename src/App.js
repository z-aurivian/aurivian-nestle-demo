import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import ClaimSubstantiationDemo from './ClaimSubstantiationDemo';
import Dashboard from './Dashboard';
import AuriChat from './AuriChat';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <nav className="border-b flex justify-center gap-6 py-3" style={{ borderColor: '#2D2C2C', backgroundColor: '#111111' }}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-aurivian-blue text-white' : 'text-aurivian-gray hover:text-aurivian-white'}`
            }
            end
          >
            Demo
          </NavLink>
          <NavLink
            to="/auri"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-aurivian-blue text-white' : 'text-aurivian-gray hover:text-aurivian-white'}`
            }
          >
            Auri
          </NavLink>
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-4 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-aurivian-blue text-white' : 'text-aurivian-gray hover:text-aurivian-white'}`
            }
          >
            Dashboard
          </NavLink>
        </nav>
        <Routes>
          <Route path="/" element={<ClaimSubstantiationDemo />} />
          <Route path="/auri" element={<AuriChat />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
