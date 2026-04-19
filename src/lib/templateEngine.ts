import { Match, TemplateElement } from '../types/template';
import { getContrastColor } from './colorUtils';

// Hỗ trợ truy xuất dữ liệu từ object dựa trên dấu chấm (e.g. "homeTeam.assets.logo")
const getByPath = (obj: any, path: string) => {
  if (!path) return undefined;
  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
};

const applyPipes = (value: any, pipes: string[]): any => {
  let result = value;
  for (const pipe of pipes) {
    const p = pipe.trim().toLowerCase();
    if (p === 'contrast') {
      result = getContrastColor(String(result));
    } else if (p === 'uppercase') {
      result = String(result).toUpperCase();
    } else if (p === 'lowercase') {
      result = String(result).toLowerCase();
    }
  }
  return result;
}

export const isAutoResolved = (dataKey: string, match: Match | null) => {
  if (!match) return false;
  
  // Với cơ chế mới, nếu dataKey tồn tại trong match struct (hoặc bắt đầu bằng match.) 
  // thì nó được tính là auto resolved. 
  // Chúng ta parse dataKey linh hoạt thay vì fix cứng.
  const cleanKey = dataKey.replace(/^match\./, '');
  const value = getByPath(match, cleanKey);
  
  // Hardcoded fallbacks for backwards compatibility or computed fields
  const computedKeys = ["date", "time", "round", "competition.name"];
  return value !== undefined || computedKeys.includes(dataKey);
}

