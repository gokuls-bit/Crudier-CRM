import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass } from '@phosphor-icons/react';

export const SearchBar = ({ placeholder = 'Search tasks, leads, knowledge...' }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <MagnifyingGlass className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-xs rounded-md bg-[#F4F5F7] border border-[#E0E3E8] focus:border-[#00A9CE] focus:bg-white text-[#1C2945] outline-none transition-all placeholder-slate-400 font-medium"
      />
    </form>
  );
};

export default SearchBar;
