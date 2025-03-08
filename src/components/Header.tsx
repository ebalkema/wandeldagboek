import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-green-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wandeldagboek</h1>
        <nav className="hidden md:flex space-x-6">
          <a href="#" className="hover:text-green-200">Home</a>
          <a href="#" className="hover:text-green-200">Wandelingen</a>
          <a href="#" className="hover:text-green-200">Foto's</a>
          <a href="#" className="hover:text-green-200">Over ons</a>
        </nav>
      </div>
    </header>
  );
};

export default Header; 