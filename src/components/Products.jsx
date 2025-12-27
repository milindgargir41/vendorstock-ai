import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';

function Products({ userId }) {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    sku: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [userId]);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('vendorId', '==', userId));
      const snapshot = await getDocs(q);
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'products'), {
        ...formData,
        vendorId: userId,
        createdAt: new Date(),
        price: parseFloat(formData.price)
      });
      setFormData({ name: '', category: '', price: '', sku: '' });
      fetchProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'products', id));
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="products-container">
      <h2>Product Management</h2>
      
      <form onSubmit={handleSubmit} className="product-form">
        <input
          type="text"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        />
        <input
          type="number"
          placeholder="Price"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="SKU"
          value={formData.sku}
          onChange={(e) => setFormData({...formData, sku: e.target.value})}
        />
        <button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
      </form>

      <div className="products-list">
        <h3>Your Products</h3>
        {products.length === 0 ? (
          <p>No products yet. Add one to get started!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>SKU</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{product.price}</td>
                  <td>{product.sku}</td>
                  <td>
                    <button onClick={() => handleDelete(product.id)} className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Products;
