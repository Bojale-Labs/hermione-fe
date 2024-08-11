import { getTemporaryUrl } from "@canva/asset";

export const getFullSubtitles = async (
  selectedVideo,
  settings,
  setError: (message: string) => void
): Promise<any> => {
  try {
    // ** temp ** //
    const tempUrl = await getTemporaryUrl({
      type: "VIDEO",
      ref: selectedVideo,
    });
    const response = await fetch(`${BACKEND_HOST}/api/canva/video/transcribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: tempUrl.url,
        model_to_use: "incredibly-fast-whisper", // TODO: change this to the model for prod
        ...settings,
      }),
    });
    if (!response.ok) {
      setError("Failed to generate subtitles");
    }

    return await response.json();
    // Handle the result (e.g., show a success message, display the subtitled video)
  } catch (error: any) {
    console.error("Error generating subtitles:", error, error?.message);
    // Handle the error (e.g., show an error message to the user)
  }
};
