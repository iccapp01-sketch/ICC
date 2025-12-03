import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      {/* 3D Gradients */}
      <linearGradient id="crossGrad" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#00AEEF" />
        <stop offset="0.5" stopColor="#0056b3" />
        <stop offset="1" stopColor="#004494" />
      </linearGradient>
      
      <linearGradient id="fishGrad" x1="20" y1="100" x2="180" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#29C5F6" />
        <stop offset="0.5" stopColor="#00AEEF" />
        <stop offset="1" stopColor="#0077CC" />
      </linearGradient>

      {/* Bevel Highlights */}
      <filter id="bevel" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
        <feSpecularLighting in="blur" surfaceScale="5" specularConstant="1" specularExponent="20" lightingColor="#ffffff" result="specOut">
          <fePointLight x="-5000" y="-10000" z="20000" />
        </feSpecularLighting>
        <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specOut" />
        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
        <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.4"/>
      </filter>
    </defs>
    
    {/* Group for Logo Icon */}
    <g transform="translate(0, -10)">
        {/* Cross - Vertical Bar */}
        <path 
            d="M90 20 L110 20 L110 160 L90 160 Z" 
            fill="url(#crossGrad)" 
            filter="url(#bevel)"
            stroke="#003366"
            strokeWidth="0.5"
        />
        
        {/* Cross - Horizontal Bar */}
        <path 
            d="M50 50 L150 50 L150 70 L50 70 Z" 
            fill="url(#crossGrad)" 
            filter="url(#bevel)"
            stroke="#003366"
            strokeWidth="0.5"
        />

        {/* Fish Symbol (Overlapping the vertical cross bar in the middle) */}
        {/* Using a custom path to match the specific 'Ichthys' curve */}
        <path 
            d="M20 110 C 20 110, 60 60, 180 60 C 180 60, 100 110, 20 110 Z M20 110 C 20 110, 60 160, 180 160 C 180 160, 100 110, 20 110 Z" 
            stroke="url(#fishGrad)" 
            strokeWidth="14" 
            strokeLinecap="round" 
            fill="none" 
            filter="url(#bevel)"
        />
        
        {/* Re-draw part of vertical cross to create the 'interwoven' 3D look if needed, 
            but for the provided image, the fish sits 'around' the cross. 
            We will overlay a small segment of the vertical cross to make it look like it goes 'through' the fish if desired.
            Based on image, the cross is BEHIND the fish in the center.
        */}
    </g>

    {/* Text */}
    <g transform="translate(0, 10)">
        <text x="100" y="165" fontSize="26" textAnchor="middle" fill="#0056b3" fontWeight="900" fontFamily="sans-serif" letterSpacing="1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.1)' }}>ISIPINGO</text>
        <text x="100" y="182" fontSize="11" textAnchor="middle" fill="#004494" fontWeight="700" fontFamily="sans-serif" letterSpacing="0.5">COMMUNITY CHURCH</text>
    </g>
  </svg>
);