export const resolveBoundData = (
  element: any, 
  match: Match | null, 
  manualInputs: Record<string, string>,
  overrides: any = {}
): any => {
  let resolvedElement = { ...element };
  
  // Helper to process {{bindings}} and pipes inside style properties
  const processStyleValue = (val: any) => {
    if (typeof val === 'string' && val.includes('{{') && val.includes('}}')) {
      const fullKey = val.replace('{{', '').replace('}}', '').trim();
      const parts = fullKey.split('|');
      const key = parts[0].trim();
      const pipes = parts.slice(1);

      const cleanKey = key.replace(/^match\./, '');
      let boundVal = match ? getByPath(match, cleanKey) : undefined;
      
      if (boundVal !== undefined) {
         boundVal = applyPipes(boundVal, pipes);
         return boundVal;
      }
      return val;
    }
    return val;
  };

  // 1. Data Binding logic
  let finalDataKey = overrides?.dataKey !== undefined ? overrides.dataKey : element.dataKey;
  
  if (finalDataKey || element.dataKey) {
    const isAuto = isAutoResolved(finalDataKey || element.dataKey, match);

    if (element.type === "Text" || element.type === "text") {
      let overrideTextVal = overrides?.text !== undefined ? overrides.text : undefined;

      if (overrideTextVal !== undefined) {
         resolvedElement.text = overrideTextVal;
         // Allow static pipes execution inside standard text override if people type {{homeTeam.name | uppercase}} static text.
         resolvedElement.text = processStyleValue(resolvedElement.text); 
      } else if (finalDataKey) {
        if (!isAuto) {
           resolvedElement.text = manualInputs[finalDataKey] !== undefined ? manualInputs[finalDataKey] : `{{${finalDataKey}}}`;
        } else if (match) {
            const cleanKey = finalDataKey.replace(/^match\./, '');
            const val = getByPath(match, cleanKey);
            
            if (val !== undefined) {
               resolvedElement.text = String(val);
            } else {
               // Computed / Alias resolving
               if (finalDataKey === "competition.name") resolvedElement.text = match.league;
               else if (finalDataKey === "date") resolvedElement.text = new Date(match.date).toLocaleDateString("en-GB", { day: 'numeric', month: '2-digit', year: 'numeric' });
               else if (finalDataKey === "time") resolvedElement.text = "19:45"; // mock
               else if (finalDataKey === "round") resolvedElement.text = "Final"; // mock
               else resolvedElement.text = `{{${finalDataKey}}}`;
            }
            
            // Allow applying pipes directly to the data fields if the engine dataKey has a pipe explicitly
            if (finalDataKey.includes('|')) {
                const parts = finalDataKey.split('|');
                const pipes = parts.slice(1);
                resolvedElement.text = applyPipes(resolvedElement.text, pipes);
            }
        }
      }
    } else if (element.type === "Image" || element.type === "image" || element.type === "BackgroundImage") {
      let overrideSrcVal = overrides?.src !== undefined ? overrides.src : undefined;
      
      if (overrideSrcVal !== undefined) {
         resolvedElement.src = overrideSrcVal;
      } else if (finalDataKey) {
          if (!isAuto) {
               resolvedElement.src = manualInputs[finalDataKey] !== undefined ? manualInputs[finalDataKey] : "";
          } else if (match) {
              const cleanKey = finalDataKey.replace(/^match\./, '');
              const val = getByPath(match, cleanKey);
              if (val !== undefined && typeof val === 'string') {
                  resolvedElement.src = val;
              } else {
                  resolvedElement.src = "";
              }
          }
      }
    }
  }

  // 2. Style Binding logic (e.g. fill: "{{homeTeam.colors.primary}}")
  if (resolvedElement.style) {
    resolvedElement.style = { ...resolvedElement.style };
    if (resolvedElement.style.fill) {
      resolvedElement.style.fill = processStyleValue(resolvedElement.style.fill);
    }
    if (resolvedElement.style.stroke) {
      resolvedElement.style.stroke = processStyleValue(resolvedElement.style.stroke);
    }
  }

  // 3. Editor Override logic (applied last)
  if (overrides) {
    if (overrides.x !== undefined || overrides.y !== undefined) {
      resolvedElement.position = {
        ...resolvedElement.position,
        x: overrides.x !== undefined ? overrides.x : resolvedElement.position?.x,
        y: overrides.y !== undefined ? overrides.y : resolvedElement.position?.y
      };
    }
    if (overrides.width !== undefined || overrides.height !== undefined) {
      resolvedElement.size = {
        ...resolvedElement.size,
        width: overrides.width !== undefined ? overrides.width : resolvedElement.size?.width,
        height: overrides.height !== undefined ? overrides.height : resolvedElement.size?.height
      };
    }
    
    // Apply nested style overrides directly to the style object
    if (overrides.align || overrides.fill || overrides.fontFamily || overrides.fontSize) {
      resolvedElement.style = {
        ...resolvedElement.style,
        align: overrides.align !== undefined ? overrides.align : resolvedElement.style?.align,
        fill: overrides.fill !== undefined ? overrides.fill : resolvedElement.style?.fill,
        fontFamily: overrides.fontFamily !== undefined ? overrides.fontFamily : resolvedElement.style?.fontFamily,
        fontSize: overrides.fontSize !== undefined ? overrides.fontSize : resolvedElement.style?.fontSize,
      }
    }

    // Apply root properties like 'opacity', 'dataKey', 'text'
    resolvedElement = {
      ...resolvedElement,
      ...overrides,
      // If the template specifies legacy root fields instead of style object (e.g. text align vs style align)
      align: overrides.align !== undefined ? overrides.align : resolvedElement.align || resolvedElement.style?.align,
      fill: overrides.fill !== undefined ? processStyleValue(overrides.fill) : resolvedElement.fill || resolvedElement.style?.fill,
      fontFamily: overrides.fontFamily !== undefined ? overrides.fontFamily : resolvedElement.fontFamily || resolvedElement.style?.fontFamily,
      fontSize: overrides.fontSize !== undefined ? overrides.fontSize : resolvedElement.fontSize || resolvedElement.style?.fontSize,
      
      // But prevent style object from being overwritten directly if it wasn't cloned properly
      style: resolvedElement.style
    };
  }

  return resolvedElement;
};
