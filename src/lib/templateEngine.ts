import { Match, TemplateElement } from '../types/template';
import { getContrastColor } from './colorUtils';
import { format as formatDate, parseISO } from 'date-fns';

// Hỗ trợ truy xuất dữ liệu từ object dựa trên dấu chấm (e.g. "homeTeam.assets.logo")
const getByPath = (obj: any, path: string) => {
  if (!path || typeof path !== 'string') return undefined;
  
  // Smart fallback for team colors to support legacy records
  if (path.endsWith('.colors.primary')) {
    const standardVal = path.split('.').reduce((acc, part) => acc && acc[part], obj);
    if (standardVal !== undefined && standardVal !== null) return standardVal;
    
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
  // Handle null/undefined results from previous steps
  if (result === null || result === undefined) return "";

  for (const pipeStr of pipes) {
    const trimmed = pipeStr.trim();
    if (!trimmed) continue;
    
    // if result became null/undefined after a pipe
    if (result === null || result === undefined) {
      result = "";
      break;
    }

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
  if (!match || !dataKey || typeof dataKey !== 'string') return false;
  
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

import { resolveAssetPath, ResolverContext } from './assetResolver';

export const resolveBoundData = (
  element: any, 
  match: Match | null, 
  manualInputs: Record<string, string>,
  overrides: any = {},
  resolverContext?: ResolverContext
): any => {
  let resolvedElement = { ...element };
  
  // Helper to process {{bindings}} and pipes inside style properties
  const processStyleValue = (val: any) => {
    if (typeof val === 'string' && val.includes('{{') && val.includes('}}')) {
      return val.replace(/{{([^}]+)}}/g, (matchStr, p1) => {
        const parts = p1.split('|');
        const key = parts[0].trim();
        const pipes = parts.slice(1);

        const cleanKey = key.replace(/^match\./, '');
        
        let boundVal = undefined;
        if (manualInputs && manualInputs[key] !== undefined) {
           boundVal = manualInputs[key];
        } else if (manualInputs && manualInputs[cleanKey] !== undefined) {
           boundVal = manualInputs[cleanKey];
        } else if (match) {
           boundVal = getByPath(match, cleanKey);
        }
        
        if (boundVal !== undefined && boundVal !== null) {
           boundVal = applyPipes(boundVal, pipes);
           return String(boundVal);
        }
        return matchStr; // Keep original {{key}} unresolved
      });
    }
    return val;
  };

  // 1. Text Data Binding logic (runs regardless of dataKey presence for full string interpolation)
  let finalDataKey = overrides?.dataKey !== undefined ? overrides.dataKey : element.dataKey;

  if (element.type === "Text" || element.type === "text") {
    let overrideTextVal = overrides?.text !== undefined ? overrides.text : undefined;
    let overrideBindingPath = overrides?.bindingPath !== undefined ? overrides.bindingPath : undefined;
    
    // Evaluate formatters from props
    let parsedFormatters: string[] = [];
    if (overrides?.formatters !== undefined) {
      parsedFormatters = Array.isArray(overrides.formatters) ? overrides.formatters : [overrides.formatters];
    } else if (element.formatters !== undefined) {
      parsedFormatters = Array.isArray(element.formatters) ? element.formatters : [element.formatters];
    }

    if (overrideTextVal !== undefined) {
       // Manual override 
       resolvedElement.text = processStyleValue(overrideTextVal);
    } else if (overrideBindingPath !== undefined) {
       // Binding Path override
       resolvedElement.text = processStyleValue(overrideBindingPath);
       if (parsedFormatters.length > 0) {
          resolvedElement.text = applyPipes(resolvedElement.text, parsedFormatters);
       }
    } else if (finalDataKey) {
       // Legacy fallback where it uses dataKey directly instead of full string interpolation
       let keyWithoutPipes = finalDataKey;
       let parts: string[] = [];
       if (typeof keyWithoutPipes === 'string' && keyWithoutPipes.includes('|')) {
         parts = keyWithoutPipes.split('|');
         keyWithoutPipes = parts[0].trim();
       }
       const isAuto = isAutoResolved(keyWithoutPipes, match);
       
       if (!isAuto) {
          resolvedElement.text = manualInputs[finalDataKey] !== undefined ? manualInputs[finalDataKey] : `{{${finalDataKey}}}`;
       } else if (match) {
           const cleanKey = keyWithoutPipes.replace(/^match\./, '');
           const val = getByPath(match, cleanKey);
           
           if (val !== undefined && val !== null) {
              resolvedElement.text = String(val);
           } else {
              // Computed / Alias resolving
              if (cleanKey === "competition.name") resolvedElement.text = match.league;
              else if (cleanKey === "date") resolvedElement.text = match.date;
              else if (cleanKey === "time") resolvedElement.text = match.date;
              else if (cleanKey === "round") resolvedElement.text = "Final";
              else resolvedElement.text = `{{${finalDataKey}}}`;
           }
       }
       
       // Apply custom formatters combined with legacy explicit pipeline string
       const combinedPipes = [...parts.slice(1), ...parsedFormatters];
       if (combinedPipes.length > 0) {
           resolvedElement.text = applyPipes(resolvedElement.text, combinedPipes);
       }
    } else {
       // No explicit overrides or dataKey -> process raw text
       if (resolvedElement.text !== undefined && typeof resolvedElement.text === 'string') {
          resolvedElement.text = processStyleValue(resolvedElement.text);
          if (parsedFormatters.length > 0) {
             resolvedElement.text = applyPipes(resolvedElement.text, parsedFormatters);
          }
       }
    }
  }

  // 1.5 Image logic (runs regardless of dataKey presence for URL interpolation)
  if (element.type === "Image" || element.type === "image" || element.type === "BackgroundImage") {
    let overrideSrcVal = overrides?.src !== undefined ? overrides.src : undefined;
    let overrideBindingPath = overrides?.bindingPath !== undefined ? overrides.bindingPath : undefined;
    
    if (overrideSrcVal !== undefined) {
       // If manual input is provided, use it exactly as provided without resolving {{ }}
       resolvedElement.src = overrideSrcVal;
    } else if (overrideBindingPath !== undefined) {
       // If binding path is overridden, use it and resolve it
       resolvedElement.src = processStyleValue(overrideBindingPath);
    } else if (finalDataKey) {
        const isAuto = isAutoResolved(finalDataKey, match);
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
    } else {
       if (resolvedElement.src !== undefined && typeof resolvedElement.src === 'string') {
          resolvedElement.src = processStyleValue(resolvedElement.src);
       }
    }
    
    // Finally, run through the Asset Resolver Pipeline
    if (resolvedElement.src && typeof resolvedElement.src === 'string' && resolverContext) {
      resolvedElement.src = resolveAssetPath(resolvedElement.src, resolverContext);
    }
  }

  // 2. Style Binding logic (e.g. fill: "{{homeTeam.colors.primary}}")
  if (resolvedElement.style) {
    resolvedElement.style = { ...resolvedElement.style };
    
    let overrideFillBindingPath = overrides?.fillBindingPath !== undefined ? overrides.fillBindingPath : undefined;
    if (overrideFillBindingPath !== undefined) {
      resolvedElement.style.fill = processStyleValue(overrideFillBindingPath);
    } else if (resolvedElement.style.fill) {
      resolvedElement.style.fill = processStyleValue(resolvedElement.style.fill);
    }
    
    let overrideStrokeBindingPath = overrides?.strokeBindingPath !== undefined ? overrides.strokeBindingPath : undefined;
    if (overrideStrokeBindingPath !== undefined) {
      resolvedElement.style.stroke = processStyleValue(overrideStrokeBindingPath);
    } else if (resolvedElement.style.stroke) {
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
    stroke: actualOverrides.stroke !== undefined ? processStyleValue(actualOverrides.stroke) : (resolvedElement.stroke !== undefined ? processStyleValue(resolvedElement.stroke) : resolvedElement.style?.stroke),
    strokeWidth: actualOverrides.strokeWidth !== undefined ? actualOverrides.strokeWidth : (resolvedElement.strokeWidth !== undefined ? resolvedElement.strokeWidth : resolvedElement.style?.strokeWidth),
    strokeEnabled: actualOverrides.strokeEnabled !== undefined ? actualOverrides.strokeEnabled : (resolvedElement.strokeEnabled !== undefined ? resolvedElement.strokeEnabled : (resolvedElement as any).style?.strokeEnabled),
    shadowEnabled: actualOverrides.shadowEnabled !== undefined ? actualOverrides.shadowEnabled : (resolvedElement.shadowEnabled !== undefined ? resolvedElement.shadowEnabled : (resolvedElement as any).style?.shadowEnabled),
    shadowColor: actualOverrides.shadowColor !== undefined ? actualOverrides.shadowColor : (resolvedElement.shadowColor !== undefined ? resolvedElement.shadowColor : (resolvedElement as any).style?.shadowColor),
    shadowBlur: actualOverrides.shadowBlur !== undefined ? actualOverrides.shadowBlur : (resolvedElement.shadowBlur !== undefined ? resolvedElement.shadowBlur : (resolvedElement as any).style?.shadowBlur),
    shadowOffsetX: actualOverrides.shadowOffsetX !== undefined ? actualOverrides.shadowOffsetX : (resolvedElement.shadowOffsetX !== undefined ? resolvedElement.shadowOffsetX : (resolvedElement as any).style?.shadowOffsetX),
    shadowOffsetY: actualOverrides.shadowOffsetY !== undefined ? actualOverrides.shadowOffsetY : (resolvedElement.shadowOffsetY !== undefined ? resolvedElement.shadowOffsetY : (resolvedElement as any).style?.shadowOffsetY),
    fontFamily: actualOverrides.fontFamily !== undefined ? actualOverrides.fontFamily : (resolvedElement.fontFamily !== undefined ? resolvedElement.fontFamily : resolvedElement.style?.fontFamily),
    fontSize: actualOverrides.fontSize !== undefined ? actualOverrides.fontSize : (resolvedElement.fontSize !== undefined ? resolvedElement.fontSize : resolvedElement.style?.fontSize),
    
    // But prevent style object from being overwritten directly if it wasn't cloned properly
    style: resolvedElement.style
  };

  return resolvedElement;
};
