export type ValidationRule = (value: string) => string | null;

export const validators = {
  required: (msg?: string): ValidationRule => (value: string) =>
    value.trim() ? null : msg || 'Это поле обязательно',

  email: (msg?: string): ValidationRule => (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? null : msg || 'Введите корректный email',

  minLength: (min: number, msg?: string): ValidationRule => (value: string) =>
    value.length >= min ? null : msg || `Минимум ${min} символов`,

  maxLength: (max: number, msg?: string): ValidationRule => (value: string) =>
    value.length <= max ? null : msg || `Максимум ${max} символов`,

  match: (otherValue: string, msg?: string): ValidationRule => (value: string) =>
    value === otherValue ? null : msg || 'Значения не совпадают',
};

export function validateField(value: string, rules: ValidationRule[]): string | null {
  for (const rule of rules) {
    const error = rule(value);
    if (error) return error;
  }
  return null;
}

export function validateForm(
  fields: Record<string, string>,
  rules: Record<string, ValidationRule[]>,
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const [field, fieldRules] of Object.entries(rules)) {
    const error = validateField(fields[field] || '', fieldRules);
    if (error) errors[field] = error;
  }
  return errors;
}
