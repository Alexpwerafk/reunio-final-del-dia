/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        surface: "#1c1c1e",
        "surface-alt": "#2c2c2e",
        border: "#38383a",
        accent: "#ff9500",
        "accent-light": "#ffb340",
        green: "#30d158",
        red: "#ff453a",
        blue: "#007aff",
        text: "#ffffff",
        muted: "#8e8e93",
        tertiary: "#636366",
      },
      fontFamily: {
        sf: ["-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
