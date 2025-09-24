import React from 'react'
import { Calendar } from 'lucide-react'

interface CoreDetailsStepProps {
  formData: {
    eventName: string
    startDate: string
    endDate: string
    eventMode: 'offline' | 'online' | 'hybrid'
    format: string
    location: string
    eventUrl: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void
}

export default function CoreDetailsStep({ formData, onInputChange }: CoreDetailsStepProps) {
  const formatOptions = [
    "Conferences & Summits",
    "Seminars", 
    "Keynote Speeches",
    "Fireside Chats",
    "Town Halls & Open Forums",
    "Leadership Retreats",
    "Networking Events",
    "Trade Shows & Expos",
    "Product Launches",
    "Sales Kick-Offs (SKOs)",
    "Award Ceremonies & Galas",
    "Workshops & Masterclasses",
    "Corporate Training",
    "Guest Lectures",
    "TED-Style Talks",
    "1:1 Sessions",
    "Mentorship Session",
    "Pitch Competitions & Startup Showcases",
    "Hackathons & Innovations Jams",
    "Charity & Fundraising Events"
  ]

  return (
    <div className="w-full bg-white rounded-lg p-8">
      <div className="w-full space-y-8">
        {/* Event Title */}
        <div className="relative">
          <input
            type="text"
            id="eventName"
            name="eventName"
            value={formData.eventName}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white peer"
            placeholder="Enter event name"
          />
          <label 
            htmlFor="eventName" 
            className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
            style={{ color: '#FF6B35' }}
          >
            Event Title *
          </label>
        </div>

        {/* Start Date and End Date */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative w-full">
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <label 
              htmlFor="startDate" 
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
              style={{ color: '#FF6B35' }}
            >
              Start Date *
            </label>
            <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="relative w-full">
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:w-5 [&::-webkit-calendar-picker-indicator]:h-5 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            />
            <label 
              htmlFor="endDate" 
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
              style={{ color: '#FF6B35' }}
            >
              End Date *
            </label>
            <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Event Mode */}
        <div className="relative w-full">
          <select
            name="eventMode"
            value={formData.eventMode}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white appearance-none"
          >
            <option value="">Choose</option>
            <option value="offline">Offline</option>
            <option value="online">Online</option>
            <option value="hybrid">Hybrid</option>
          </select>
          <label 
            className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
            style={{ color: '#FF6B35' }}
          >
            Event Mode *
          </label>
          <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Format */}
        <div className="relative w-full">
          <select
            id="format"
            name="format"
            value={formData.format}
            onChange={onInputChange}
            required
            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white appearance-none"
          >
            <option value="">Choose</option>
            {formatOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <label 
            htmlFor="format" 
            className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
            style={{ color: '#FF6B35' }}
          >
            Format *
          </label>
          <div className="absolute right-3 top-2 text-gray-400 pointer-events-none">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* Dynamic Location/URL fields based on Event Mode */}
        {formData.eventMode === 'offline' && (
          <div className="relative w-full">
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
              placeholder="Enter event location"
            />
            <label 
              htmlFor="location" 
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
              style={{ color: '#FF6B35' }}
            >
              Location *
            </label>
          </div>
        )}

        {formData.eventMode === 'online' && (
          <div className="relative w-full">
            <input
              type="url"
              id="eventUrl"
              name="eventUrl"
              value={formData.eventUrl}
              onChange={onInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
              placeholder="Enter event URL"
            />
            <label 
              htmlFor="eventUrl" 
              className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
              style={{ color: '#FF6B35' }}
            >
              Event URL *
            </label>
          </div>
        )}

        {formData.eventMode === 'hybrid' && (
          <div className="w-full space-y-6">
            <div className="relative w-full">
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
                placeholder="Enter event location"
              />
              <label 
                htmlFor="location" 
                className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
                style={{ color: '#FF6B35' }}
              >
                Location *
              </label>
            </div>
            <div className="relative w-full">
              <input
                type="url"
                id="eventUrl"
                name="eventUrl"
                value={formData.eventUrl}
                onChange={onInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B35] focus:border-[#FF6B35] bg-white"
                placeholder="Enter event URL"
              />
              <label 
                htmlFor="eventUrl" 
                className="absolute -top-2 left-3 bg-white px-1 text-sm font-medium pointer-events-none" 
                style={{ color: '#FF6B35' }}
              >
                Event URL *
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}