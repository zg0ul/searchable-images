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
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)
        .limit(limit);

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

    const lowerQuery = query.toLowerCase();
    // For search queries, we need to use full text search on the metadata
    const { data: searchResults, error: searchError } = await supabase
      .from("image_metadata")
      .select(
        `
        *,
        image:images!image_metadata_image_id_fkey(*)
      `
      )
      .or(
        `description.ilike.%${query}%,tags.cs.{${query}},objects.cs.{${query}},scenes.cs.{${query}},colors.cs.{${query}}`
      )
      .eq("image.user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)
      .limit(limit);

    if (searchError) {
      console.error("Error searching images:", searchError);
      return NextResponse.json(
        { error: "Failed to search images" },
        { status: 500 }
      );
    }

    // Reformat the results to match the expected structure
    const images = searchResults.map((result) => ({
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
        total: searchResults.length,
        totalPages: Math.ceil(searchResults.length / limit),
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
