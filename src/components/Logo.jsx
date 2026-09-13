import React from 'react';
import logoImg from '../assets/ab-logo.jpg';

export default function Logo() {
  return (
    <button
      className="flex items-center gap-3 text-left"
      onClick={() => window.dispatchEvent(new CustomEvent("navigate", { detail: "home" }))}
      aria-label="Go to home"
    >
      <img 
        src={logoImg} 
        alt="AniBrowse Logo" 
        className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-orange-950/30" 
      />
      <span className="hidden text-lg font-extrabold tracking-tight sm:block">
        Ani<span className="text-orange-400">Browse</span>
      </span>
    </button>
  );
}
