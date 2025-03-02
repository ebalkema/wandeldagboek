import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
    } catch (error) {
      console.error('Login error:', error);
      setError(
        error.code === 'auth/invalid-credential' 
          ? 'Ongeldige email of wachtwoord.' 
          : 'Er is een fout opgetreden bij het inloggen. Probeer het opnieuw.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form card">
      <h2>Inloggen bij Wandeldagboek</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            name="email"
            autoComplete="email"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Wachtwoord</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            name="password"
            autoComplete="current-password"
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Bezig met inloggen...' : 'Inloggen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login; 