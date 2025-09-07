"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) setVisible(true);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-white text-black border-t border-gray-300 shadow-lg"
        >
          <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-center md:text-left">
              Мы используем только необходимые cookies для работы магазина.{" "}
              Подробнее читайте в{" "}
              <a href="/legal/cookies" className="underline hover:text-gray-600">
                политике Cookies
              </a>.
            </p>
            <button
              onClick={acceptCookies}
              className="px-4 py-2 text-sm rounded-md bg-black text-white hover:bg-gray-800 transition"
            >
              Понятно
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
