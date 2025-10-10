"use client";
import { useState } from "react";
import { FiSearch, FiSliders } from "react-icons/fi";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", query);
    
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center w-full max-w-md bg-red-50 border border-red-200 rounded-lg px-4 py-2 shadow-sm">
      <FiSearch className="text-orange-500 text-xl mr-2" />

    
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Speaker"
        className="flex-1 bg-transparent focus:outline-none text-orange-500 placeholder:text-orange-400"
      />

      {/* Filter Icon */}
      <FiSliders className="text-orange-500 text-xl ml-2 cursor-pointer" />
    </form>
  );
}