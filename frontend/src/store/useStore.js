import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useStore = create(
  persist(
    (set, get) => ({
      // --- AUTH STATE ---
      user: null,
      token: null,
      role: 'customer',
      setUser: (user, token) => {
        let role = 'customer';
        if (user && user.email) {
          if (user.email.toLowerCase().includes('admin')) {
            role = 'admin';
          }
        }
        // If metadata has custom role
        if (user && user.user_metadata && user.user_metadata.role) {
          role = user.user_metadata.role;
        }
        set({ user, token, role });
      },
      logout: () => set({ user: null, token: null, role: 'customer', cartItems: [] }),

      // --- THEME STATE ---
      theme: 'light',
      setTheme: (theme) => {
        const root = window.document.documentElement;
        if (theme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
        set({ theme });
      },
      toggleTheme: () => {
        const currentTheme = get().theme;
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        get().setTheme(nextTheme);
      },

      // --- CART STATE ---
      cartItems: [], // [{ id, name, price, image_url, stock, quantity }]
      addToCart: (product, quantity = 1) => {
        const cartItems = get().cartItems;
        const existingItem = cartItems.find((item) => item.id === product.id);

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          // Check stock limit
          if (newQuantity > product.stock) {
            return { success: false, message: `Only ${product.stock} items available in stock.` };
          }
          set({
            cartItems: cartItems.map((item) =>
              item.id === product.id ? { ...item, quantity: newQuantity } : item
            ),
          });
        } else {
          if (quantity > product.stock) {
            return { success: false, message: `Only ${product.stock} items available in stock.` };
          }
          set({
            cartItems: [
              ...cartItems,
              {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image_url: product.image_url,
                stock: product.stock,
                quantity,
              },
            ],
          });
        }
        return { success: true, message: 'Added to cart successfully!' };
      },
      removeFromCart: (productId) => {
        set({
          cartItems: get().cartItems.filter((item) => item.id !== productId),
        });
      },
      updateCartQuantity: (productId, quantity) => {
        const cartItems = get().cartItems;
        const item = cartItems.find((i) => i.id === productId);
        if (!item) return;

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        if (quantity > item.stock) {
          return { success: false, message: `Only ${item.stock} items available in stock.` };
        }

        set({
          cartItems: cartItems.map((i) => (i.id === productId ? { ...i, quantity } : i)),
        });
        return { success: true };
      },
      clearCart: () => set({ cartItems: [] }),

      // --- CART SUMMARY CALCULATIONS ---
      getCartSubtotal: () => {
        return get().cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
      },
      getCartTax: () => {
        // 5% local e-commerce tax
        return get().getCartSubtotal() * 0.05;
      },
      getCartDeliveryCharge: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0) return 0;
        // Free delivery above ₹500
        return subtotal >= 500 ? 0 : 40;
      },
      getCartGrandTotal: () => {
        const subtotal = get().getCartSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getCartTax() + get().getCartDeliveryCharge();
      },

      // --- ORDERS STATE ---
      orders: [],
      setOrders: (orders) => set({ orders }),

      // --- PRODUCTS STATE ---
      products: [],
      setProducts: (products) => set({ products }),
    }),
    {
      name: 'local-ecommerce-storage',
      partialize: (state) => ({
        cartItems: state.cartItems,
        user: state.user,
        token: state.token,
        role: state.role,
        theme: state.theme,
      }),
    }
  )
);
