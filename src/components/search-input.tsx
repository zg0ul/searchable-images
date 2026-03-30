"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  initialQuery?: string;
  placeholder?: string;
}

export function SearchInput({
  onSearch,
  initialQuery = "",
  placeholder = "Search your images...",
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize with initial query
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Handle search submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query.trim());
  };

  // Clear the search input
  const clearSearch = () => {
    setQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-500" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-[50px] pl-12 pr-12 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </form>
  );
}
