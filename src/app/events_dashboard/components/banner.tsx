import React from "react";
import Image from "next/image";

export default function Banner() {
    return (
        <div className="relative w-full h-[70vh] sm:h-[80vh] flex items-center justify-center overflow-hidden">

            <Image
                src="/orange1000px.png"
                alt="Background"
                fill
                className="object-cover"
            />


            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[600px] md:w-[800px]">
                <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px]">

                    <Image
                        src="/image.jpg"
                        alt="Overlay"
                        fill
                        className="object-cover rounded-xl"
                    />


                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                        <h1 className="text-2xl md:text-4xl sm:text-2xl font-bold text-white mb-2">
                            Discover Amazing Events
                        </h1>
                        <p className="text-white text-sm sm:text-sm md:text-base max-w-[90%] sm:max-w-[80%]">
                            Find and join the most exciting events on Voxvertex. From tech
                            conferences to workshops, discover opportunities that matter to you.
                        </p>
                        <button className="mt-4 bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 transition">
                            Explore Events
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}