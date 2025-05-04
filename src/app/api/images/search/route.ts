import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
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

    // Get search query and pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = (page - 1) * limit;

    // If no query, return all images for the user (paginated)
    if (!query) {
      const {
        data: images,
        error,
        count,
      } = await supabase
        .from("images")
        .select(
          `
          *,
          metadata: image_metadata!image_metadata_image_id_fkey(*)
        `,
          { count: "exact" }
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error("Error fetching images:", error);
        return NextResponse.json(
          { error: "Failed to fetch images" },
          { status: 500 }
        );
      }

      return NextResponse.json({
        images,
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: count ? Math.ceil(count / limit) : 0,
        },
      });
    }

    // For search queries, we need to search case-insensitively
    const lowerQuery = query.toLowerCase();

    // First, get all metadata for the user's images
    const { data: allMetadata, error: metadataError } = await supabase
      .from("image_metadata")
      .select(
        `
        *,
        image:images!image_metadata_image_id_fkey(*)
      `
      )
      .eq("image.user_id", userId);

    if (metadataError) {
      console.error("Error fetching metadata:", metadataError);
      return NextResponse.json(
        { error: "Failed to fetch metadata" },
        { status: 500 }
      );
    }

    // Filter the results in JavaScript for case-insensitive array search
    const filteredResults = allMetadata.filter((metadata) => {
      // Check description (case-insensitive)
      if (
        metadata.description &&
        metadata.description.toLowerCase().includes(lowerQuery)
      ) {
        return true;
      }

      // Check arrays (tags, objects, scenes, colors) case-insensitively
      const arrayFields = ["tags", "objects", "scenes", "colors"];
      return arrayFields.some((field) => {
        const array = metadata[field] || [];
        return array.some((item: any) =>
          item.toLowerCase().includes(lowerQuery)
        );
      });
    });

    // Apply pagination to filtered results
    const paginatedResults = filteredResults.slice(offset, offset + limit);

    // Reformat the results to match the expected structure
    const images = paginatedResults.map((result) => ({
      ...result.image,
      metadata: {
        id: result.id,
        image_id: result.image_id,
        tags: result.tags,
        objects: result.objects,
        scenes: result.scenes,
        colors: result.colors,
        description: result.description,
        created_at: result.created_at,
      },
    }));

    return NextResponse.json({
      images,
      pagination: {
        page,
        limit,
        total: filteredResults.length,
        totalPages: Math.ceil(filteredResults.length / limit),
      },
    });
  } catch (error) {
    console.error("Unexpected error during image search:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
