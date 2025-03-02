import React from 'react';

const NavigationMenu = ({ currentView, onNavigate }) => {
  return (
    <nav className="nav-menu">
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
    </nav>
  );
};

export default NavigationMenu; 