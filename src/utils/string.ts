export function formatPhoneNumber(phoneNumber) {
  // Удаляем все символы, кроме цифр
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');

  // Проверяем, что длина номера составляет 11 цифр
  if (cleaned.length === 11) {
    const country = cleaned[0];
    const area = cleaned.substring(1, 4);
    const firstPart = cleaned.substring(4, 7);
    const secondPart = cleaned.substring(7, 9);
    const thirdPart = cleaned.substring(9, 11);

    return `+${country} (${area}) ${firstPart}-${secondPart}-${thirdPart}`;
  }

  // Если номер не состоит из 11 цифр, возвращаем исходную строку
  return phoneNumber;
}

export function capitalizeFirstLetter(str: string) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}