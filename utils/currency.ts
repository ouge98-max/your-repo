export const getCurrencySymbol = (currencyCode?: string): string => {
    if (!currencyCode) return '';
    const symbols: { [key: string]: string } = {
        'BDT': '৳',
        'USD': '$',
        'CNY': '¥',
        'GBP': '£',
        'EUR': '€',
        'INR': '₹',
    };
    return symbols[currencyCode.toUpperCase()] || currencyCode;
};
