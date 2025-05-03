import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Tables = {
  users: {
    id: string;
    email: string;
    created_at: string;
  };
  images: {
    id: string;
    user_id: string;
    storage_path: string;
    file_name: string;
    content_type: string;
    size: number;
    created_at: string;
    url: string;
  };
  image_metadata: {
    id: string;
    image_id: string;
    tags: string[];
    objects: string[];
    scenes: string[];
    colors: string[];
    description: string;
    created_at: string;
  };
};
