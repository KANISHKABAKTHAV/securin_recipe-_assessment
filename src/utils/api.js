// src/utils/api.js
const API_BASE = 'http://localhost:8000';

export const fetchRecipes = async (page = 1, limit = 15) => {
  const res = await fetch(`${API_BASE}/api/recipes?page=${page}&limit=${limit}`);
  return res.json();
};

export const searchRecipes = async (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  const res = await fetch(`${API_BASE}/api/recipes/search?${params}`);
  return res.json();
};