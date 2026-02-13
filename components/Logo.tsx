
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-auto" }) => {
  const [logoUrl, setLogoUrl] = useState("https://aqgzlavujweornbsnydg.supabase.co/storage/v1/object/public/logos/file_00000000643071f5b44f24278a84a971.png");

  useEffect(() => {
    const fetchLogo = async () => {
      // Attempt to get the latest uploaded logo from storage
      const { data } = supabase.storage.from('logos').getPublicUrl('current_logo.png');
      if (data?.publicUrl) {
        // We verify if the file exists by doing a quick fetch head or just trust it
        // For simplicity, we just set it. If it 404s, it'll show nothing or alt
        setLogoUrl(`${data.publicUrl}?t=${Date.now()}`); // Cache busting
      }
    };
    fetchLogo();
  }, []);

  return (
    <img 
      src={logoUrl} 
      alt="ICC Logo" 
      className={className}
      onError={(e) => {
        // Fallback to default if custom one fails
        e.currentTarget.src = "https://aqgzlavujweornbsnydg.supabase.co/storage/v1/object/public/logos/file_00000000643071f5b44f24278a84a971.png";
      }}
    />
  );
};
