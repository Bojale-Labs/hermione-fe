import React, { useEffect, useState } from "react";
import {
  Text,
  CheckboxGroup,
  NumberInput,
  Title,
  Select,
  Switch,
  ColorSelector,
  Rows,
  Column,
  Columns,
  Grid,
  Box,
  TypographyCard,
} from "@canva/app-ui-kit";
import styles from "../../styles/components.css";
// import FontSelector from "src/components/FontSelectorBasic";
import { Font } from "src/interfaces";
import { useAuth } from "./useContext";

interface Settings {
  chunk_settings: {
    max_words_per_line: number;
    max_chars_per_line: number;
    proximity_threshold: number;
    // Add other chunk settings as needed
  };
  font_settings: {
    font_name: string;
    font_size: number;
    font_color: string;
    outline_color: string;
    border_color: string;
    font_height: number;
    font_width: number;
    highlight_color: string;
    box: number;
    borderw: number;
    box_color: string;
    box_opacity: number;
    shadowx: number;
    shadowy: number;
    passed_font_color: string;
    // Add other font settings as needed
  };
  alignment_settings: {
    alignment_key: string;

    spacing: number;
    box_color: string;
    // Add other alignment settings as needed
  };
  adjust_formatting: {
    [key: string]: boolean;
    // preset: string;
  };
}

