import React, { useEffect } from "react";

const FontSelector = ({ onFontsLoaded }) => {
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
        onFontsLoaded(options);
      })
      .catch((error) => {
        console.error("Error fetching fonts:", error);
      });
  }, []);

  return null; // No need to render anything in this component
};

export default FontSelector;
