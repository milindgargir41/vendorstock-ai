import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

function Inventory({ userId }) {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({ productId: '', quantity: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchData(); }, [userId]);

  const fetchData = async () => {
    try {
      const productsRef = collection(db, 'products');
      const productsQuery = query(productsRef, where('vendorId', '==', userId));
      const productsSnap = await getDocs(productsQuery);
      setProducts(productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      
      const invRef = collection(db, 'inventory');
      const invQuery = query(invRef, where('vendorId', '==', userId));
      const invSnap = await getDocs(invQuery);
      setInventory(invSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'inventory'), {
        vendorId: userId,
        productId: formData.productId,
        quantity: parseInt(formData.quantity),
        lastUpdated: new Date()
      });
      setFormData({ productId: '', quantity: '' });
      fetchData();
    } catch (error) {
      console.error('Error adding inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = async (invId, newQuantity) => {
    try {
      await updateDoc(doc(db, 'inventory', invId), {
        quantity: parseInt(newQuantity),
        lastUpdated: new Date()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  return (
    <div className="inventory-container">
      <h2>Inventory Management</h2>
      <form onSubmit={handleSubmit} className="inventory-form">
        <select value={formData.productId} onChange={(e) => setFormData({...formData, productId: e.target.value})} required>
          <option value="">Select Product</option>
          {products.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
        </select>
        <input type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Inventory'}</button>
      </form>
      <div className="inventory-list">
        <h3>Current Stock</h3>
        {inventory.length === 0 ? (
          <p>No inventory items yet.</p>
        ) : (
          <table>
            <thead><tr><th>Product</th><th>Quantity</th><th>Status</th><th>Update</th></tr></thead>
            <tbody>
              {inventory.map(item => {
                const product = products.find(p => p.id === item.productId);
                const status = item.quantity < 10 ? 'Low Stock' : item.quantity > 50 ? 'Overstocked' : 'Good';
                return (
                  <tr key={item.id} className={status.toLowerCase()}>
                    <td>{product?.name || 'Unknown'}</td>
                    <td>{item.quantity}</td>
                    <td>{status}</td>
                    <td><input type="number" value={item.quantity} onChange={(e) => handleQuantityChange(item.id, e.target.value)} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Inventory;
