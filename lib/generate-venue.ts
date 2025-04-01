import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.NEXT_PUBLIC_FAL_KEY
});

export async function generateVenueImage(venueDescription: string) {
  try {
    const result = await fal.subscribe("rundiffusion-fal/juggernaut-flux/lightning", {
      input: {
        prompt: `Professional architectural photography: ${venueDescription}. Ultra-detailed, photorealistic, cinematic lighting, high-end venue photography, architectural visualization, interior design, 8k resolution.`,
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    });

    console.log('FAL AI Response:', result);

    if (!result.data?.images?.[0]) {
      throw new Error("No image generated");
    }

    return {
      success: true,
      imageUrl: result.data.images[0],
      requestId: result.requestId
    };

  } catch (error) {
    console.error("Venue generation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to generate venue image"
    };
  }
}