import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Dashboard({ userId }) {
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    totalSales: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsRef = collection(db, 'products');
        const productsQuery = query(productsRef, where('vendorId', '==', userId));
        const productsSnap = await getDocs(productsQuery);
        
        const inventoryRef = collection(db, 'inventory');
        const inventoryQuery = query(inventoryRef, where('vendorId', '==', userId));
        const inventorySnap = await getDocs(inventoryQuery);
        
        const lowStockCount = inventorySnap.docs.filter(doc => doc.data().quantity < 10).length;
        
        const salesRef = collection(db, 'sales');
        const salesQuery = query(salesRef, where('vendorId', '==', userId));
        const salesSnap = await getDocs(salesQuery);
        
        const totalRevenue = salesSnap.docs.reduce((sum, doc) => sum + (doc.data().amount || 0), 0);
        
        setStats({
          totalProducts: productsSnap.size,
          lowStock: lowStockCount,
          totalSales: salesSnap.size,
          revenue: totalRevenue.toFixed(2)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [userId]);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p className="stat-value">{stats.totalProducts}</p>
        </div>
        <div className="stat-card low-stock">
          <h3>Low Stock Items</h3>
          <p className="stat-value">{stats.lowStock}</p>
        </div>
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p className="stat-value">{stats.totalSales}</p>
        </div>
        <div className="stat-card revenue">
          <h3>Revenue</h3>
          <p className="stat-value">₹{stats.revenue}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
