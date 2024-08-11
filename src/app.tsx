import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  Suspense,
  use,
} from "react";
import {
  Button,
  Columns,
  Column,
  Text,
  Box,
  VideoCard as CanvaVideoCard,
  Rows,
  ImageCard,
  Title,
  Alert,
  MultilineInput,
  SegmentedControl,
  FileInput,
  CopyIcon,
  ArrowLeftIcon,
  TextInput,
} from "@canva/app-ui-kit";
import VideoCard from "src/components/VideoCard";
import {
  addNativeElement,
  getCurrentPageContext,
  VideoRef,
} from "@canva/design";
import { useSelection } from "utils/use_selection_hook";
import {
  // handleGenerate,
  getFullSubtitles,
} from "src/components/GenerateSubs";
import { getPreviewSubtitles } from "src/components/GeneratePreviewSubs";
import { DynamicGrid } from "src/components/DynamicGrid";
import { getTemporaryUrl, upload } from "@canva/asset";
import { CustomizationTab } from "src/components/RenderCustomization";
import styles from "styles/components.css";
import "styles/components.css";
import {
  // authenticateOTP,
  checkAuthenticationStatus,
  requestOTP,
  startAuthenticationFlow,
} from "src/components/AuthUtils"; // TODO: remove this
import { auth } from "@canva/user";
import renderAuthStep, { AuthState } from "./components/RenderSIgnInFlow";

type mimeType =
  | "video/mp4"
  | "video/avi"
  | "video/x-m4v"
  | "video/x-matroska"
  | "video/quicktime"
  | "video/mpeg"
  | "video/webm";

interface Video {
  url: string;
  thumbnailUrl: string;
  mimeType: mimeType;
  original_video_path?: string;
  // Add any other properties your video object might have
}
interface SubbedVideo extends Video {
  height: number;
  width: number;
}
interface NetworkInformation extends EventTarget {
  downlink: number;
  effectiveType: string;
  rtt: number;
  saveData: boolean;
  onchange: ((this: NetworkInformation, ev: Event) => any) | null;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
}

