import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import NutritionCard from '../../components/NutritionCard';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChartBarIcon } from '@heroicons/react/24/solid';
import NutritionBlog from './NutritionBlog';

const Nutritions = () => {
  const [nutritions, setNutritions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState({
    date: new Date().toISOString().substr(0, 10),
    category: '',
    completed: false
  });
  const [items, setItems] = useState([]);
  const [itemInputs, setItemInputs] = useState({ name: '', amount: '', calories: '' });
  
  const categoryOptions = ["Proteins", "Carbs", "Fats", "Vitamins", "Others"];

  const fetchNutritions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/nutrition');
      setNutritions(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed fetching nutrition records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutritions();
  }, []);

  const handleAddItem = (e) => {
    e.preventDefault();
    const { name, amount, calories } = itemInputs;
    
    // Only validate if at least one field is filled
    if (name || amount || calories) {
      // If any field has content, validate that all required fields are filled
      if (!name || !amount || !calories) {
        toast.error('Please fill in all item fields');
        return;
      }
      
      // Add item to the list
      setItems([...items, { name, amount, calories: Number(calories) }]);
      // Clear inputs after adding
      setItemInputs({ name: '', amount: '', calories: '' });
    }
  };

  const handleDeleteItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSaveNutrition = async (e) => {
    e.preventDefault();
    
    if (!record.category) {
      toast.error('Please select a nutrition category');
      return;
    }
    
    // Check if we have any items to save
    if (items.length === 0) {
      toast.error('Please add at least one nutrition item');
      return;
    }
    
    // Check for any partially filled input that might need to be added
    const { name, amount, calories } = itemInputs;
    if (name && amount && calories) {
      // If all fields are filled, add this item before saving
      setItems(prevItems => [...prevItems, { 
        name, 
        amount, 
        calories: Number(calories) 
      }]);
      
      // Clear the input fields
      setItemInputs({ name: '', amount: '', calories: '' });
    }
    
    try {
      setLoading(true);
      const response = await api.post('/nutrition', { 
        date: record.date, 
        category: record.category, 
        items,
        completed: record.completed 
      });
      toast.success(response.data.message || 'Nutrition record added');
      setRecord({ date: new Date().toISOString().substr(0, 10), category: '', completed: false });
      setItems([]);
      fetchNutritions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add nutrition record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNutrition = async (id) => {
    try {
      setLoading(true);
      const response = await api.delete(`/nutrition/${id}`);
      toast.success(response.data.message || 'Nutrition record deleted');
      fetchNutritions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete nutrition record');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (nutrition) => {
    try {
      setLoading(true);
      const newStatus = !nutrition.completed;
      const response = await api.put(`/nutrition/${nutrition._id}/complete`, { completed: newStatus });
      toast.success(response.data.message || 'Nutrition record updated');
      if (newStatus && new Date(nutrition.date).toDateString() === new Date().toDateString()) {
        toast.success('Congratulations! You have completed your nutrition for today.');
      }
      fetchNutritions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update nutrition record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-6">
      <NutritionBlog/>
      <ToastContainer />
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <ChartBarIcon className="h-8 w-8 text-emerald-600" />
          <h1 className="text-3xl font-bold text-gray-800">My Daily Nutrition</h1>
        </div>

        {/* Nutrition Record Form */}
        <form onSubmit={handleSaveNutrition} className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Add New Nutrition Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="date"
              value={record.date}
              onChange={(e) => setRecord({...record, date: e.target.value})}
              className="p-2 border rounded"
              required
            />
            <select 
              value={record.category}
              onChange={(e) => setRecord({...record, category: e.target.value})}
              className="p-2 border rounded"
              required
            >
              <option value="">Select Category</option>
              {categoryOptions.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                checked={record.completed}
                onChange={(e) => setRecord({...record, completed: e.target.checked})}
                className="form-checkbox h-5 w-5 text-green-600"
              />
              <label className="text-gray-700">Mark as complete</label>
            </div>
          </div>
          
          {/* Nutrition Items Section */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xl font-semibold">Nutrition Items</h3>
              <span className="text-sm text-gray-500">{items.length} items added</span>
            </div>
            
            {/* Show the current items */}
            {items.length > 0 && (
              <ul className="mb-4 space-y-2 max-h-40 overflow-y-auto">
                {items.map((itm, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <span>{itm.name} – {itm.amount} – {itm.calories} kcal</span>
                    <button 
                      type="button"
                      onClick={() => handleDeleteItem(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
            
            {/* Quick add button to add a default item for convenience */}
            {items.length === 0 && (
              <button
                type="button"
                onClick={() => setItems([{ name: 'Default Item', amount: '100g', calories: 100 }])}
                className="mb-4 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
              >
                + Add Default Item
              </button>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input 
                type="text"
                value={itemInputs.name}
                onChange={(e) => setItemInputs({ ...itemInputs, name: e.target.value })}
                placeholder="Item Name"
                className="p-2 border rounded"
              />
              <input 
                type="text"
                value={itemInputs.amount}
                onChange={(e) => setItemInputs({ ...itemInputs, amount: e.target.value })}
                placeholder="Amount (e.g., 200g)"
                className="p-2 border rounded"
              />
              <input 
                type="number"
                value={itemInputs.calories}
                onChange={(e) => setItemInputs({ ...itemInputs, calories: e.target.value })}
                placeholder="Calories"
                className="p-2 border rounded"
              />
            </div>
            <button 
              onClick={handleAddItem}
              type="button"
              className="mt-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Add Item
            </button>
          </div>
          
          <button 
            type="submit" 
            className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            disabled={loading || items.length === 0}
          >
            {loading ? 'Processing...' : 'Save Nutrition'}
          </button>
        </form>

        {/* Nutrition Records List using NutritionCard */}
        <div className="grid grid-cols-1 gap-6">
          {loading && <div>Loading...</div>}
          {nutritions.map(nutrition => (
            <NutritionCard 
              key={nutrition._id}
              nutrition={nutrition}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteNutrition}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Nutritions;