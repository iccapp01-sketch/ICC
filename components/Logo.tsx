import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => (
  <img 
    src="https://aqgzlavujweornbsnydg.supabase.co/storage/v1/object/public/logos/file_00000000643071f5b44f24278a84a971.png" 
    alt="ICC Logo" 
    className={`${className} object-contain`}
  />
);