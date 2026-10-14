import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { addToCart as addRequest, getCart, removeFromCart as removeRequest, updateCartQuantity } from '../services/api.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCart();
      setCartItems(data.cart || []);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'Unable to load your cart.');
      throw requestError;
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let active = true;
    getCart().then((data) => { if (active) { setCartItems(data.cart || []); setError(''); } })
      .catch((requestError) => { if (active) setError(requestError.message || 'Unable to load your cart.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const addItem = useCallback(async (productId) => { const data = await addRequest(productId); setCartItems(data.cart || []); }, []);
  const setQuantity = useCallback(async (productId, quantity) => { const data = await updateCartQuantity(productId, quantity); setCartItems(data.cart || []); }, []);
  const removeItem = useCallback(async (productId) => { const data = await removeRequest(productId); setCartItems(data.cart || []); }, []);
  const value = useMemo(() => ({ cartItems, loading, error, refreshCart, addItem, setQuantity, removeItem, itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0), subtotal: cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0) }), [cartItems, loading, error, refreshCart, addItem, setQuantity, removeItem]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used inside CartProvider');
  return value;
}
