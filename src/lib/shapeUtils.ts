import { TemplateNode, ShapeElement } from "../types/template";

export type CanonicalShapeType = "ellipse" | "quad" | "polygon";

export function normalizeShape(element: any): any {
  if (element.type !== "Shape") return element;

  const shapeType = (element.shapeType || "rect").toLowerCase();
  const normalized: any = { ...element };

  switch (shapeType) {
    case "circle":
      normalized.shapeType = "ellipse";
      normalized.radiusX = element.r ?? (element.width ? element.width / 2 : (element.size?.width ? element.size.width / 2 : 50));
      normalized.radiusY = element.r ?? (element.height ? element.height / 2 : (element.size?.height ? element.size.height / 2 : 50));
      normalized.x = element.cx ?? element.x ?? 0;
      normalized.y = element.cy ?? element.y ?? 0;
      // Cleanup aliases
      delete normalized.r;
      delete normalized.cx;
      delete normalized.cy;
      break;

    case "ellipse":
      normalized.shapeType = "ellipse";
      normalized.radiusX = element.rx ?? element.radiusX ?? (element.width ? element.width / 2 : (element.size?.width ? element.size.width / 2 : 50));
      normalized.radiusY = element.ry ?? element.radiusY ?? (element.height ? element.height / 2 : (element.size?.height ? element.size.height / 2 : 50));
      normalized.x = element.cx ?? element.x ?? 0;
      normalized.y = element.cy ?? element.y ?? 0;
      delete normalized.rx;
      delete normalized.ry;
      delete normalized.cx;
      delete normalized.cy;
      break;

    case "rect":
    case "square":
      normalized.shapeType = "quad";
      normalized.topWidth = element.topWidth ?? element.width ?? element.size?.width ?? 100;
      normalized.width = element.width ?? element.size?.width ?? 100;
      normalized.skewX = element.skewX ?? 0;
      break;

    case "quad":
      normalized.shapeType = "quad";
      normalized.topWidth = element.topWidth ?? element.width ?? element.size?.width ?? 100;
      normalized.width = element.width ?? element.size?.width ?? 100;
      normalized.skewX = element.skewX ?? 0;
      break;
    
    case "polygon":
      normalized.shapeType = "polygon";
      break;

    default:
      // Fallback
      normalized.shapeType = "quad";
      break;
  }

  return normalized;
}

export function normalizeTemplate(template: any): any {
  return {
    ...template,
    layers: template.layers.map((layer: any) => ({
      ...layer,
      elements: (layer.elements || layer.children || []).map(normalizeShape)
    }))
  };
}
