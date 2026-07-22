import React, { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href =
        "https://wa.me/918978038932?text=Hi%20Godhara,%20I%20need%20help%20regarding%20the%20website.";
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2C1810] via-[#6B2D0E] to-[#A0522D] flex items-center justify-center px-5">

      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-10 text-center">

        <img
          src="/logo.png"
          alt="Godhara"
          className="w-24 h-24 mx-auto mb-6"
        />

        <div className="text-6xl animate-bounce mb-5">
          🚧
        </div>

        <h1 className="text-4xl font-bold text-[#6B2D0E] mb-5">
          Website Under Maintenance
        </h1>

        <p className="text-gray-600 text-lg leading-8">
          Dear Customer,
          <br /><br />
          Godhara is currently undergoing scheduled maintenance to improve
          performance, security, and your shopping experience.
        </p>

        <div className="mt-8 bg-orange-100 border border-orange-300 rounded-xl p-5">
          <p className="font-semibold text-[#6B2D0E] text-lg">
            We will be back very soon.
          </p>
        </div>

        <div className="mt-8">

          <a
            href="https://wa.me/918978038932?text=Hi%20Godhara,%20I%20need%20help%20regarding%20the%20website."
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-8 py-4 rounded-xl transition"
          >
            💬 Contact Us on WhatsApp
          </a>

        </div>

        <p className="mt-8 text-green-700 font-semibold">
          Redirecting to WhatsApp automatically in 10 seconds...
        </p>

        <p className="text-gray-400 text-sm mt-8">
          © 2026 Godhara. All Rights Reserved.
        </p>

      </div>

    </div>
  );
}
