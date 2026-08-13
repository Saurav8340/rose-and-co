'use client';

import { useEffect, useState } from 'react';

const NAMES = ['Priya', 'Aarushi', 'Kavya', 'Ishita', 'Ananya', 'Meera', 'Riya', 'Nisha', 'Sneha', 'Divya'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Hyderabad', 'Chennai', 'Gurugram', 'Kolkata', 'Jaipur', 'Ahmedabad'];
const PRODUCTS = ['Blood Spiral', 'Chained Reckoning', 'Fiendish Mesh', 'Obsidian Wraith', 'Cemetery Chain'];
const ACTIONS = ['just bought', 'added to cart', 'is viewing'];

export default function SocialProof() {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    let interval: ReturnType<typeof setInterval>;

    const showNext = () => {
      const name = NAMES[Math.floor(Math.random() * NAMES.length)];
      const city = CITIES[Math.floor(Math.random() * CITIES.length)];
      const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
      const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
      const mins = Math.floor(Math.random() * 30) + 2;
      setMessage(`${name} from ${city} ${action} ${product} · ${mins} min ago`);
      setVisible(true);
      timer = setTimeout(() => setVisible(false), 5000);
    };

    // First one after 8 seconds
    timer = setTimeout(showNext, 8000);
    // Then every 25 seconds
    interval = setInterval(showNext, 25000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-24 left-4 md:bottom-4 max-w-xs bg-ivory shadow-2xl border border-taupe/20 p-3 z-30 transition-all duration-500 ${
        visible ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0 animate-pulse" />
        <div className="text-xs text-espresso">{message}</div>
      </div>
    </div>
  );
}





