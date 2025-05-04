"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Toaster, toast } from "sonner";
import { useAuth } from "@/context/auth-provider";
import { FileUpload } from "@/components/file-upload";
import { SearchInput } from "@/components/search-input";
import { ImageGallery } from "@/components/image-gallery";
import { ImageDetailView } from "@/components/image-detail-view";
import { Tables } from "@/lib/supabase";

type ImageWithMetadata = Tables["images"] & {
  metadata: Tables["image_metadata"] | null;
};

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const { user, isLoading, signOut } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<ImageWithMetadata[]>([]);
  const [selectedImage, setSelectedImage] = useState<ImageWithMetadata | null>(
    null
  );
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Redirect to auth page if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth");
    }
  }, [user, isLoading, router]);

  // Fetch images when the user is authenticated or search query changes
  useEffect(() => {
    if (!user) return;

    const fetchImages = async () => {
      setIsLoadingImages(true);
      try {
        const queryParams = new URLSearchParams();
        if (searchQuery) {
          queryParams.set("query", searchQuery);
        }

        const response = await fetch(`/api/images/search?${queryParams}`);
        if (!response.ok) {
          throw new Error("Failed to fetch images");
        }

        const data = await response.json();
        setImages(data.images || []);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images. Please try again.");
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [user, searchQuery]);

  // Handle image upload
  const handleFilesAccepted = async (files: File[]) => {
    if (!user) {
      toast.error("You must be logged in to upload images");
      return;
    }

    setIsUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        toast.info(`Uploading ${file.name}...`);

        const response = await fetch("/api/images/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload image");
        }

        const data = await response.json();

        // Add the newly uploaded image to the images array
        setImages((prevImages) => [data.image, ...prevImages]);

        toast.success(`${file.name} uploaded successfully!`);

        if (data.warning) {
          toast.warning(data.warning);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error(`Failed to upload ${file.name}. Please try again.`);
      }
    }

    setIsUploading(false);
  };

  // Handle search
  const handleSearch = (query: string) => {
    // Update the URL with the search query
    const params = new URLSearchParams(searchParams.toString());

    if (query) {
      params.set("query", query);
    } else {
      params.delete("query");
    }

    // Use replace to avoid building up history entries for every search
    router.replace(`?${params.toString()}`);
  };

  // Handle image selection
  const handleImageClick = (image: ImageWithMetadata) => {
    setSelectedImage(image);
  };

  // Handle closing the detail view
  const handleCloseDetailView = () => {
    setSelectedImage(null);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      router.push("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth page via useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8 ">
      <Toaster position="top-right" />

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Image Collection</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-green-400 hover:bg-green-600 text-black rounded-lg text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <SearchInput onSearch={handleSearch} initialQuery={searchQuery} />
        </div>

        <div className="md:col-span-1 flex items-start">
          <FileUpload
            onFilesAccepted={handleFilesAccepted}
            isUploading={isUploading}
          />
        </div>
      </div>

      <div className="mt-10">
        {isLoadingImages ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {searchQuery && (
              <h2 className="text-xl font-semibold mb-4">
                {images.length > 0
                  ? `Found ${images.length} result${
                      images.length !== 1 ? "s" : ""
                    } for "${searchQuery}"`
                  : `No results found for "${searchQuery}"`}
              </h2>
            )}

            <ImageGallery images={images} onImageClick={handleImageClick} />
          </>
        )}
      </div>

      {selectedImage && (
        <ImageDetailView
          image={selectedImage}
          onClose={handleCloseDetailView}
        />
      )}
    </div>
  );
}
