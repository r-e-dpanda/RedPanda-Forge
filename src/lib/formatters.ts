/**
 * Data-binding Value Formatters
 * Engine xử lý các transformation được khai báo trong template. 
 * Ví dụ pipeline: "homeTeam.name | uppercase | shorten:10" (nếu có hỗ trợ pipe)
 * Hàm formatter bên dưới hỗ trợ cú pháp như người dùng đã mô tả.
 */

export const FORMATTERS = {
  uppercase: (val: string) => String(val).toUpperCase(),
  lowercase: (val: string) => String(val).toLowerCase(),
  titlecase: (val: string) => {
    return String(val)
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },
  shorten: (val: string, args: string[]) => {
    const limit = parseInt(args[0], 10) || 15;
    const str = String(val);
    return str.length > limit ? str.substring(0, limit) + "..." : str;
  },
  date: (val: string, args: string[]) => {
    if (!val) return "";
    const format = args[0] || "DD/MM/YYYY HH:mm";
    try {
      const d = new Date(val);
      // Fallback formatter đơn giản nêú chưa cài date-fns / moment
      // Format ví dụ hỗ trợ: DD/MM/YYYY HH:mm
      let result = format;
      result = result.replace("DD", String(d.getDate()).padStart(2, "0"));
      result = result.replace("MM", String(d.getMonth() + 1).padStart(2, "0"));
      result = result.replace("YYYY", String(d.getFullYear()));
      result = result.replace("HH", String(d.getHours()).padStart(2, "0"));
      result = result.replace("mm", String(d.getMinutes()).padStart(2, "0"));
      return result;
    } catch {
      return val;
    }
  },
  time: (val: string, args: string[]) => {
    if (!val) return "";
    try {
      const d = new Date(val);
      const format = args[0] || "HH:mm";
      let result = format;
      result = result.replace("HH", String(d.getHours()).padStart(2, "0"));
      result = result.replace("mm", String(d.getMinutes()).padStart(2, "0"));
      return result;
    } catch {
      return val;
    }
  },
  replace: (val: string, args: string[]) => {
    if (args.length < 2) return val;
    const [oldVal, newVal] = args;
    return String(val).replace(new RegExp(oldVal, "g"), newVal);
  },
  teamShort: (val: string) => {
    // Lý tưởng nhất là có Dictionary Map ID hoặc tên => Tên viết tắt
    // Đây là Fallback logic tự sinh chữ cái
    const knownTeams: Record<string, string> = {
      "Manchester United": "MU",
      "Manchester City": "MCI",
      "Arsenal": "ARS",
      "Chelsea": "CHE",
      "Liverpool FC": "LFC"
    };
    if (knownTeams[val]) return knownTeams[val];
    
    // Tự động rút gọn (Ví dụ: "Red Pandas" -> "RP")
    return String(val)
      .split(" ")
      .map(w => w.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 3);
  },
  number: (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    return new Intl.NumberFormat().format(num);
  },
  prefix: (val: string, args: string[]) => {
    return args[0] ? `${args[0]} ${val}` : val;
  },
  suffix: (val: string, args: string[]) => {
    return args[0] ? `${val} ${args[0]}` : val;
  }
};

/**
 * Áp dụng một chuỗi format directives (nếu có) trên data value.
 * Tương lai chúng ta có thể parse format ngay trong dataKey, ví dụ:
 * dataKey: "match.venue | uppercase | prefix:VS "
 */
export const applyFormatters = (value: any, pipeline: string) => {
  if (value === undefined || value === null) return "";
  
  const rules = pipeline.split("|").map(s => s.trim()).filter(Boolean);
  let result = value;

  for (const rule of rules) {
    const parts = rule.split(":");
    const formatterName = parts[0] as keyof typeof FORMATTERS;
    const args = parts.slice(1);
    
    if (FORMATTERS[formatterName]) {
      // @ts-ignore
      result = FORMATTERS[formatterName](result, args);
    }
  }

  return result;
};
