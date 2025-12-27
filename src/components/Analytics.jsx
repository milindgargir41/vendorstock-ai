import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

function Analytics({ userId }) {
  const [analytics, setAnalytics] = useState({
    dailySales: [],
    topProducts: [],
    totalRevenue: 0,
    averageOrderValue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, [userId]);

  const fetchAnalytics = async () => {
    try {
      const salesRef = collection(db, 'sales');
      const salesQuery = query(salesRef, where('vendorId', '==', userId));
      const salesSnap = await getDocs(salesQuery);
      
      const sales = salesSnap.docs.map(doc => doc.data());
      const totalRevenue = sales.reduce((sum, s) => sum + (s.amount || 0), 0);
      const avgOrder = sales.length > 0 ? totalRevenue / sales.length : 0;
      
      const productCounts = {};
      sales.forEach(sale => {
        productCounts[sale.productId] = (productCounts[sale.productId] || 0) + sale.quantity;
      });
      
      const topProducts = Object.entries(productCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      setAnalytics({
        totalRevenue: totalRevenue.toFixed(2),
        averageOrderValue: avgOrder.toFixed(2),
        topProducts: topProducts,
        totalSales: sales.length
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading analytics...</div>;

  return (
    <div className="analytics-container">
      <h2>Analytics & Reports</h2>
      
      <div className="analytics-grid">
        <div className="analytics-card">
          <h3>Total Revenue</h3>
          <p className="value">₹{analytics.totalRevenue}</p>
        </div>
        <div className="analytics-card">
          <h3>Avg Order Value</h3>
          <p className="value">₹{analytics.averageOrderValue}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Sales</h3>
          <p className="value">{analytics.totalSales}</p>
        </div>
      </div>
      
      <div className="top-products">
        <h3>Top Selling Products</h3>
        {analytics.topProducts.length === 0 ? (
          <p>No sales data yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Product ID</th>
                <th>Units Sold</th>
              </tr>
            </thead>
            <tbody>
              {analytics.topProducts.map((product, index) => (
                <tr key={index}>
                  <td>#{index + 1}</td>
                  <td>{product[0]}</td>
                  <td>{product[1]} units</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Analytics;