interface CustomizationTabProps {
  settings: Settings;
  updateSettings: (category: string, key: string, value: any) => void;
  updateFormattingSettings: (values: string[]) => void;
  showMultipleLinesRules: boolean;
  setShowMultipleLinesRules: React.Dispatch<React.SetStateAction<boolean>>;
  showFontRules: boolean;
  setShowFontRules: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CustomizationTab = ({
  settings,
  updateSettings,
  updateFormattingSettings,
  showMultipleLinesRules,
  setShowMultipleLinesRules,
  showFontRules,
  setShowFontRules,
}: CustomizationTabProps) => {
  const [showAlignmentRules, setShowAlignmentRules] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(
    settings.alignment_settings.alignment_key
  );
  const [maxWordsPerLine, setMaxWordsPerLine] = useState<number>(
    settings.chunk_settings.max_words_per_line
  );
  const [maxCharsPerLine, setMaxCharsPerLine] = useState<number>(
    settings.chunk_settings.max_chars_per_line
  );
  const [proximityThreshold, setProximityThreshold] = useState<number>(
    settings.chunk_settings.proximity_threshold
  );

  const [fontSize, setFontSize] = useState(settings.font_settings.font_size);

  const handleBlur = (category: string, key: string, value: number) => {
    updateSettings(category, key, value);
  };

  const [fontOptions, setFontOptions] = useState([]);
  const { fontName, setFontName } = useAuth();

  useEffect(() => {
    fetch(`${BACKEND_HOST}/api/canva/font-styles`, {
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const options = data.fonts.map((font) => ({
          label: font,
          value: font,
        }));
        setFontOptions(options);
      })
      .catch((error) => {
        console.error("Error fetching fonts:", error);
      });
  }, []);

  const handleAlignmentClick = (key, id: string) => {
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
      updateSettings("alignment_settings", key, id);
    }
  };
  return (
    <div className={styles.settingsContainer}>
      <Switch
        value={showMultipleLinesRules}
        onChange={() => setShowMultipleLinesRules(!showMultipleLinesRules)}
        label="Multiple Lines Rules"
      />
      {showMultipleLinesRules ? (
        <>
          <Columns alignY="center" spacing="1u">
            <Column width="1/2">
              <Text variant="bold">Max Words per line </Text>
            </Column>

            <Column width="1/2">
              <NumberInput
                min={1}
                defaultValue={maxWordsPerLine}
                value={maxWordsPerLine}
                onChange={(e: number) => setMaxWordsPerLine(e || 1)}
                onBlur={() =>
                  handleBlur(
                    "chunk_settings",
                    "max_words_per_line",
                    maxWordsPerLine
                  )
                }
                placeholder="Max Words Per Line"
              />
            </Column>
          </Columns>

          <Columns alignY="center" spacing="1u">
            <Column width="1/2">
              <Text variant="bold">Max Characters per line </Text>
            </Column>

            <Column width="1/2">
              <NumberInput
                min={1}
                defaultValue={maxCharsPerLine}
                value={maxCharsPerLine}
                onChange={(e: number) => setMaxCharsPerLine(e || 1)}
                onBlur={() =>
                  handleBlur(
                    "chunk_settings",
                    "max_chars_per_line",
                    maxCharsPerLine
                  )
                }
                placeholder="Max Words Per Line"
              />
            </Column>
          </Columns>

          <Columns alignY="center" spacing="1u">
            <Column width="1/2">
              <Text variant="bold">Proximity Threshold </Text>
            </Column>
            <Column width="1/2">
              <NumberInput
                min={0.1}
                step={0.1}
                defaultValue={proximityThreshold}
                value={proximityThreshold}
                onChange={(e: number) => setProximityThreshold(e || 0.1)}
                onBlur={() =>
                  handleBlur(
                    "chunk_settings",
                    "proximity_threshold",
                    proximityThreshold
                  )
                }
                placeholder="Proximity Threshold"
              />
            </Column>
          </Columns>
        </>
      ) : null}
      <Switch
        value={showFontRules}
        onChange={() => setShowFontRules(!showFontRules)}
        label="Font Rules"
      />
      {showFontRules ? (
        <>
          <Text variant="bold">Font Family Name</Text>

          <Select
            value={fontName || settings.font_settings.font_name}
            options={fontOptions}
            onChange={(e) => setFontName(e)}
            onBlur={() => {
              updateSettings("font_settings", "font_name", fontName);
            }}
            stretch
          />
          <Columns alignY="center" spacing="1u">
            <Column width="1/2">
              <Text variant="bold">Font Size </Text>
            </Column>

            <Column width="1/2">
              <NumberInput
                min={1}
                value={fontSize}
                defaultValue={settings.font_settings.font_size}
                onChange={(e: number) => {
                  setFontSize(e || 1);
                }}
                onBlur={() => {
                  handleBlur("font_settings", "font_size", fontSize);
                }}
                placeholder="Font Size"
              />
            </Column>
          </Columns>

          <Columns alignY="center" align="spaceBetween" spacing="1u">
            <Column width="1/2">
              <Text variant="bold">Font Color</Text>
            </Column>
            <Column width="1/5">
              <ColorSelector
                color={settings.font_settings.font_color}
                onChange={(e) =>
                  updateSettings("font_settings", "font_color", e)
                }
              />
            </Column>
          </Columns>
          <Columns alignY="center" align="spaceBetween" spacing="1u">
            <Column width="1/2">
              <Text variant="bold"> Outline Color</Text>
            </Column>
            <Column width="1/5">
              <ColorSelector
                color={settings.font_settings.outline_color}
                onChange={(e) =>
                  updateSettings("font_settings", "outline_color", e)
                }
              />
            </Column>
          </Columns>
          <Columns alignY="center" align="spaceBetween" spacing="1u">
            <Column width="1/2">
              <Text variant="bold"> Border Color</Text>
            </Column>
            <Column width="1/5">
              <ColorSelector
                color={settings.font_settings.border_color}
                onChange={(e) =>
                  updateSettings("font_settings", "border_color", e)
                }
              />
            </Column>
          </Columns>
        </>
      ) : null}

      {/* <Switch
        value={showAlignmentRules}
        onChange={() => setShowAlignmentRules(!showAlignmentRules)}
        label="Text Alignment"
      /> */}
      {/* {showAlignmentRules ? ( */}
      <>
        <Rows spacing="3u">
          <Rows spacing="0.5u">
            <Text size="medium">Subtitle Position </Text>
            <Grid alignX="stretch" alignY="stretch" columns={3} spacing="0.5u">
              {[
                {
                  id: "top_left",
                  name: "Upper Left",
                },
                {
                  id: "top_center",
                  name: "Upper Center",
                },
                { id: "top_right", name: "Upper Right" },

                { id: "middle_left", name: "Middle Left" },
                { id: "middle_center", name: "Middle Center" },
                { id: "middle_right", name: "Middle Right" },
                { id: "bottom_left", name: "Bottom Left" },
                { id: "bottom_center", name: "Bottom Center" },
                { id: "bottom_right", name: "Bottom Right" },
              ].map((item, index) => {
                return (
                  <Box
                    key={index}
                    className={`${
                      item.id === selectedId ? styles.dynamicGridBoxClicked : ""
                    }`}
                    // borderRadius="standard"
                  >
                    <TypographyCard
                      ariaLabel={item.name}
                      onClick={() =>
                        handleAlignmentClick("alignment_key", item.id)
                      }
                    >
                      <Text variant="regular">{item.name}</Text>
                    </TypographyCard>
                  </Box>
                );
              })}
            </Grid>
          </Rows>
        </Rows>
      </>
      {/* ) : null} */}
      {/* Add similar inputs for other alignment settings */}
      <Text variant="bold">Adjust Formatting </Text>
      <CheckboxGroup
        options={[
          { value: "remove_punctuation", label: "Remove Punctuation" },
          { value: "capitalize", label: "Capitalize" },
          {
            value: "capitalize_first_letter",
            label: "Capitalize First Letter",
          },
          { value: "bounce_animation", label: "Bounce Animation" },
        ]}
        value={Object.entries(settings.adjust_formatting)
          .filter(([_, value]) => value)
          .map(([key, _]) => key)}
        onChange={(value) => updateFormattingSettings(value)}
      />
    </div>
  );
};
