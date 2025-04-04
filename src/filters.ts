export const capitalize_cus = (value: string | null) =>{
  if (!value) return '';
  value = value.toString();
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatCurrency(value: number, currencyCode = 'NGN', locale = 'en-NG') {
  const formatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2, // Usually for currencies
  });

  return formatter.format(value);
}

export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit' 
  };
  
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', options);
}
