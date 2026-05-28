import React from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ value, onChange, placeholder = 'Search everything...' }) => {
  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg glass-input border border-white/5 focus:border-brand-500/50 outline-none transition-all placeholder-slate-500 font-medium"
      />
    </div>
  );
};
export default SearchBar;
