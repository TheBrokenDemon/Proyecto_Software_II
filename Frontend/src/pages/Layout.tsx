import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div>
      <Header />
      <main className="main-content">
        {/* Outlet renderizará el componente de la ruta anidada */}
        <Outlet />
      </main>
    </div>
  );
}