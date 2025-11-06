// Utility function for combining class names with conditional support
// Supports strings, arrays, and object maps of class -> boolean
type ClassValue = string | number | boolean | null | undefined | ClassDictionary | ClassArray;
type ClassDictionary = { [className: string]: any };
type ClassArray = ClassValue[];

function toClassNames(value: ClassValue): string[] {
  const result: string[] = [];
  if (!value) return result;
  if (typeof value === 'string') {
    result.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) result.push(...toClassNames(v));
  } else if (typeof value === 'object') {
    for (const key in value as ClassDictionary) {
      if ((value as ClassDictionary)[key]) result.push(key);
    }
  }
  return result;
}

export function cn(...inputs: ClassValue[]) {
  const classes: string[] = [];
  for (const input of inputs) classes.push(...toClassNames(input));
  return classes.join(' ').trim();
}