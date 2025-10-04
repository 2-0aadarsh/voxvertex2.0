"use client"
import React, { useState } from "react"
import Image from "next/image"
import { FaCalendar, FaUser } from "react-icons/fa6"

export default function Box() {
  const [open, setOpen] = useState(false)

  return (
    <>
      
      <div
        onClick={() => setOpen(true)}
        className="m-5 border-2 rounded-xl shadow-md w-[30vw] overflow-hidden relative cursor-pointer"
      >
        <div className="relative">
          <Image
            src="/image.jpg"
            alt="Event"
            width={400}
            height={200}
            className="w-full h-48 object-cover rounded-t-xl"
          />

          <div className="absolute top-3 left-[-25px] bg-orange-600 text-white text-xs font-bold px-8 py-1 transform -rotate-45 shadow-md">
            20% OFF
          </div>

          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-md shadow">
            Online
          </span>
        </div>

        <div className="p-4">
          <h2 className="text-black text-md font-bold">
            AI & Machine Learning Summit 2025
          </h2>
          <div className="flex flex-row items-center gap-2 text-gray-500">
            <FaCalendar />
            <span>Sep 25, 2025</span>
          </div>

          <div className="flex flex-row items-center gap-2 text-orange-500 mt-2">
            <FaUser />
            Speakers
          </div>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Background Blur */}
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)} // close when background clicked
          ></div>

          {/* Dialog Box */}
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-[40vw] z-10">
            <h2 className="text-xl font-bold text-orange-600">
              AI & Machine Learning Summit 2025
            </h2>
            <p className="mt-2 text-gray-700">
              This is a detailed description of the event. You can add booking
              form, speaker details, etc. here.
            </p>

            <div className="flex justify-end space-x-3 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg"
              >
                Close
              </button>
              <button className="bg-orange-600 text-white px-4 py-2 rounded-lg">
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}