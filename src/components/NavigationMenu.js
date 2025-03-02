import React from 'react';

const NavigationMenu = ({ currentView, onNavigate }) => {
  return (
    <nav className="nav-menu">
      <div 
        className={`nav-item ${currentView === 'home' ? 'active' : ''}`} 
        onClick={() => onNavigate('home')}
      >
        Home
      </div>
      
      <div 
        className={`nav-item ${currentView === 'list' ? 'active' : ''}`} 
        onClick={() => onNavigate('list')}
      >
        Wandelnotities
      </div>
      
      <div 
        className={`nav-item ${currentView === 'map' ? 'active' : ''}`} 
        onClick={() => onNavigate('map')}
      >
        Kaartweergave
      </div>
      
      <div 
        className={`nav-item ${currentView === 'new' ? 'active' : ''}`} 
        onClick={() => onNavigate('new')}
      >
        Nieuwe Notitie
      </div>
      
      <a 
        href="http://www.mennoenerwin.nl" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="nav-item external-link"
      >
        Mennoenerwin.nl
      </a>
    </nav>
  );
};

export default NavigationMenu; 