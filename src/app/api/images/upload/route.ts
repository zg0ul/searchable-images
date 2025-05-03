import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { analyzeImage } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // Create a Supabase client with server context
    const supabase = await createClient();

    // Check for authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Get form data from the request
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${userId}_${timestamp}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Convert the file to a buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Convert the image to base64 for Gemini API
    const base64Image = buffer.toString("base64");

    // Upload the file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading file to Supabase Storage:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image" },
        { status: 500 }
      );
    }

    // Get the public URL for the uploaded file
    const {
      data: { publicUrl },
    } = supabase.storage.from("images").getPublicUrl(filePath);

    // Insert record into the images table
    const { data: imageData, error: imageError } = await supabase
      .from("images")
      .insert({
        user_id: userId,
        storage_path: filePath,
        file_name: file.name,
        content_type: file.type,
        size: file.size,
        url: publicUrl,
      })
      .select()
      .single();

    if (imageError) {
      console.error("Error inserting image record:", imageError);
      return NextResponse.json(
        { error: "Failed to save image metadata" },
        { status: 500 }
      );
    }

    // Analyze the image with Gemini AI
    try {
      const metadata = await analyzeImage(base64Image, file.type);

      // Store the image metadata
      const { data: metadataData, error: metadataError } = await supabase
        .from("image_metadata")
        .insert({
          image_id: imageData.id,
          tags: metadata.tags || [],
          objects: metadata.objects || [],
          scenes: metadata.scenes || [],
          colors: metadata.colors || [],
          description: metadata.description || "",
        })
        .select()
        .single();

      if (metadataError) {
        console.error("Error inserting metadata record:", metadataError);
        // Continue even if metadata insertion fails
      }

      // Return the image data along with its metadata
      return NextResponse.json({
        image: imageData,
        metadata: metadataData || null,
      });
    } catch (aiError) {
      console.error("Error analyzing image with Gemini:", aiError);

      // Return the image data without metadata
      return NextResponse.json({
        image: imageData,
        metadata: null,
        warning: "Image was uploaded, but AI analysis failed.",
      });
    }
  } catch (error) {
    console.error("Unexpected error during image upload:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
