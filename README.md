# AI-Powered Image Search

![Supabase](https://img.shields.io/badge/Supabase-latest-green)
![Google Gemini](https://img.shields.io/badge/Google%20Gemini-AI-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-latest-38B2AC)

A modern web application that allows users to upload, organize, and search through their images using keywords. Powered by Google's Gemini AI for intelligent image analysis and Supabase for storage and authentication.

## ✨ Features

- **AI-Powered Image Analysis**: Automatically extracts objects, scenes, colors, and more from your images
- **Secure Authentication**: User authentication and authorization with Supabase
- **Detailed Image View**: View comprehensive metadata about each image

## 🧠 How It Works

This application leverages several cutting-edge technologies to provide a seamless image search experience:

1. **Image Upload & Processing**:
   - Users upload images through a drag-and-drop interface
   - Images are securely stored in Supabase Storage
   - Google's Gemini AI analyzes each image and extracts detailed metadata

2. **Intelligent Metadata Extraction**:
   - Identifies objects, people, scenes, activities in each image
   - Recognizes colors, moods, and aesthetic elements
   - Generates descriptive tags and a comprehensive description

3. **Secure Data Management**:
   - Row Level Security ensures users can only access their own images
   - Authenticated API endpoints prevent unauthorized access
   - Optimized database queries for fast performance

## 🛠️ Technology Stack

- **Frontend**:
  - Next.js 15 with App Router
  - React 19 with Server Components
  - TailwindCSS for styling
  - TypeScript for type safety

- **Backend**:
  - Supabase for database and storage
  - Next.js API Routes for serverless functions
  - Google Gemini AI for image analysis

- **Authentication**:
  - Supabase Auth with email/password
  - Secure session management
  - Row Level Security policies

## 📋 Prerequisites

- Node.js 18.17 or later
- pnpm package manager
- Supabase account
- Google AI Studio account (for Gemini API key)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/zg0ul/searchable-images.git
cd searchable-images
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

Run the following SQL in your Supabase SQL Editor to set up the necessary tables and security policies:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Images table to store uploaded image data
CREATE TABLE public.images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_images_created_at ON public.images(created_at);

-- Image metadata table to store AI-generated metadata
CREATE TABLE public.image_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    image_id UUID NOT NULL REFERENCES public.images(id) ON DELETE CASCADE,
    tags TEXT[] NOT NULL DEFAULT '{}',
    objects TEXT[] NOT NULL DEFAULT '{}',
    scenes TEXT[] NOT NULL DEFAULT '{}',
    colors TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);
CREATE INDEX idx_image_metadata_image_id ON public.image_metadata(image_id);
CREATE INDEX idx_image_metadata_tags ON public.image_metadata USING GIN (tags);
CREATE INDEX idx_image_metadata_objects ON public.image_metadata USING GIN (objects);
CREATE INDEX idx_image_metadata_scenes ON public.image_metadata USING GIN (scenes);
CREATE INDEX idx_image_metadata_colors ON public.image_metadata USING GIN (colors);

-- Set up Row Level Security
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Create security policies for images table
CREATE POLICY images_select_policy ON public.images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY images_insert_policy ON public.images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY images_update_policy ON public.images FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY images_delete_policy ON public.images FOR DELETE USING (auth.uid() = user_id);

-- Create security policies for image_metadata table
CREATE POLICY image_metadata_select_policy ON public.image_metadata FOR SELECT 
USING (EXISTS (SELECT 1 FROM public.images WHERE images.id = image_metadata.image_id AND images.user_id = auth.uid()));

CREATE POLICY image_metadata_insert_policy ON public.image_metadata FOR INSERT 
WITH CHECK (EXISTS (SELECT 1 FROM public.images WHERE images.id = image_metadata.image_id AND images.user_id = auth.uid()));

CREATE POLICY image_metadata_update_policy ON public.image_metadata FOR UPDATE 
USING (EXISTS (SELECT 1 FROM public.images WHERE images.id = image_metadata.image_id AND images.user_id = auth.uid()));

CREATE POLICY image_metadata_delete_policy ON public.image_metadata FOR DELETE 
USING (EXISTS (SELECT 1 FROM public.images WHERE images.id = image_metadata.image_id AND images.user_id = auth.uid()));
```

### 5. Storage Setup

In the Supabase dashboard:
1. Create a new storage bucket named `images`
2. Set up the following storage policies:

#### Upload Policy
```sql
(bucket_id = 'images' AND auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text)
```

#### Download Policy
```sql
(bucket_id = 'images')
```

### 6. Start the development server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## 📷 Usage

1. **Register/Login**: Create an account or log in to access the app
2. **Upload Images**: Drag and drop images or click to select files
3. **Search**: Use natural language to search for specific images
4. **View Details**: Click on an image to see detailed AI-generated metadata

## 🌐 Architecture

The application follows a modern architecture:

- **Client**: Next.js React application with TailwindCSS
- **API Layer**: Next.js API Routes for handling requests
- **Authentication**: Supabase Authentication with middleware
- **Storage**: Supabase Storage for images
- **Database**: Supabase PostgreSQL for structured data
- **AI Processing**: Google Gemini AI for image analysis

## 📚 Key Concepts

### Image Analysis with Gemini AI

Google's Gemini AI is used to extract meaningful information from images:

```typescript
// Example of how image analysis works
const metadata = await analyzeImage(base64Image, file.type);
// Returns structured data about the image content
```

### Supabase Row Level Security

Database security is enforced using Supabase RLS policies:

```sql
-- Example policy: users can only see their own images
CREATE POLICY images_select_policy
    ON public.images
    FOR SELECT
    USING (auth.uid() = user_id);
```

### Intelligent Search

The search functionality uses PostgreSQL's powerful text search capabilities:

```typescript
// Example of how search works
.or(`description.ilike.%${query}%,tags.cs.{${query}},objects.cs.{${query}}`)
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.


## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/) - The React Framework
- [Supabase](https://supabase.io/) - The Open Source Firebase Alternative
- [Google Gemini](https://ai.google/discover/generativeai/) - Generative AI by Google
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
