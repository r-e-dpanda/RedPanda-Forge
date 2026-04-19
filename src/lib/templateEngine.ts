import { Match, TemplateElement } from '../types/template';
import { getContrastColor } from './colorUtils';
import { format as formatDate, parseISO } from 'date-fns';

// Hỗ trợ truy xuất dữ liệu từ object dựa trên dấu chấm (e.g. "homeTeam.assets.logo")
const getByPath = (obj: any, path: string) => {
  if (!path) return undefined;
  
  // Smart fallback for team colors to support legacy records
  if (path.endsWith('.colors.primary')) {
    const standardVal = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (standardVal !== undefined) return standardVal;
    
    // Fallback to .color
    const fallbackPath = path.replace('.colors.primary', '.color');
    return fallbackPath.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  return path.split('.').reduce((acc, part) => {
    if (acc === null || acc === undefined) return undefined;
    return acc[part];
  }, obj);
};

const applyPipes = (value: any, pipes: string[]): any => {
  let result = value;
  for (const pipeStr of pipes) {
    const trimmed = pipeStr.trim();
    if (!trimmed) continue;

    const firstColIdx = trimmed.indexOf(':');
    let pName = trimmed.toLowerCase();
    let pArgs = '';
    
    if (firstColIdx !== -1) {
       pName = trimmed.substring(0, firstColIdx).trim().toLowerCase();
       pArgs = trimmed.substring(firstColIdx + 1).trim();
    }

    if (pName === 'contrast') {
      result = result ? getContrastColor(String(result)) : "#000000";
    } else if (pName === 'uppercase') {
      result = String(result).toUpperCase();
    } else if (pName === 'lowercase') {
      result = String(result).toLowerCase();
    } else if (pName === 'titlecase') {
       if (result) {
         result = String(result).replace(
           /\w\S*/g,
           (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
         );
       }
    } else if (pName === 'shorten') {
      const len = parseInt(pArgs, 10);
      if (!isNaN(len) && typeof result === 'string' && result.length > len) {
        result = result.substring(0, len).trim() + '...';
      }
    } else if (pName === 'date' || pName === 'time') {
      if (result) {
        try {
          const d = typeof result === 'string' ? parseISO(result) : new Date(result);
          if (!isNaN(d.getTime())) {
            const fmtStr = pArgs || (pName === 'time' ? 'HH:mm' : 'dd/MM/yyyy');
            result = formatDate(d, fmtStr);
          }
        } catch (e) {
          // keep original if invalid
        }
      }
    } else if (pName === 'replace') {
      const secondColIdx = pArgs.indexOf(':');
      if (secondColIdx !== -1 && result) {
         const oldStr = pArgs.substring(0, secondColIdx);
         const newStr = pArgs.substring(secondColIdx + 1);
         result = String(result).split(oldStr).join(newStr);
      }
    } else if (pName === 'number') {
      const num = Number(result);
      if (!isNaN(num)) result = new Intl.NumberFormat('en-US').format(num);
    } else if (pName === 'boolean') {
      const truthyVal = pArgs.split(':')[0] || 'Yes';
      const falsyVal = pArgs.split(':')[1] || 'No';
      result = result ? truthyVal : falsyVal;
    } else if (pName === 'json') {
      try {
        result = JSON.stringify(result, null, 2);
      } catch (e) {
        // keep original if invalid
      }
    } else if (pName === 'prefix') {
      result = pArgs + String(result || "");
    } else if (pName === 'suffix') {
      result = String(result || "") + pArgs;
    }
  }
  return result;
}

export const isAutoResolved = (dataKey: string, match: Match | null) => {
  if (!match) return false;
  
  // Với cơ chế mới, nếu dataKey tồn tại trong match struct (hoặc bắt đầu bằng match.) 
  // thì nó được tính là auto resolved. 
  // Chúng ta parse dataKey linh hoạt thay vì fix cứng.
  const keyWithoutPipes = dataKey.split('|')[0].trim();
  const cleanKey = keyWithoutPipes.replace(/^match\./, '');
  const value = getByPath(match, cleanKey);
  
  // Hardcoded fallbacks for backwards compatibility or computed fields
  const computedKeys = ["date", "time", "round", "competition.name"];
  return value !== undefined || computedKeys.includes(keyWithoutPipes);
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
    let keyWithoutPipes = finalDataKey || element.dataKey;
    let parts: string[] = [];
    if (keyWithoutPipes.includes('|')) {
      parts = keyWithoutPipes.split('|');
      keyWithoutPipes = parts[0].trim();
    }
    
    // Evaluate formatters from props
    let parsedFormatters: string[] = [];
    if (overrides?.formatters !== undefined) {
      parsedFormatters = Array.isArray(overrides.formatters) ? overrides.formatters : [overrides.formatters];
    } else if (element.formatters !== undefined) {
      parsedFormatters = Array.isArray(element.formatters) ? element.formatters : [element.formatters];
    }
    const isAuto = isAutoResolved(keyWithoutPipes, match);

    if (element.type === "Text" || element.type === "text") {
      let overrideTextVal = overrides?.text !== undefined ? overrides.text : undefined;

      if (overrideTextVal !== undefined) {
         resolvedElement.text = overrideTextVal;
         // Allow static pipes execution inside standard text override if people type {{homeTeam.name | uppercase}} static text.
         resolvedElement.text = processStyleValue(resolvedElement.text);
         if (parsedFormatters.length > 0) {
            resolvedElement.text = applyPipes(resolvedElement.text, parsedFormatters);
         }
      } else if (finalDataKey) {
        if (!isAuto) {
           resolvedElement.text = manualInputs[finalDataKey] !== undefined ? manualInputs[finalDataKey] : `{{${finalDataKey}}}`;
        } else if (match) {
            const cleanKey = keyWithoutPipes.replace(/^match\./, '');
            const val = getByPath(match, cleanKey);
            
            if (val !== undefined) {
               resolvedElement.text = String(val);
            } else {
               // Computed / Alias resolving
               if (cleanKey === "competition.name") resolvedElement.text = match.league;
               else if (cleanKey === "date") resolvedElement.text = match.date; // Native ISO parsed by pipe, or used as is
               else if (cleanKey === "time") resolvedElement.text = match.date; // Pipe time:HH:mm will parse it
               else if (cleanKey === "round") resolvedElement.text = "Final"; // mock
               else resolvedElement.text = `{{${finalDataKey}}}`;
            }
            
            // Allow applying custom formatters combined with legacy explicit pipeline string
            const combinedPipes = [...parts.slice(1), ...parsedFormatters];
            if (combinedPipes.length > 0) {
                resolvedElement.text = applyPipes(resolvedElement.text, combinedPipes);
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
  const actualOverrides = overrides || {};
  
  if (actualOverrides.x !== undefined || actualOverrides.y !== undefined) {
    resolvedElement.position = {
      ...resolvedElement.position,
      x: actualOverrides.x !== undefined ? actualOverrides.x : resolvedElement.position?.x,
      y: actualOverrides.y !== undefined ? actualOverrides.y : resolvedElement.position?.y
    };
  }
  if (actualOverrides.width !== undefined || actualOverrides.height !== undefined) {
    resolvedElement.size = {
      ...resolvedElement.size,
      width: actualOverrides.width !== undefined ? actualOverrides.width : resolvedElement.size?.width,
      height: actualOverrides.height !== undefined ? actualOverrides.height : resolvedElement.size?.height
    };
  }
  
  // Apply nested style overrides directly to the style object
  if (actualOverrides.align || actualOverrides.fill || actualOverrides.fontFamily || actualOverrides.fontSize) {
    resolvedElement.style = {
      ...resolvedElement.style,
      align: actualOverrides.align !== undefined ? actualOverrides.align : resolvedElement.style?.align,
      fill: actualOverrides.fill !== undefined ? actualOverrides.fill : resolvedElement.style?.fill,
      fontFamily: actualOverrides.fontFamily !== undefined ? actualOverrides.fontFamily : resolvedElement.style?.fontFamily,
      fontSize: actualOverrides.fontSize !== undefined ? actualOverrides.fontSize : resolvedElement.style?.fontSize,
    }
  }

  // Clean up undefined values from actualOverrides so they don't break the spread operator
  const cleanOverrides = Object.entries(actualOverrides).reduce((acc, [key, value]) => {
    if (value !== undefined) acc[key] = value;
    return acc;
  }, {} as Record<string, any>);

    // Apply root properties like 'opacity', 'dataKey', 'text'
  resolvedElement = {
    ...resolvedElement,
    ...cleanOverrides,
    // Fix Fallback parsing - check actualOverrides first, then element.align, then element.style.align
    align: actualOverrides.align !== undefined ? actualOverrides.align : (resolvedElement.align !== undefined ? resolvedElement.align : resolvedElement.style?.align),
    fill: actualOverrides.fill !== undefined ? processStyleValue(actualOverrides.fill) : (resolvedElement.fill !== undefined ? processStyleValue(resolvedElement.fill) : resolvedElement.style?.fill),
    fontFamily: actualOverrides.fontFamily !== undefined ? actualOverrides.fontFamily : (resolvedElement.fontFamily !== undefined ? resolvedElement.fontFamily : resolvedElement.style?.fontFamily),
    fontSize: actualOverrides.fontSize !== undefined ? actualOverrides.fontSize : (resolvedElement.fontSize !== undefined ? resolvedElement.fontSize : resolvedElement.style?.fontSize),
    
    // But prevent style object from being overwritten directly if it wasn't cloned properly
    style: resolvedElement.style
  };

  return resolvedElement;
};
