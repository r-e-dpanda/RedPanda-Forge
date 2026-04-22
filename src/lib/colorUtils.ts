/**
 * Helper utilities for working with colors and assets.
 */

// Convert HEX to YIQ to calculate contrast.
// Returns "#FFFFFF" (white) if the background is dark, or "#000000" (black) if the background is light.
export function getContrastColor(hexcolor: string): string {
    // If empty, default to black
    if (!hexcolor) return "#000000";
    
    // Remove '#' if present
    const hex = hexcolor.replace('#', '');
    if (hex.length !== 6 && hex.length !== 3) return "#000000";
    
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    }
    
    // YIQ ratio algorithm
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Standard threshold is >= 128 (light) -> black text, otherwise white text.
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}