export const App = () => {
  const currentSelection = useSelection("video");
  const isElementSelected = currentSelection.count > 0;
  const [screen, setScreen] = useState("initial"); // initial, upload, transcription, uploadconfirmation, preview
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewVideoLoading, setIsPreviewVideoLoading] = useState(false);
  const [presetTabSettings, setPresetTabSettings] = useState("themes");
  const [isTranscriptVisible, setIsTranscriptVisible] = useState(false);
  const [transcript, setTranscript] = useState(
    "Text Text \n TextTextText \n Text"
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [refOfSelectedVideo, setRefOfSelectedVideo] = useState<VideoRef | null>(
    null
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [networkStrength, setNetworkStrength] = useState<null | number>(null);
  const [subbedVideo, setSubbedVideo] = useState<SubbedVideo | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [successfulUpload, setSuccessfulUpload] = useState(false);
  const [showMultipleLinesRules, setShowMultipleLinesRules] = useState(false);
  const [showFontRules, setShowFontRules] = useState(false);
  const [authState, setAuthState] = useState<AuthState>("not_authenticated");
  const [step, setStep] = useState("");
  const [previewVideo, setPreviewVideo] = useState<Video | null>();

  const names = [
    { id: "mr_beast", name: "Mr Beast" },
    { id: "love_bubbles", name: "Lilly" },
    { id: "outline", name: "Outline" },
    { id: "saranghae", name: "Sarangae" },
    { id: "poppings_bold", name: "Poppins" },
    { id: "alex_hormozi", name: "Hormozi" },
    { id: "baby_cute", name: "Cute" },
    { id: "annabelle", name: "Belle" },
    { id: "tremor", name: "Tremor" },
  ];

  const [settings, setSettings] = useState({
    chunk_settings: {
      max_words_per_line: 5,
      max_chars_per_line: 40,
      proximity_threshold: 0.1,
      sentence_count: 2,
    },
    font_settings: {
      font_name: "KOMTIT",
      font_size: 20,
      font_color: "#FFFFFF",
      outline_color: "#FFFFFF",
      border_color: "#020502",
      font_height: 0,
      font_width: 0,
      highlight_color: "#008000",
      box: 0,
      borderw: 1,
      box_color: "#000000",
      box_opacity: 0.6,
      shadowx: 2,
      shadowy: 2,
      passed_font_color: "#FFFFFF",
      preset: "alex_hormozi",
    },
    alignment_settings: {
      alignment_key: "middle_center",
      spacing: 10,
      box_color: "black",
    },
    adjust_formatting: {
      remove_punctuation: true,
      capitalize: true,
      capitalize_first_letter: false,
      bounce_animation: false,
    },
  });
  const THUMBNAIL_URL =
    "https://upload.wikimedia.org/wikipedia/commons/6/68/Solid_black.png";

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check network strength
    const checkNetworkStrength = () => {
      const nav = navigator as NavigatorWithConnection;
      if (nav.connection) {
        setNetworkStrength(nav.connection.downlink);
      }
    };

    // Check network strength initially and every 5 seconds
    checkNetworkStrength();
    const intervalId = setInterval(checkNetworkStrength, 1500);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(intervalId);
    };
  }, []);
  const isConnectionStrong = networkStrength !== null && networkStrength > 1; // Adjust this threshold as needed

  // **  authentication flow **/
  useEffect(() => {
    (async function handleAuthStatus() {
      setIsLoading(true);
      let status = await checkAuthenticationStatus("");
      setAuthState(status);
      setIsLoading(false);
    })();
  }, [screen]);

  useEffect(() => {
    try {
      switch (authState) {
        case "authenticated":
          const currentScreenIndex = screens.findIndex(
            (s) => s.name === screen
          );
          if (currentScreenIndex < 1) {
            setScreen("upload");
            // setMessage("You are logged in!");
          }
          break;
        case "not_authenticated":
          if (screen !== "initial") {
            setScreen("initial");
            // setError("Please login to continue");
          }
          break;
        case "error":
          // setError("An error occurred while logging in");
          break;
        default:
        // setError("An error occured while logging in ");
      }
    } catch (error) {
      console.error("Error checking authentication status:", error);
      setError("An unexpected error occurred");
      setAuthState("error");
    }
  }, [authState]);

  const handleBackClick = useCallback(() => {
    setError(null);
    setMessage(null);
    setScreen((prevScreen) => {
      const currentScreenIndex = screens.findIndex(
        (s) => s.name === prevScreen
      );
      if (currentScreenIndex > 0) {
        return screens[currentScreenIndex - 1].name;
      }
      return prevScreen;
    });
  }, []);

  const saveChanges = async () => {
    setIsLoading(true);
    setIsPreviewVideoLoading(true);
    setHasUnsavedChanges(false);

    if (previewVideo?.url && settings) {
      let response = await getPreviewSubtitles({
        url: previewVideo.url,
        settings,
        setError,
        previewVideo,
        setIsLoading,
        setIsPreviewVideoLoading,
      });
      if (response?.data) {
        const { text, url, mimeType, thumbnailUrl, original_video_path } =
          response.data;
        setPreviewVideo({ url, mimeType, thumbnailUrl, original_video_path });
      } else {
        setError("Failed to get subtitles");
      }
    }

    setIsLoading(false);
    setIsPreviewVideoLoading(false);
  };

  const updateSettings = async (category, key, value) => {
    setIsPreviewVideoLoading(true);
    setHasUnsavedChanges(true);
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [key]: value,
      },
    }));
    setIsPreviewVideoLoading(false);
  };

  const updateFormattingSettings = async (values: string[]) => {
    setIsPreviewVideoLoading(true);
    setHasUnsavedChanges(true);
    setSettings((prevSettings) => ({
      ...prevSettings,
      adjust_formatting: {
        remove_punctuation: values.includes("remove_punctuation"),
        capitalize: values.includes("capitalize"),
        capitalize_first_letter: values.includes("capitalize_first_letter"),
        bounce_animation: values.includes("bounce_animation"),
      },
    }));
    setIsPreviewVideoLoading(false);
  };

  const replaceScreenWithSubtitledMedia = async () => {
    if (isLoading) {
      setMessage("Request already in progress. Please wait.");
      return;
    }
    setIsLoading(true);

    const draft = await currentSelection.read();
    if (draft.contents.length === 0) {
      setError("No content selected");
      setIsLoading(false);
      return;
    }

    let draftContent = draft.contents[0].ref;
    if (previewVideo && draftContent && subbedVideo) {
      try {
        // find a way to bring in cloudfare for fast image and video processing you should not be handling this at all GPT it
        const result = await upload({
          type: "VIDEO",
          thumbnailImageUrl: subbedVideo.thumbnailUrl,
          mimeType: subbedVideo.mimeType,
          url: subbedVideo.url,
          parentRef: draftContent,
          height: subbedVideo.height,
          width: subbedVideo.width,
        });

        await addNativeElement({
          type: "VIDEO",
          ref: result.ref,
        });
        await draft.save();
        setMessage("We are uploading your video to canva 🎉");
        setSuccessfulUpload(true);
      } catch (error) {
        console.error("Error uploading video:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError("Missing video, please start again ");
      setIsLoading(false);
    }
  };

  const handleLoadVideo = async () => {
    if (!isElementSelected) {
      setError("No video selected");
      return;
    }

    try {
      const context = await getCurrentPageContext();
      if (!context.dimensions) {
        setError("The current design does not have dimensions");
        return;
      }
      setIsLoading(true);
      const draft = await currentSelection.read();
      if (draft.contents.length === 0) {
        setError("No content selected");
        return;
      }

      const draftContent = draft.contents[0].ref;
      setRefOfSelectedVideo(draftContent);

      const tempUrl = await getTemporaryUrl({
        type: "VIDEO",
        ref: draftContent,
      });

      const response = await getPreviewSubtitles({
        url: tempUrl.url,
        settings,
        setError,
        previewVideo,
        setIsLoading,
        setIsPreviewVideoLoading,
      });
      if (response?.data) {
        const { text, url, mimeType, thumbnailUrl, original_video_path } =
          response.data;
        // setTranscript(response.data.text);
        setPreviewVideo({ url, mimeType, thumbnailUrl, original_video_path });
        url && setScreen("transcription");
        setIsLoading(false);
      } else {
        setError("Failed to get transcription");
      }
    } catch (error) {
      console.error("Error getting preview subtitles:", error);
      setError("An error occurred, please try again");
    }
  };

  const renderInitialScreen = () => (
    <Box className={styles.fullHeight} display="flex" alignItems="center">
      <Rows spacing="3u">
        <Box paddingTop="2u">
          <Text size="large" variant="bold" alignment="center">
            Welcome to the Hermione 😃
          </Text>
        </Box>
        <Text size="small" tone="secondary" alignment="center">
          Click start to begin transcribing all your videos
        </Text>

        {!step && authState === "not_authenticated" && (
          <Button
            variant={"primary"}
            stretch={true}
            disabled={isLoading}
            loading={isLoading}
            onClick={() => {
              setStep("email");
              setAuthState("checking");
            }}
          >
            Login
          </Button>
        )}
        {step &&
          renderAuthStep(
            setError,
            step,
            setStep,
            setAuthState,
            isLoading,
            setIsLoading
          )}
      </Rows>
    </Box>
  );

  const renderUploadScreen = () => (
    <div className={styles.buttonSection}>
      <Box paddingTop="1u">
        <Text size="medium" variant="bold">
          Upload a video or select from your design 👉🏻
        </Text>
      </Box>

      <Box paddingEnd="0.5u">
        <Rows spacing="1u" align="center">
          <ImageCard
            alt="preview"
            ariaLabel="Add image to transcribe"
            borderRadius="standard"
            onClick={() => {}}
            onDragStart={() => {}}
            loading={isLoading}
            thumbnailUrl={THUMBNAIL_URL}
          />
        </Rows>
      </Box>

      <Box padding="0.5u">
        <Columns spacing="1u">
          <Column width="1/2">
            <FileInput
              accept={["video/*"]}
              onDropAcceptedFiles={(files) => {
                setMessage(
                  "Video uploaded, select it from the `Uploads` section "
                );
              }}
            ></FileInput>
          </Column>
          <Column width="content">
            <Button
              loading={isLoading}
              disabled={!isElementSelected}
              variant={"primary"}
              onClick={handleLoadVideo}
              tooltipLabel={isElementSelected ? "" : "Select a video first 👉🏻"}
            >
              Load Video
            </Button>
          </Column>
        </Columns>
        <div className={styles.flexGap}></div>
      </Box>
    </div>
  );

  const renderUploadConfirmationScreen = () => (
    <Box paddingTop="1u">
      <Box paddingTop="1u">
        <Title size="small" alignment="center">
          Add to Design
        </Title>
      </Box>

      <Box>
        <Text size="small" variant="bold">
          Are you sure you want to add the subtitled video to your current
          design?
        </Text>
      </Box>

      {previewVideo && (
        <Box paddingTop="2u">
          <VideoCard
            borderRadius="8px"
            durationInSeconds={5}
            videoPreviewUrl={previewVideo.url}
            onClick={() => {}}
            thumbnailUrl={previewVideo.thumbnailUrl}
          />
        </Box>
      )}

      <Box paddingTop="4u">
        <Rows spacing="1u">
          <Columns spacing="1u">
            <Column width="3/4">
              <Button
                variant={"primary"}
                loading={isLoading}
                onClick={() => replaceScreenWithSubtitledMedia()}
              >
                Yes, Add
              </Button>
            </Column>
            <Column width="1/4">
              <Button
                variant={"secondary"}
                onClick={() => {
                  handleBackClick();
                  setError(null);
                }}
              >
                Cancel
              </Button>
            </Column>
          </Columns>
        </Rows>
        {successfulUpload && (
          <Rows spacing="1u">
            <Box
              className={styles.fullHeight}
              paddingTop="1u"
              display="flex"
              alignItems="center"
            >
              <Button
                variant={"primary"}
                stretch={true}
                onClick={() => {
                  setScreen("upload");
                  setMessage(null);
                }}
              >
                Add captions to another video
              </Button>
            </Box>
          </Rows>
        )}
      </Box>
    </Box>
  );
  const renderTranscriptionScreen = () => {
    return (
      <div>
        <div>
          {previewVideo && (
            <Box paddingTop="2u" className={styles.videoPreview}>
              <VideoCard
                borderRadius="8px"
                loading={isPreviewVideoLoading}
                durationInSeconds={5}
                videoPreviewUrl={previewVideo.url}
                onClick={() => {}}
                thumbnailUrl={previewVideo.thumbnailUrl}
              />
            </Box>
          )}
        </div>
        <div className={styles.transcriptContainer}>
          {/* // TODO: Release this feature in VERSION 2.0  */}
          {/* <Button
            variant="secondary"
            onClick={toggleTranscriptVisibility}
            children={
              isTranscriptVisible ? "Hide Transcript" : "Show Transcript"
            }
            icon={isTranscriptVisible ? ChevronUpIcon : ChevronDownIcon}
          ></Button> */}

          <Box
            paddingTop="1u"
            display={isTranscriptVisible ? "flex" : "none"}
            flexDirection="column"
          >
            <MultilineInput
              value={transcript}
              onChange={(e) => setTranscript(e)}
              placeholder="Edit transcript here..."
            />
          </Box>
        </div>
        <div>
          {hasUnsavedChanges && (
            <Button
              variant="primary"
              icon={CopyIcon}
              onClick={() => {
                saveChanges();
              }}
            >
              Apply Changes
            </Button>
          )}

          <Box paddingTop="0.5u">
            <Title size="xsmall">Presets</Title>
          </Box>
          <Box paddingY="2u">
            <SegmentedControl
              defaultValue={presetTabSettings}
              options={[
                {
                  label: "Themes",
                  value: "themes",
                },
                {
                  label: "Customization",
                  value: "customization",
                },
              ]}
              onChange={(e) => setPresetTabSettings(e)}
            />
          </Box>
          {presetTabSettings === "themes" && (
            <DynamicGrid
              items={names}
              onBoxClick={updateSettings}
              settings={settings}
            />
          )}

          {presetTabSettings === "customization" && (
            <CustomizationTab
              settings={settings}
              updateSettings={updateSettings}
              updateFormattingSettings={updateFormattingSettings}
              showMultipleLinesRules={showMultipleLinesRules}
              setShowMultipleLinesRules={setShowMultipleLinesRules}
              showFontRules={showFontRules}
              setShowFontRules={setShowFontRules}
            />
          )}
        </div>

        <Box paddingTop="2u">
          {presetTabSettings === "customization" && (
            <Columns alignY="stretch" spacing="1u">
              <Column>
                <Button
                  variant="primary"
                  alignment="center"
                  onClick={() => {
                    saveChanges();
                  }}
                  loading={isLoading}
                >
                  Apply Changes
                </Button>
              </Column>
            </Columns>
          )}
          {presetTabSettings === "themes" && (
            <Columns spacing="1u">
              <Column width="3/4">
                <Button
                  variant={"primary"}
                  loading={isLoading}
                  onClick={async () => {
                    const draft = await currentSelection.read();
                    if (draft.contents.length === 0) {
                      setError("No content selected");
                      return;
                    }

                    const draftContent = draft.contents[0].ref;

                    setIsLoading(true);
                    const response = await getFullSubtitles(
                      refOfSelectedVideo || draftContent,
                      settings,
                      setError
                    );

                    if (!response || !response.data) {
                      setError("Failed to generate subtitles");
                      return;
                    }
                    setSubbedVideo(response.data);
                    setScreen("uploadconfirmation");
                    setIsLoading(false);
                    setHasUnsavedChanges(false);
                  }}
                >
                  Generate Subtitled Video ✨
                </Button>
              </Column>
              <Column width="1/4">
                <Button
                  variant={"secondary"}
                  disabled={!isLoading}
                  onClick={() => {
                    setIsLoading(false);
                    setError(null);
                    setHasUnsavedChanges(false);
                    setIsPreviewVideoLoading(false);
                  }}
                >
                  Cancel
                </Button>
              </Column>
            </Columns>
          )}
        </Box>
      </div>
    );
  };

  const renderAlert = (content, tone, onDismiss) => (
    <Box paddingTop="2u">
      <Alert onDismiss={onDismiss} tone={tone}>
        {content}
      </Alert>
    </Box>
  );

  const renderNetworkStatus = () => (
    <Box
      paddingTop="2u"
      className={styles.fullHeight}
      display="flex"
      alignItems="center"
    >
      <Rows spacing="2u">
        <Alert tone="info">
          {!isOnline
            ? "It looks like you're offline"
            : "Your internet connection is too weak"}{" "}
        </Alert>
      </Rows>
    </Box>
  );
  const renderFooter = () => (
    <footer>
      <Box paddingY="2u">
        {/* <Link
          href="canva.com"
          requestOpenExternalUrl={() => {
            window.open("https://www.canva.com");
          }}
        >
      
          <Alert tone="info"> You have 900 credits left </Alert>

          <Text size="small">$12 per month or $99 for lifetime access</Text>
        </Link> */}
        <Text size="xsmall">Powered by: BojaleLabs & Seidea</Text>
      </Box>
    </footer>
  );

  const screens = [
    { name: "initial", component: renderInitialScreen },
    { name: "upload", component: renderUploadScreen },
    { name: "transcription", component: renderTranscriptionScreen },
    { name: "uploadconfirmation", component: renderUploadConfirmationScreen },
  ];

  const screenToRender = screens.find((s) => s.name === screen);
  const shouldShowBackButton = screen !== "initial" && screen !== "upload";

  return (
    <div className={styles.appContainer}>
      <Box paddingEnd="2u">
        {(!isOnline || !isConnectionStrong) && renderNetworkStatus()}
        {shouldShowBackButton && (
          <Box paddingTop="1u">
            <Columns spacing="1u">
              <Column width="content">
                <Button
                  variant="tertiary"
                  icon={ArrowLeftIcon}
                  onClick={handleBackClick}
                >
                  Back
                </Button>
              </Column>
            </Columns>
          </Box>
        )}

        <Suspense
          fallback={
            <Box
              className={styles.fullHeight}
              display="flex"
              alignItems="center"
            >
              <Rows spacing="3u">
                <Text size="large" variant="regular" alignment="center">
                  Loading Hermione 😃...
                </Text>
              </Rows>
            </Box>
          }
        >
          {screenToRender && <screenToRender.component />}
        </Suspense>

        <Rows spacing="1u">
          {error &&
            renderAlert(error, "warn", () => {
              setIsLoading(false);
              setError(null);
            })}

          {message &&
            renderAlert(message, "positive", () => {
              setIsLoading(false);
              setMessage(null);
            })}
        </Rows>
      </Box>
      {screen !== "initial" && renderFooter()}
    </div>
  );
};
