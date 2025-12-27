import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Inventory from './components/Inventory';
import Analytics from './components/Analytics';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Sign-in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h1>VendorStock AI</h1>
          <p>Inventory Management for Small Vendors</p>
          <button onClick={handleGoogleSignIn} className="btn-google">
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>VendorStock AI</h1>
        <div className="header-nav">
          <button className={currentPage === 'dashboard' ? 'active' : ''} onClick={() => setCurrentPage('dashboard')}>
            Dashboard
          </button>
          <button className={currentPage === 'products' ? 'active' : ''} onClick={() => setCurrentPage('products')}>
            Products
          </button>
          <button className={currentPage === 'inventory' ? 'active' : ''} onClick={() => setCurrentPage('inventory')}>
            Inventory
          </button>
          <button className={currentPage === 'analytics' ? 'active' : ''} onClick={() => setCurrentPage('analytics')}>
            Analytics
          </button>
        </div>
        <div className="user-info">
          <span>{user.email}</span>
          <button onClick={handleSignOut} className="btn-logout">Logout</button>
        </div>
      </header>

      <main className="app-main">
        {currentPage === 'dashboard' && <Dashboard userId={user.uid} />}
        {currentPage === 'products' && <Products userId={user.uid} />}
        {currentPage === 'inventory' && <Inventory userId={user.uid} />}
        {currentPage === 'analytics' && <Analytics userId={user.uid} />}
      </main>
    </div>
  );
}

export default App;
