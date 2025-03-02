import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthContainer = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
  };

  const handleAuthSuccess = (user) => {
    onAuthSuccess(user);
  };

  return (
    <div className="auth-container">
      {isLogin ? (
        <>
          <Login onLoginSuccess={handleAuthSuccess} />
          <div className="auth-toggle card">
            <p>Nog geen account?</p>
            <button onClick={toggleAuthMode} className="secondary">
              Registreer nu
            </button>
          </div>
        </>
      ) : (
        <>
          <Register onRegisterSuccess={handleAuthSuccess} />
          <div className="auth-toggle card">
            <p>Heb je al een account?</p>
            <button onClick={toggleAuthMode} className="secondary">
              Log in
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AuthContainer; 