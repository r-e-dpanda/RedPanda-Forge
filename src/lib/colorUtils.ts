/**
 * Helper utilities for working with colors and assets.
 */

// Chuyển đổi HEX sang YIQ để tính toán contrast.
// Trả về "#FFFFFF" (trắng) nếu nền tối, hoặc "#000000" (đen) nếu nền sáng.
export function getContrastColor(hexcolor: string): string {
    // Nếu rỗng, mặc định là đen
    if (!hexcolor) return "#000000";
    
    // Loại bỏ '#' nếu có
    const hex = hexcolor.replace('#', '');
    if (hex.length !== 6 && hex.length !== 3) return "#000000";
    
    let r = 0, g = 0, b = 0;
    if (hex.length === 3) {
      r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
      g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
      b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
    } else {
      r = parseInt(hex.substr(0, 2), 16);
      g = parseInt(hex.substr(2, 2), 16);
      b = parseInt(hex.substr(4, 2), 16);
    }
    
    // Thuật toán YIQ ratio
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Ngưỡng tiêu chuẩn là >= 128 (sáng) -> chữ đen, ngược lại chữ trắng.
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
}
