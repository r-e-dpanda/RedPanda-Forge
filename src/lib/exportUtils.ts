import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TemplateBase } from '../types/template';
import { MatchData } from '../types/match';

export async function exportHTMLZip(
  template: TemplateBase, 
  elements: any[], 
  match: MatchData | null, 
  fallbackId: string,
  canvasBgColor: string = 'transparent'
) {
  const zip = new JSZip();
  const assetsFolder = zip.folder('assets');
  let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Export ${fallbackId}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: transparent;
      overflow: hidden;
    }
    .canvas-container {
      position: relative;
      width: ${template.canvas.width}px;
      height: ${template.canvas.height}px;
      background-color: ${canvasBgColor};
      overflow: hidden;
    }
    .element {
      position: absolute;
      transform-origin: center center;
    }
  </style>
</head>
<body>
  <div class="canvas-container">
`;

  let assetCounter = 0;

  for (const element of elements) {
    const w = element.width || 0;
    const h = element.height || 0;
    const x = element.x;
    const y = element.y;
    const skX = element.skewX || 0;
    const rot = element.rotation || 0;
    const opacity = element.opacity !== undefined ? element.opacity : 1;
    
    const transformOrigin = `50% 50%`;
    const transform = `rotate(${rot}deg) skewX(${skX}deg) scaleX(${element.flipX ? -1 : 1}) scaleY(${element.flipY ? -1 : 1})`;
    const zIndex = element.zIndex || 0;
    
    let style = `left: ${x}px; top: ${y}px; width: ${w}px; height: ${h}px; transform-origin: ${transformOrigin}; transform: ${transform}; opacity: ${opacity}; z-index: ${zIndex};`;

    if (element.type === 'image' || element.type === 'Image') {
      let src = element.src;
      if (src && !src.startsWith('data:')) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const ext = src.split('.').pop()?.split('?')[0] || 'png';
          const safeExt = ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext.toLowerCase()) ? ext : 'png';
          const filename = `image_${assetCounter++}.${safeExt}`;
          assetsFolder?.file(filename, blob);
          src = `assets/${filename}`;
        } catch (e) {
          console.error("Failed to fetch image for HTML export", e);
        }
      }
      
      const objectFit = element.cropEnabled ? 'cover' : 'contain';
      const borderRadius = element.cornerRadius ? `border-radius: ${element.cornerRadius}px;` : '';
      
      htmlContent += `    <img class="element" src="${src}" style="${style} object-fit: ${objectFit}; ${borderRadius}">\n`;
    } 
    else if (element.type === 'Shape') {
      const bgColor = element.fill || 'transparent';
      const stroke = element.strokeEnabled !== false && element.strokeWidth > 0 
        ? `border: ${element.strokeWidth}px solid ${element.stroke || '#000'};` : '';
      const borderRadius = element.cornerRadius ? `border-radius: ${element.cornerRadius}px;` : '';
      const shadows = element.shadowEnabled ? `box-shadow: ${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur || 0}px ${element.shadowColor || 'rgba(0,0,0,0.5)'};` : '';
      
      htmlContent += `    <div class="element" style="${style} background-color: ${bgColor}; ${stroke} ${borderRadius} ${shadows}"></div>\n`;
    }
    else if (element.type === 'Text') {
      const text = element.text || '';
      const fontFamily = element.fontFamily || 'Arial';
      const fontSize = element.fontSize || 32;
      const color = element.fill || '#fff';
      const align = element.align || 'left';
      const fontStyle = element.fontStyle || 'normal'; 
      const isBold = fontStyle.includes('bold');
      const isItalic = fontStyle.includes('italic');
      const fontWeight = isBold ? 'bold' : 'normal';
      const verticalAlign = element.verticalAlign === 'middle' ? 'center' : (element.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start');
      const display = 'flex';
      const shadows = element.shadowEnabled ? `text-shadow: ${element.shadowOffsetX || 0}px ${element.shadowOffsetY || 0}px ${element.shadowBlur || 0}px ${element.shadowColor || 'rgba(0,0,0,0.5)'};` : '';
      
      htmlContent += `    <div class="element" style="${style} font-family: '${fontFamily}', sans-serif; font-size: ${fontSize}px; color: ${color}; text-align: ${align}; display: ${display}; align-items: ${verticalAlign}; justify-content: ${align === 'center' ? 'center' : (align === 'right' ? 'flex-end' : 'flex-start')}; font-weight: ${fontWeight}; font-style: ${isItalic ? 'italic' : 'normal'}; ${shadows}">${text.replace(/\n/g, '<br/>')}</div>\n`;
    }
  }

  htmlContent += `  </div>\n</body>\n</html>`;

  zip.file('index.html', htmlContent);

  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `redpanda-${fallbackId}-${Date.now()}.zip`);
}

export async function exportSVG(
  template: TemplateBase, 
  elements: any[], 
  fallbackId: string,
  canvasBgColor: string = 'transparent'
) {
  let svgContent = `<?xml version="1.0" encoding="UTF-8" ?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${template.canvas.width}" height="${template.canvas.height}" viewBox="0 0 ${template.canvas.width} ${template.canvas.height}">\n`;

  if (canvasBgColor && canvasBgColor !== 'transparent') {
    svgContent += `  <rect width="${template.canvas.width}" height="${template.canvas.height}" fill="${canvasBgColor}" />\n`;
  }

  for (const element of elements) {
    const w = element.width || 0;
    const h = element.height || 0;
    const x = element.x;
    const y = element.y;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const skX = element.skewX || 0;
    const rot = element.rotation || 0;
    const flipX = element.flipX ? -1 : 1;
    const flipY = element.flipY ? -1 : 1;
    const opacity = element.opacity !== undefined ? element.opacity : 1;
    
    const transform = `translate(${cx},${cy}) rotate(${rot}) skewX(${-skX}) scale(${flipX},${flipY}) translate(${-cx},${-cy})`;

    if (element.type === 'image' || element.type === 'Image') {
      let src = element.src;
      if (src && !src.startsWith('data:')) {
        try {
          const response = await fetch(src);
          const blob = await response.blob();
          const reader = new FileReader();
          src = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        } catch(e) {
          console.error("Failed to fetch image for SVG export", e);
        }
      }
      
      const rx = element.cornerRadius ? `rx="${element.cornerRadius}"` : '';
      const par = element.cropEnabled ? "xMidYMid slice" : "xMidYMid meet";
      svgContent += `  <image preserveAspectRatio="${par}" href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" transform="${transform}" opacity="${opacity}" ${rx} />\n`;
    } 
    else if (element.type === 'Shape') {
      const bgColor = element.fill || 'transparent';
      const strokeStr = element.strokeEnabled !== false && element.strokeWidth > 0 
        ? `stroke="${element.stroke || '#000'}" stroke-width="${element.strokeWidth}"` : '';
      const rx = element.cornerRadius ? `rx="${element.cornerRadius}"` : '';
      
      svgContent += `  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bgColor}" ${strokeStr} transform="${transform}" opacity="${opacity}" ${rx} />\n`;
    }
    else if (element.type === 'Text') {
      const text = element.text || '';
      const fontFamily = element.fontFamily || 'Arial';
      const fontSize = element.fontSize || 32;
      const color = element.fill || '#fff';
      const align = element.align || 'left';
      const fontStyle = element.fontStyle || 'normal'; 
      const isBold = fontStyle.includes('bold');
      const isItalic = fontStyle.includes('italic');
      
      let textAnchor = "start";
      let tx = x;
      if (align === 'center') { textAnchor = 'middle'; tx = x + w/2; }
      if (align === 'right') { textAnchor = 'end'; tx = x + w; }
      
      let ty = y + fontSize; 
      if (element.verticalAlign === 'middle') ty = y + h/2 + fontSize/3;
      if (element.verticalAlign === 'bottom') ty = y + h - fontSize/4;
      
      const fw = isBold ? 'font-weight="bold"' : '';
      const fs = isItalic ? 'font-style="italic"' : '';
      
      const lines = text.split('\n');
      if (lines.length === 1) {
        svgContent += `  <text x="${tx}" y="${ty}" font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" text-anchor="${textAnchor}" ${fw} ${fs} transform="${transform}" opacity="${opacity}">${text}</text>\n`;
      } else {
        svgContent += `  <text font-family="${fontFamily}" font-size="${fontSize}" fill="${color}" text-anchor="${textAnchor}" ${fw} ${fs} transform="${transform}" opacity="${opacity}">\n`;
        lines.forEach((line: string, i: number) => {
          let lty = ty + i * (fontSize * 1.2); 
          svgContent += `    <tspan x="${tx}" y="${lty}">${line}</tspan>\n`;
        });
        svgContent += `  </text>\n`;
      }
    }
  }

  svgContent += `</svg>`;

  const blob = new Blob([svgContent], {type: "image/svg+xml;charset=utf-8"});
  saveAs(blob, `redpanda-${fallbackId}-${Date.now()}.svg`);
}
