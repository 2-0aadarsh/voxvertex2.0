"use client"
import React, { useState, useEffect } from "react"
import Image from "next/image"
import { FaCalendar, FaUser } from "react-icons/fa6"
import { useAuth } from '@/store/hooks'
import { 
  useRegisterForEnhancedEventMutation,
  useVerifyEnhancedEventPaymentMutation 
} from '@/store/slices/enhancedEventSlice'

// Load Razorpay script
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface EnhancedEvent {
  _id: string
  eventName: string
  description: string
  bannerImage: string
  startDate: string
  endDate: string
  eventMode: 'offline' | 'online' | 'hybrid'
  location?: string
  eventUrl?: string
  format: string
  ticketTypes: Array<{
    _id: string
    name: string
    price: number
    quantity: number
    features: string[]
    discount?: {
      enabled: boolean
      name?: string
      type?: 'percentage' | 'fixed'
      value?: number
      code?: string
    }
  }>
  speakers: {
    manualSpeakers: Array<{
      name: string
      title: string
      bio: string
      image?: string
    }>
    platformSpeakers: Array<{
      speakerId: string
      speakerDetails: {
        fullName: string
        professionalTitle: string
        profileImageUrl: string
      }
    }>
  }
  organizer: {
    _id: string
    firstName: string
    lastName: string
    profileImageUrl?: string
  }
}

interface EventBoxProps {
  event: EnhancedEvent
}

