'use client'

import {
  ArrowLeft, Calendar, Users, FileText, Send
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// Import your RTK Query hooks
import {
  useGetDisputeByIdQuery, useAddMessageMutation
} from '../../../store/api/disputApi'
import {Dispute} from '../types/disputeTypes'

import { use } from 'react'




export default function DisputeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // Unwrap the promise
 const { data, isLoading, refetch } = useGetDisputeByIdQuery(id);
const dispute = data?.dispute;
  const [newMessage, setNewMessage] = useState('')
  const [addMessage] = useAddMessageMutation()
console.log("dispute id page log line no 21", dispute);

  // Handle send message to backend
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      await addMessage({ disputeId:id, content: newMessage })
      setNewMessage('')
      refetch()
    }
  }

  if (isLoading || !dispute) {
    return <div>Loading...</div>
  }

  const complainant = dispute.complainant
  const respondents = dispute.respondent || []
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header code skipped for brevity ... */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex">
          {/* Sidebar ... */}
          
          {/* Main Content */}
          <main className="flex-1">
            {/* Dispute Resolution Center Header ... */}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Dispute Details */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-sm p-6 border border-orange-200 space-y-6">
                  <h2 className="text-xl font-bold text-orange-600">Dispute Details</h2>
                  <div className="border border-orange-200 rounded-xl p-5 space-y-5 bg-orange-50/20">
                    <h3 className="text-orange-600 font-medium text-base">Basic Information</h3>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Title</span>
                      <span className="text-gray-800">{dispute.title}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Category</span>
                      <span className="text-gray-800">{dispute.category}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Priority</span>
                      <span className="text-gray-800">{dispute.priority}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Filed Date</span>
                      <span className="text-gray-800">
                        {new Date(dispute.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Dispute ID</span>
                      <span className="text-gray-800">{dispute.disputeId}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Current Stage</span>
                      <span className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">
                        {dispute.currentStage}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-gray-500 text-sm block">Complainant</span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-300 rounded-full text-xs">
                        {complainant?.firstName} {complainant?.lastName}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-gray-500 text-sm block">Respondents</span>
                      {respondents.map((r: any) => (
                        <span key={r._id} className="px-3 py-1 bg-orange-50 text-orange-600 border border-orange-300 rounded-full text-xs">
                          {r.firstName} {r.lastName}
                        </span>
                      ))}
                    </div>
                    <div>
                      <span className="text-gray-500 text-sm block mb-1">Description</span>
                      <p className="text-gray-800 font-medium">{dispute.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Communication Timeline */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="bg-orange-500 text-white p-4 rounded-t-lg">
                    <h2 className="text-lg font-semibold">Communication Timeline</h2>
                  </div>

                  <div className="p-6 space-y-4 max-h-[36rem] overflow-y-auto">
                    {(dispute.messages && dispute.messages.length > 0 ? dispute.messages : []).map((msg: any) => (
                      <div key={msg._id} className="w-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full border bg-orange-50 text-orange-700 border-orange-300`}>
                            {msg.sender === complainant._id ? `${complainant.firstName} ${complainant.lastName}` : "Respondent"}
                          </span>
                          <span className="text-[11px] text-gray-400">{new Date(msg.timestamp).toLocaleString()}</span>
                        </div>
                        <div className={`w-full px-4 py-3 rounded-lg border text-sm break-words bg-orange-50 text-orange-600 border-orange-300`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
