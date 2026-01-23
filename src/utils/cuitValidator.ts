export const validateCUIT = (cuit: string): boolean => {
  const cleanCuit = cuit.replace(/-/g, "");
  if (cleanCuit.length !== 11) return false;

  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCuit[i]) * weights[i];
  }

  let checkDigit = 11 - (sum % 11);
  if (checkDigit === 11) checkDigit = 0;
  if (checkDigit === 10) checkDigit = 9;

  return checkDigit === parseInt(cleanCuit[10]);
};