export default function EventBox({ event }: EventBoxProps) {
  const { user } = useAuth()
  const [registerForEvent] = useRegisterForEnhancedEventMutation()
  const [verifyPayment] = useVerifyEnhancedEventPaymentMutation()
  
  const [open, setOpen] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<any>(null)
  const [step, setStep] = useState(0)
  const [participants, setParticipants] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [registrationData, setRegistrationData] = useState<any>(null)
  
  // Primary participant form state
  const [primaryParticipant, setPrimaryParticipant] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Transform event ticket types to match component expectations
  const tickets = event.ticketTypes.map(ticket => ({
    id: ticket._id,
    title: ticket.name,
    price: `₹${ticket.price.toLocaleString()}`,
    oldPrice: ticket.discount?.enabled && ticket.discount?.type === 'percentage' && ticket.discount?.value
      ? `₹${Math.round(ticket.price / (1 - ticket.discount.value / 100)).toLocaleString()}` 
      : undefined,
    save: ticket.discount?.enabled && ticket.discount?.value
      ? ticket.discount.type === 'percentage' 
        ? `${ticket.discount.value}% off`
        : `₹${ticket.discount.value} off`
      : undefined,
    spots: `${ticket.quantity} spots available`,
    features: ticket.features || [],
    quantity: ticket.quantity
  }))

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Set initial selected ticket
  useEffect(() => {
    if (tickets.length > 0 && !selectedTicket) {
      setSelectedTicket(tickets[0])
    }
  }, [tickets, selectedTicket])

  // Populate primary participant form with user data
  useEffect(() => {
    if (user) {
      console.log('🔍 User data for registration:', user)
      setPrimaryParticipant({
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email || '',
        phone: user.mobileNo || ''
      })
    }
  }, [user])

  const steps = ["Tickets", "Details", "Payment", "Complete"]

  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket)
  }

  // Calculate total including 2% platform fee
  const subtotal = selectedTicket ? parseInt(selectedTicket.price.replace(/₹|,/g, "")) : 0
  const platformFee = Math.round(subtotal * 0.02)
  const total = subtotal + platformFee
  const save = selectedTicket?.save || "0"

  // Handle registration
  const handleRegistration = async () => {
    if (!user || !selectedTicket) return

    // Validate primary participant data
    if (!primaryParticipant.name.trim() || !primaryParticipant.email.trim() || !primaryParticipant.phone.trim()) {
      alert('Please fill in all required fields for the primary participant.')
      return
    }

    // Validate additional participants
    const invalidParticipants = participants.filter(p => !p.name.trim() || !p.email.trim() || !p.phone.trim())
    if (invalidParticipants.length > 0) {
      alert('Please fill in all required fields for all additional participants.')
      return
    }

    setIsLoading(true)
    try {
      const registrant = {
        name: primaryParticipant.name.trim(),
        email: primaryParticipant.email.trim(),
        phone: primaryParticipant.phone.trim()
      }

      console.log('🚀 Registration data being sent:', {
        eventId: event._id,
        ticketTierId: selectedTicket.id,
        registrant,
        additionalParticipants: participants
      })

      const response = await registerForEvent({
        eventId: event._id,
        ticketTierId: selectedTicket.id,
        registrant,
        additionalParticipants: participants
      }).unwrap()

      if (response.success) {
        setRegistrationData(response.data)
        setStep(2) // Move to payment step
      }
    } catch (error) {
      console.error('Registration failed:', error)
      alert('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Razorpay payment
  const handlePayment = async () => {
    if (!registrationData?.paymentOrder) {
      alert('Payment order not found. Please try again.')
      return
    }

    try {
      const options = {
        key: 'rzp_test_ROdEsIazD0xmRD', // Your Razorpay test key
        amount: registrationData.paymentOrder.amount,
        currency: registrationData.paymentOrder.currency,
        name: "VoxVertex",
        description: `Registration for ${event.eventName}`,
        order_id: registrationData.paymentOrder.id,
        handler: async function (response: any) {
          try {
            // Verify payment
            await verifyPayment({
              registrationId: registrationData.registrationId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }).unwrap()

            setStep(3) // Move to completion step
            alert('Payment successful! Registration confirmed.')
          } catch (error) {
            console.error('Payment verification failed:', error)
            alert('Payment verification failed. Please contact support.')
          }
        },
        prefill: {
          name: primaryParticipant.name,
          email: primaryParticipant.email,
        },
        theme: {
          color: "#FF6B35",
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error('Payment initialization failed:', error)
      alert('Payment initialization failed. Please try again.')
    }
  }

  return (
    <>
      {/* Event Card */}
      <div className="border-2 border-gray-200 rounded-xl shadow-md overflow-hidden relative hover:shadow-lg transition-shadow duration-300 w-full max-w-sm mx-auto">
        {/* Image */}
        <div className="relative">
          <Image 
            src={event.bannerImage || "/image.jpg"} 
            alt={event.eventName} 
            width={400} 
            height={200} 
            className="w-full h-48 object-cover rounded-t-xl" 
          />
          {selectedTicket?.save && (
            <div className="absolute top-3 left-[-25px] bg-orange-600 text-white text-xs font-bold px-8 py-1 transform -rotate-45 shadow-md">
              {selectedTicket.save}
            </div>
          )}
          <span className={`absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-md shadow ${
            event.eventMode === 'online' ? 'bg-blue-500' : 
            event.eventMode === 'offline' ? 'bg-green-500' : 'bg-purple-500'
          }`}>
            {event.eventMode.charAt(0).toUpperCase() + event.eventMode.slice(1)}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <h2 className="text-black text-lg font-bold leading-tight">{event.eventName}</h2>

          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FaCalendar className="w-4 h-4" />
            <span>{new Date(event.startDate).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric', 
              year: 'numeric' 
            })}</span>
          </div>

          <div className="flex items-center gap-2 text-orange-500 text-sm">
            <FaUser className="w-4 h-4" />
            <span>{event.speakers.manualSpeakers.length + event.speakers.platformSpeakers.length} Speakers</span>
          </div>

          <div className="flex -space-x-2 items-center pt-2">
            {/* Show speaker images */}
            {[...event.speakers.manualSpeakers.slice(0, 3), ...event.speakers.platformSpeakers.slice(0, 2)].map((speaker, index) => (
              <img 
                key={index}
                className="w-8 h-8 rounded-full border-2 border-white" 
                src={'image' in speaker ? speaker.image : ('speakerDetails' in speaker ? speaker.speakerDetails.profileImageUrl : "/profile.png") || "/profile.png"} 
                alt={'name' in speaker ? speaker.name : ('speakerDetails' in speaker ? speaker.speakerDetails.fullName : "Speaker")} 
              />
            ))}
            {(event.speakers.manualSpeakers.length + event.speakers.platformSpeakers.length) > 5 && (
              <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                +{(event.speakers.manualSpeakers.length + event.speakers.platformSpeakers.length) - 5}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <button className="border border-orange-600 bg-orange-100 text-orange-600 px-4 py-1 rounded-3xl text-sm font-medium">
              {event.format}
            </button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <h2 className="text-orange-500 text-xl font-bold">
              ₹{Math.min(...event.ticketTypes.map(t => t.price)).toLocaleString()}
            </h2>
            <h2 className="text-gray-500 text-sm">onwards</h2>
          </div>

          <p className="text-gray-800 text-sm leading-relaxed pt-2">
            {event.description.length > 100 ? event.description.substring(0, 100) + '...' : event.description}
          </p>

          <div className="flex gap-3 pt-4">
            <button className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
              View Details
            </button>
            <button
              onClick={() => {
                setOpen(true)
                setStep(0)
              }}
              className="flex-1 bg-orange-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-orange-700 transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)}></div>

          <div className="relative bg-white rounded-xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto z-10">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
              <div className="text-center">
                <p className="text-orange-500 text-xl font-semibold">AI & Machine Learning Summit 2025</p>
                <p className="text-gray-500 text-sm mt-1">Choose your ticket</p>
              </div>
              
              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-6">
                {steps.map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold ${
                        i === step ? "bg-orange-600 text-white" : "bg-gray-200 text-gray-600"
                      }`}>
                        {i + 1}
                      </div>
                      <p className="mt-2 text-sm font-medium text-gray-700">{s}</p>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 ${i < step ? "bg-orange-600" : "bg-gray-200"}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 0 - Ticket Selection */}
              {step === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Ticket Selection - 2 columns */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h2 className="text-xl font-semibold text-orange-600 mb-2">Select Your Ticket</h2>
                      <p className="text-gray-600 text-sm mb-6">
                        Choose the ticket tier that best fits your needs
                      </p>

                      <div className="space-y-4">
                        {tickets.map((ticket, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleSelectTicket(ticket)}
                            className={`border-2 rounded-xl p-5 cursor-pointer transition-all ${
                              selectedTicket?.title === ticket.title 
                                ? "border-orange-500 bg-orange-50" 
                                : "border-gray-200 hover:border-orange-300"
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className="text-2xl font-bold text-orange-600">{ticket.price}</span>
                                  {ticket.oldPrice && (
                                    <span className="text-gray-400 line-through text-sm">{ticket.oldPrice}</span>
                                  )}
                                  {ticket.save && (
                                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded">
                                      Save {ticket.save}
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-600 text-sm mb-3">👥 {ticket.spots}</p>
                                <ul className="space-y-2 text-gray-700 text-sm">
                                  {ticket.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-orange-500 mt-0.5">✔</span>
                                      <span>{f}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <input
                                type="radio"
                                name="ticket"
                                checked={selectedTicket?.title === ticket.title}
                                readOnly
                                className="w-5 h-5 text-orange-500 mt-1"
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-700 mb-4">
                          Selected: <span className="font-semibold text-orange-600">{selectedTicket?.title}</span>
                        </p>
                        <button
                          onClick={() => setStep(1)}
                          disabled={!selectedTicket}
                          className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          Continue to Details
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - 1 column */}
                  <div className="space-y-6">
                    {/* Order Summary */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{selectedTicket?.title}</span>
                          <span className="text-orange-600 font-bold">{selectedTicket?.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>{selectedTicket?.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Platform Fee (2%)</span>
                          <span>₹38</span>
                        </div>
                        <hr className="my-3" />
                        <div className="flex justify-between font-semibold text-orange-600">
                          <span>Total</span>
                          <span>₹1,937</span>
                        </div>
                        <p className="text-green-600 text-sm font-medium">You save ₹600!</p>
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>📅 Sep 16, 2025</p>
                        <p>⏰ 9:00 AM</p>
                        <p>📍 Hybrid - Mumbai, India</p>
                      </div>
                    </div>

                    {/* Featured Speakers */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Featured Speakers</h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map((id) => (
                          <div key={id} className="flex items-center gap-3">
                            <Image
                              src="/profile.png"
                              alt="Speaker"
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium text-sm text-gray-900">Sarah Johnson</p>
                              <p className="text-xs text-gray-500">AI Researcher</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1 - Registration Details */}
              {step === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Registration Form - 2 columns */}
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h2 className="text-xl font-semibold text-orange-600 mb-6">Registration Details</h2>

                      {/* Primary Participant */}
                      <div className="mb-8">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Primary Participant{" "}
                          <span className="text-sm text-gray-500 font-normal">
                            (Event tickets will be sent here)
                          </span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={primaryParticipant.name}
                            onChange={(e) => setPrimaryParticipant(prev => ({ ...prev, name: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            placeholder="Phone No."
                            value={primaryParticipant.phone}
                            onChange={(e) => setPrimaryParticipant(prev => ({ ...prev, phone: e.target.value }))}
                            className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          />
                        </div>
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={primaryParticipant.email}
                          onChange={(e) => setPrimaryParticipant(prev => ({ ...prev, email: e.target.value }))}
                          className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                      </div>

                      {/* Additional Participants */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-900 mb-4">
                          Additional Participant{" "}
                          <span className="text-sm text-gray-500 font-normal">
                            ({participants.length}/10)
                          </span>
                        </h3>

                        {participants.length === 0 ? (
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <p className="text-gray-500 mb-4">No additional participants added</p>
                            <button
                              onClick={() => setParticipants([...participants, { name: "", email: "", phone: "" }])}
                              className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                            >
                              + Add Participant
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {participants.map((p, index) => (
                              <div key={index} className="border border-orange-200 rounded-lg p-4 bg-orange-50 relative">
                                <h4 className="font-semibold text-orange-600 mb-3">
                                  Participant {index + 1}
                                </h4>
                                <button
                                  onClick={() => setParticipants(participants.filter((_, i) => i !== index))}
                                  className="absolute top-4 right-4 text-red-500 hover:text-red-700 text-lg font-bold"
                                >
                                  ×
                                </button>
                                <div className="grid grid-cols-1 gap-3">
                                  <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={p.name}
                                    onChange={(e) => {
                                      const newData = [...participants]
                                      newData[index].name = e.target.value
                                      setParticipants(newData)
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                  <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={p.email}
                                    onChange={(e) => {
                                      const newData = [...participants]
                                      newData[index].email = e.target.value
                                      setParticipants(newData)
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                  <input
                                    type="text"
                                    placeholder="Phone No."
                                    value={p.phone}
                                    onChange={(e) => {
                                      const newData = [...participants]
                                      newData[index].phone = e.target.value
                                      setParticipants(newData)
                                    }}
                                    className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-orange-500"
                                  />
                                </div>
                              </div>
                            ))}
                            {participants.length < 10 && (
                              <button
                                onClick={() => setParticipants([...participants, { name: "", email: "", phone: "" }])}
                                className="bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 transition-colors font-medium"
                              >
                                + Add Another Participant
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Navigation Buttons */}
                      <div className="flex justify-between pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setStep(0)}
                          className="border border-orange-600 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors font-medium"
                        >
                          Back to Tickets
                        </button>
                        <button
                          onClick={handleRegistration}
                          disabled={isLoading}
                          className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Processing...' : 'Continue to Payment'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - Same as Step 0 */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{selectedTicket?.title}</span>
                          <span className="text-orange-600 font-bold">{selectedTicket?.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>{selectedTicket?.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Platform Fee (2%)</span>
                          <span>₹38</span>
                        </div>
                        <hr className="my-3" />
                        <div className="flex justify-between font-semibold text-orange-600">
                          <span>Total</span>
                          <span>₹1,937</span>
                        </div>
                        <p className="text-green-600 text-sm font-medium">You save ₹600!</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>📅 Sep 16, 2025</p>
                        <p>⏰ 9:00 AM</p>
                        <p>📍 Hybrid - Mumbai, India</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Featured Speakers</h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map((id) => (
                          <div key={id} className="flex items-center gap-3">
                            <Image
                              src="/profile.png"
                              alt="Speaker"
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium text-sm text-gray-900">Sarah Johnson</p>
                              <p className="text-xs text-gray-500">AI Researcher</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2 - Payment (Structure similar to Step 1) */}
              {step === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-xl border border-gray-200">
                      <h2 className="text-xl font-semibold text-orange-600 mb-2">Payment</h2>
                      <p className="text-gray-600 text-sm mb-6">
                        Secure payment powered by Razorpay
                      </p>

                      {/* Ticket Info */}
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-gray-900">{selectedTicket?.title}</h3>
                        <p className="text-orange-600 font-bold text-xl">{selectedTicket?.price}</p>
                        <p className="text-green-600 text-sm font-medium">You&apos;re saving {save}!</p>
                      </div>

                      {/* Payment Method */}
                      <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                      <div className="space-y-3 mb-6">
                        <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-400 transition-colors">
                          <input type="radio" name="payment" defaultChecked className="text-orange-500" />
                          <span className="font-medium">Credit / Debit Card</span>
                        </label>
                        <label className="flex items-center gap-3 border border-gray-300 rounded-lg p-4 cursor-pointer hover:border-orange-400 transition-colors">
                          <input type="radio" name="payment" className="text-orange-500" />
                          <span className="font-medium">UPI</span>
                        </label>
                      </div>

                      {/* Card Form */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Card Number" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <input type="text" placeholder="Expiry Date" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <input type="text" placeholder="CVV" className="border border-gray-300 rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-orange-500" />
                        <input type="text" placeholder="Cardholder Name" className="border border-gray-300 rounded-lg px-4 py-3 w-full md:col-span-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                      </div>

                      <div className="flex justify-between pt-6 border-t border-gray-200 mt-6">
                        <button onClick={() => setStep(1)} className="border border-orange-600 text-orange-600 px-8 py-3 rounded-lg hover:bg-orange-50 transition-colors font-medium">
                          Back to Details
                        </button>
                        <button onClick={handlePayment} className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                          Pay ₹{total}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Sidebar - Same as previous steps */}
                  <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-lg mb-4 text-gray-900">Order Summary</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{selectedTicket?.title}</span>
                          <span className="text-orange-600 font-bold">{selectedTicket?.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span>{selectedTicket?.price}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Platform Fee (2%)</span>
                          <span>₹38</span>
                        </div>
                        <hr className="my-3" />
                        <div className="flex justify-between font-semibold text-orange-600">
                          <span>Total</span>
                          <span>₹1,937</span>
                        </div>
                        <p className="text-green-600 text-sm font-medium">You save ₹600!</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-3">Event Details</h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>📅 Sep 16, 2025</p>
                        <p>⏰ 9:00 AM</p>
                        <p>📍 Hybrid - Mumbai, India</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                      <h3 className="font-semibold text-gray-900 mb-4">Featured Speakers</h3>
                      <div className="space-y-3">
                        {[1, 2, 3].map((id) => (
                          <div key={id} className="flex items-center gap-3">
                            <Image
                              src="/profile.png"
                              alt="Speaker"
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div>
                              <p className="font-medium text-sm text-gray-900">Sarah Johnson</p>
                              <p className="text-xs text-gray-500">AI Researcher</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3 - Complete */}
              {step === 3 && (
                <div className="text-center py-12">
                  <div className="bg-green-50 border border-green-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <span className="text-green-500 text-3xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Registration Complete!</h2>
                  <p className="text-gray-700 mb-2 text-lg">
                    Your ticket for <span className="font-semibold">{selectedTicket?.title}</span> is confirmed.
                  </p>
                  <p className="text-gray-500 mb-8">A confirmation email has been sent to your registered address.</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}