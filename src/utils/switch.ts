export const switchType = (type: string) => {
  switch (type) {
    case "adult":
      return "Взрослый";
    case "family":
      return "Семейный";
    case "children":
      return "Детский";
    default:
      return "";
  }
};

export const switchTypeCars = (type: string) => {
  if (type) {
    switch (type) {
      case "adult_car":
        return "Картинг для взрослых";
      case "children_car":
        return "Картинг для детей";
      case "children_with_instructor_car":
        return "Детский картинг с инструктором";
      case "children_with_parent_car":
        return "Детский картинг со взрослым";
    }
  } else {
    return ""
  }
}

export const switchList = (cars: {[key: string]: string}) => {
  let string = ''
  Object.entries(cars).forEach(([key, value]) => {
    string += `${switchTypeCars(key)}: ${value}, `
  })

  return string
}