import React from 'react';

const NavigationMenu = ({ currentView, onNavigate }) => {
  return (
    <nav className="nav-menu">
      <div 
        className={`nav-item ${currentView === 'home' ? 'active' : ''}`} 
        onClick={() => onNavigate('home')}
      >
        <span className="nav-icon">🏡</span>
        <span className="nav-text">Home</span>
      </div>
      
      <div 
        className={`nav-item ${currentView === 'list' ? 'active' : ''}`} 
        onClick={() => onNavigate('list')}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-text">Notities</span>
      </div>
      
      <div 
        className={`nav-item ${currentView === 'map' ? 'active' : ''}`} 
        onClick={() => onNavigate('map')}
      >
        <span className="nav-icon">🗺️</span>
        <span className="nav-text">Kaart</span>
      </div>
      
      <div 
        className={`nav-item ${currentView === 'new' ? 'active' : ''}`} 
        onClick={() => onNavigate('new')}
      >
        <span className="nav-icon">✏️</span>
        <span className="nav-text">Nieuwe notitie</span>
      </div>
      
      <a 
        href="http://www.mennoenerwin.nl" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="nav-item external-link"
      >
        <span className="nav-icon">🌐</span>
        <span className="nav-text">Mennoenerwin.nl</span>
      </a>
    </nav>
  );
};

export default NavigationMenu; 