import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../firebase';

const Register = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Wachtwoorden moeten overeenkomen
    if (password !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }
    
    // Wachtwoord moet minimaal 6 tekens zijn (Firebase vereiste)
    if (password.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens bevatten.');
      return;
    }
    
    setLoading(true);

    try {
      // Maak de gebruiker aan
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Voeg de naam toe aan het gebruikersprofiel
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      onRegisterSuccess(userCredential.user);
    } catch (error) {
      console.error('Register error:', error);
      
      // Vertaal veelvoorkomende Firebase foutmeldingen
      if (error.code === 'auth/email-already-in-use') {
        setError('Dit e-mailadres is al in gebruik.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Ongeldig e-mailadres.');
      } else {
        setError('Er is een fout opgetreden bij het registreren. Probeer het opnieuw.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form card">
      <h2>Registreren bij Wandeldagboek</h2>
      
      {error && <div className="error">{error}</div>}
      
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label htmlFor="name">Naam</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            name="name"
            autoComplete="name"
            required
          />
        </div>
        
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
            name="new-password"
            autoComplete="new-password"
            required
          />
          <small className="note-help">Minimaal 6 tekens</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Bevestig wachtwoord</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            name="confirm-password"
            autoComplete="new-password"
            required
          />
        </div>
        
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Bezig met registreren...' : 'Registreren'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register; 