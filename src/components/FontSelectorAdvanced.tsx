import React, { useState, useCallback } from "react";
import { FixedSizeList as List } from "react-window";
import { TextInput } from "@canva/app-ui-kit";
import { Font } from "src/interfaces";

interface FontPreviewProps {
  font: Font;
  onClick: (font: Font) => void;
}

const FontPreview: React.FC<FontPreviewProps> = ({ font, onClick }) => {
  return (
    <div
      onClick={() => onClick(font)}
      style={{
        fontFamily: font.name,
        cursor: "pointer",
        padding: "10px",
        borderBottom: "1px solid #eee",
      }}
    >
      <style>{`
        @font-face {
          font-family: '${font.name}';
          src: url(${font.url}) format('ttf');
        }
      `}</style>
      {font.name}
    </div>
  );
};

interface FontSelectorProps {
  fonts: Font[];
  onSelect: (font: Font) => void;
}

const FontSelector: React.FC<FontSelectorProps> = ({ fonts, onSelect }) => {
  const [search, setSearch] = useState("");
  const filteredFonts = fonts.filter((font) =>
    font.name.toLowerCase().includes(search.toLowerCase())
  );

  const Row = useCallback(
    ({ index, style }) => (
      <div style={style}>
        <FontPreview font={filteredFonts[index]} onClick={onSelect} />
      </div>
    ),
    [filteredFonts, onSelect]
  );

  return (
    <div>
      <TextInput
        value={search}
        onChange={(e) => setSearch(e)}
        placeholder="Search fonts..."
      />
      <List
        height={400}
        itemCount={filteredFonts.length}
        itemSize={50}
        width={300}
      >
        {Row}
      </List>
    </div>
  );
};

export default FontSelector;
