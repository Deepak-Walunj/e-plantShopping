import { createSlice } from '@reduxjs/toolkit';

export const CartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [], // Initialize items as an empty array
    addedItems: [],
  },
  reducers: {
    addItem: (state, action) => {
      // console.log(action.payload)
      const {name, image, cost} = action.payload
      // console.log(name, image, cost)
      const existingItem = state.items.find(item => item.name === name)
      if (existingItem){
        existingItem.quantity++
      }
      else{
        state.items.push({ name, image, cost: Number(cost) || 0, quantity: 1 });
      }
      state.addedItems = { ...state.addedItems, [name]: true };
    },
    removeItem: (state, action) => {
      state.items = state.items.filter(item => item.name !== action.payload)
      const newAddedItems = { ...state.addedItems };
      delete newAddedItems[action.payload]; // Remove key safely
      state.addedItems = newAddedItems;
    },
    updateQuantity: (state, action) => {
      const {name, quantity} = action.payload
      const itemToUpdate = state.items.find(item => item.name === name)
      if (itemToUpdate){
        itemToUpdate.quantity = quantity
      }
    },
  },
});

export const { addItem, removeItem, updateQuantity } = CartSlice.actions;

export default CartSlice.reducer;
