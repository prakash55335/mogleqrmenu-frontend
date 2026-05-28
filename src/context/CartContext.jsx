import { createContext, useContext, useState } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState({})

  const addItem = (item) => {
    setCart(prev => ({
      ...prev,
      [item.id]: {
        ...item,
        quantity: (prev[item.id]?.quantity || 0) + 1
      }
    }))
  }

  const removeItem = (itemId) => {
    setCart(prev => {
      const updated = { ...prev }
      if (updated[itemId]?.quantity > 1) {
        updated[itemId] = { ...updated[itemId], quantity: updated[itemId].quantity - 1 }
      } else {
        delete updated[itemId]
      }
      return updated
    })
  }

  const clearCart = () => setCart({})

  const cartItems  = Object.values(cart)
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{
      cart, cartItems, totalItems,
      totalPrice, addItem, removeItem, clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)