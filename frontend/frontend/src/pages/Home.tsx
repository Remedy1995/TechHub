import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, Category } from '../services/categoryService';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">
            Welcome to Q&A Platform
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Find answers to your questions or help others by sharing your knowledge
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Browse Categories</h2>

          {categories.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <p className="text-slate-600 text-lg">No categories available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category._id}`}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition">
                      {category.name}
                    </h3>
                    <svg
                      className="w-6 h-6 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                  {category.description && (
                    <p className="text-slate-600 line-clamp-2">{category.description}</p>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Have a Question?</h2>
          <p className="mb-6 text-blue-100">
            Ask the community and get answers from experts
          </p>
          <Link
            to="/questions/new"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            Ask a Question
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
