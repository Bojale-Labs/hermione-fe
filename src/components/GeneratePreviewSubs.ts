export const getPreviewSubtitles = async ({
  url,
  settings,
  setError,
  previewVideo,
  setIsLoading,
  setIsPreviewVideoLoading,
}) => {
  try {
    const response = await fetch(
      `${BACKEND_HOST}/api/canva/video/preview-subtitles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url,
          model_to_use: "transcript__sample_text_model",
          original_video_path: previewVideo?.original_video_path,
          ...settings,
        }),
      }
    );

    if (!response.ok) {
      setError("Failed to post URL: " + response.statusText);
      throw new Error(`Failed to post URL: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // setMessage("Error getting preview subtitles, try again ");
    setIsLoading(false);
    setIsPreviewVideoLoading(false);
    console.error("Error getting preview subtitles:", error);
    return null;
  }
};
