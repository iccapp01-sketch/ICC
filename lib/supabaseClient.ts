
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aqgzlavujweornbsnydg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxZ3psYXZ1andlb3JuYnNueWRnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjQ4NDYsImV4cCI6MjA4MDM0MDg0Nn0.Zag21ACcfsIt4qs0PwPZVkqMJJeQ5Anw0E-7AhYk5P8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
