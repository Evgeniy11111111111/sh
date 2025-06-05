export const regPhone = (inputValue: string): string => {
  return inputValue.replace(/\D/g, '');
}

export const formatPhoneNumber = (inputNumberValue: string): string => {
  if (!inputNumberValue) return '';

  if (['7', '8', '9'].includes(inputNumberValue[0])) {
    if (inputNumberValue[0] === '9') inputNumberValue = '7' + inputNumberValue;
    if (inputNumberValue[0] === '8') inputNumberValue = '7';

    let formattedInputValue = '+7 ';
    if (inputNumberValue.length > 1) {
      formattedInputValue += '(' + inputNumberValue.substring(1, 4);
    }
    if (inputNumberValue.length >= 5) {
      formattedInputValue += ') ' + inputNumberValue.substring(4, 7);
    }
    if (inputNumberValue.length >= 8) {
      formattedInputValue += '-' + inputNumberValue.substring(7, 9);
    }
    if (inputNumberValue.length >= 10) {
      formattedInputValue += '-' + inputNumberValue.substring(9, 11);
    }

    return formattedInputValue;
  } else {
    return '+7 (9' + inputNumberValue;
  }
}