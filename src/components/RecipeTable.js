// src/components/RecipeTable.js
import React, { useState, useEffect } from 'react';
import { fetchRecipes, searchRecipes } from '../utils/api';

const RecipeTable = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    title: '',
    cuisine: '',
    min_rating: '',
    max_total_time: '',
    calories: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchRecipes(currentPage, limit);
      setRecipes(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, limit]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await searchRecipes(filters);
      setRecipes(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleRowClick = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const handleCloseDrawer = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Recipe Collection</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <input
          name="title"
          value={filters.title}
          onChange={handleFilterChange}
          placeholder="Search Title"
          className="border p-2 rounded"
        />
        <input
          name="cuisine"
          value={filters.cuisine}
          onChange={handleFilterChange}
          placeholder="Cuisine"
          className="border p-2 rounded"
        />
        <input
          name="min_rating"
          value={filters.min_rating}
          onChange={handleFilterChange}
          placeholder="Min Rating (e.g. 4.5)"
          className="border p-2 rounded"
        />
        <input
          name="max_total_time"
          value={filters.max_total_time}
          onChange={handleFilterChange}
          placeholder="Max Time (e.g. 60)"
          className="border p-2 rounded"
        />
        <input
          name="calories"
          value={filters.calories}
          onChange={handleFilterChange}
          placeholder="Calories (e.g. <=400)"
          className="border p-2 rounded"
        />
      </div>

      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-6 hover:bg-blue-700"
      >
        Search Recipes
      </button>

      {/* Table */}
      {loading ? (
        <p className="text-center">Loading recipes...</p>
      ) : recipes.length === 0 ? (
        <p className="text-center text-gray-500">No recipes found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Cuisine</th>
                <th className="px-4 py-2 text-left">Rating</th>
                <th className="px-4 py-2 text-left">Total Time</th>
                <th className="px-4 py-2 text-left">Serves</th>
              </tr>
            </thead>
            <tbody>
              {recipes.map(recipe => (
                <tr
                  key={recipe.id}
                  onClick={() => handleRowClick(recipe)}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-2 max-w-xs truncate">{recipe.title || "No Title"}</td>
                  <td className="px-4 py-2">{recipe.cuisine || "Unknown"}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.floor(recipe.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.12a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.12a1 1 0 00-1.175 0l-3.976 2.12c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.12c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-2">{recipe.total_time || "N/A"} min</td>
                  <td className="px-4 py-2">{recipe.serves || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {recipes.length > 0 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 disabled:opacity-50"
          >
            Previous
          </button>
          <span>Page {currentPage}</span>
          <button
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 bg-blue-600 text-white"
          >
            Next
          </button>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="border p-2"
          >
            <option value={15}>15 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      )}

      {/* Drawer */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-96 h-full shadow-lg p-6 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">{selectedRecipe.title || "Untitled"}</h2>
                <p className="text-gray-600">{selectedRecipe.cuisine || "Unknown Cuisine"}</p>
              </div>
              <button
                onClick={handleCloseDrawer}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <p><strong>Description:</strong> {selectedRecipe.description || "No description available."}</p>
            </div>

            <div className="mb-4">
              <details>
                <summary className="cursor-pointer font-medium">
                  ⏱️ Total Time: {selectedRecipe.total_time || "N/A"} min
                </summary>
                <div className="mt-2 ml-4 text-sm">
                  <p>Prep Time: {selectedRecipe.prep_time || "N/A"} min</p>
                  <p>Cook Time: {selectedRecipe.cook_time || "N/A"} min</p>
                </div>
              </details>
            </div>

            {selectedRecipe.nutrients && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">🍏 Nutrition Facts</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {Object.entries(selectedRecipe.nutrients).map(([key, value]) => (
                      <tr key={key} className="border-t">
                        <td className="py-1 font-medium">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </td>
                        <td className="py-1">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeTable;