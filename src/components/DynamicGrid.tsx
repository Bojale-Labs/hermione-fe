import React, { useState } from "react";
import {
  Grid,
  Box,
  Title,
  Text,
  Button,
  TypographyCard,
} from "@canva/app-ui-kit";
import "styles/components.css";
import styles from "styles/components.css";

export const DynamicGrid = ({ items, onBoxClick, settings }) => {
  const [selectedId, setSelectedId] = useState<string>(
    settings.font_settings.preset
  );

  const handleClick = (id: string) => {
    if (selectedId === id) {
      setSelectedId("");
    } else {
      setSelectedId(id);
      onBoxClick("font_settings", "preset", id);
    }
  };

  return (
    <Grid alignX="stretch" alignY="stretch" columns={3} spacing="0.5u">
      {items.map((item: { name: string; id: string }, index: number) => {
        return (
          <Box
            key={index}
            className={`${
              item.id === selectedId ? styles.dynamicGridBoxClicked : ""
            }`}
            borderRadius="standard"
          >
            <TypographyCard
              ariaLabel={item.name}
              onClick={() => handleClick(item.id)}
            >
              <Text variant="bold">{item.name}</Text>
            </TypographyCard>
          </Box>
        );
      })}
    </Grid>
  );
};
export default DynamicGrid;
