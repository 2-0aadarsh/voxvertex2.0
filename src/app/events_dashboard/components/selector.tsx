'use client'

import React, { useState } from 'react'
import SearchBar from './searchbar'

export default function Selector() {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [format, setFormat] = useState("");
  const [price, setPrices] = useState("");

  const categories: Record<string, string[]> = {
    "Business & Management": [
      "Entrepreneurship & Startups",
      "Marketing & Advertising",
      "Sales & Business Development",
      "Customer Relationship Management (CRM)",
      "Corporate Social Responsibility (CSR)",
      "Business Strategy & Innovation",
      "Leadership & Organizational Behavior",
      "Human Resources & Talent Management",
    ],
    "Operations & Project Management": [
      "Supply Chain & Operations Management",
      "Project Management",
      "Product Management",
    ],
    "Data & Analytics": [
      "Business Analysis & Data-Driven Decision Making",
    ],
    "Education & Training": [
      "Vocational & Technical Education",
    ],
  }

  const formats: string[] = ["Offline", "Online", "Hybrid"]
  const prices: string[] = ["Free", "Paid"]

  return (
    <div className="hidden md:flex items-center justify-center gap-3 m-2">

      <SearchBar />

      <select
        value={category}
        onChange={(e) => {
          setCategory(e.target.value)
          setSubcategory("")
        }}
        className="p-2 border rounded-lg bg-red-50 border-orange-300 text-orange-600"
      >
        <option value="">All Categories</option>
        {Object.keys(categories).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>

      <select
        value={subcategory}
        onChange={(e) => setSubcategory(e.target.value)}
        disabled={!category}
        className="p-2 border rounded-lg bg-red-50 border-orange-300 text-orange-600"
      >
        <option value="">All Subcategories</option>
        {category &&
          categories[category].map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
      </select>


      <select
        value={format}
        onChange={(e) => setFormat(e.target.value)}
        className="p-2 border rounded-lg bg-red-50 border-orange-300 text-orange-600"
      >
        <option value="">All Formats</option>
        {formats.map((fmt) => (
          <option key={fmt} value={fmt}>
            {fmt}
          </option>
        ))}
      </select>


      <select
        value={price}
        onChange={(e) => setPrices(e.target.value)}
        className="p-2 border rounded-lg bg-red-50 border-orange-300 text-orange-600"
      >
        <option value="">All Prices</option>
        {prices.map((pt) => (
          <option key={pt} value={pt}>
            {pt}
          </option>
        ))}
      </select>
    </div>
  )
}