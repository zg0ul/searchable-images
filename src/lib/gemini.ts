import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// Safety settings to avoid harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * Analyzes an image using Google's Gemini Vision model and extracts metadata
 * @param imageData - The image file data as a base64 string
 * @param mimeType - The MIME type of the image (e.g., 'image/jpeg')
 * @returns Structured metadata about the image content
 */
export async function analyzeImage(imageData: string, mimeType: string) {
  try {
    console.log("Analyzing image with Gemini...");
    // Access the newer Gemini 1.5 Flash model instead of the deprecated gemini-pro-vision
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Create a prompt that extracts useful metadata
    const prompt = `
      Analyze this image in detail and provide structured information about its content.
      Identify and categorize the following:
      
      1. Main objects in the image
      2. Scene type (e.g., indoor, outdoor, urban, nature)
      3. Dominant colors
      4. Activities or actions occurring in the image
      5. Any text visible in the image
      6. Overall mood or atmosphere
      7. Time of day if apparent
      8. Weather conditions if apparent
      9. Distinctive landmarks if any
      
      Format the response as a JSON object with the following structure:
      {
        "description": "A brief overall description of the image",
        "objects": ["object1", "object2", ...],
        "scenes": ["scene1", "scene2", ...],
        "colors": ["color1", "color2", ...],
        "activities": ["activity1", "activity2", ...],
        "textContent": "Any visible text",
        "mood": ["mood1", "mood2", ...],
        "timeOfDay": "time if apparent",
        "weather": "weather if apparent",
        "landmarks": ["landmark1", "landmark2", ...],
        "tags": ["tag1", "tag2", ...] // Most relevant keywords for searching
      }
      
      The "tags" field should contain the most relevant keywords that would be useful for searching this image.
    `;

    // Prepare the image data part for the request
    const imagePart = {
      inlineData: {
        data: imageData,
        mimeType,
      },
    };

    // Generate content with the model
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    try {
      // Find JSON object in the response text (in case there's any extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonStr = jsonMatch[0];
        console.log("Parsed JSON:", jsonStr);
        return JSON.parse(jsonStr);
      }

      // If no JSON object found, try parsing the whole response
      console.log("Full response text:", text);
      return JSON.parse(text);
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      // Return a simplified response if JSON parsing fails
      return {
        description: text.substring(0, 500),
        objects: [],
        scenes: [],
        colors: [],
        tags: [],
      };
    }
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    throw new Error("Failed to analyze image. Please try again later.");
  }
}
