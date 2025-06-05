import {ILocationsGetData} from "../store/location/getLocations.ts";
import {MenuItemTypes} from "../constants/menu.ts";
import {IBookingVariants} from "../store/bookings/interfaceBooking.ts";

const splitArray = (array: Array<any>, chunkSize: number) => {
  return Array(Math.ceil(array.length / chunkSize))
    .fill(1)
    .map((_, index) => index * chunkSize)
    .map((begin) => array.slice(begin, begin + chunkSize));

};

const arrayToString = (array, separator: string = ', ') => {
  return array.join(separator)
}

const objectToString = (object: { [key: string]: string | null | undefined }, separator?: string) => {
  if (!object) return ""


  const arr = Object.values(object)
    .filter(item => item !== null && item !== undefined && item.trim() !== "")
    .map(item => item!)

  return arrayToString(arr, separator)
}

const generationItemForMenu = (locations: ILocationsGetData[]) => {
  return locations.reduce((acc: MenuItemTypes[], location) => {
    if (location.is_showed_main_page === 1) {
      const route: MenuItemTypes = {
        key: location.code,
        label: location.name,
        isTitle: false,
        icon: "grid",
        url: `/location/${location.code}`
      }
      acc.push(route)
    }

    return acc
  }, [])
}

const findVariant = (variants: IBookingVariants[], started_at: Date, ended_at: Date) => {
  return variants.find(elem => new Date(elem.started_at).getTime() === started_at.getTime() && new Date(elem.ended_at).getTime() === ended_at.getTime());
}

const isFindVariant = (variant: IBookingVariants, started_at: string, ended_at: string) => {
  return new Date(variant.started_at).getTime() === new Date(started_at).getTime() && new Date(variant.ended_at).getTime() === new Date(ended_at).getTime()
}

export { splitArray, arrayToString, objectToString, generationItemForMenu, findVariant, isFindVariant };

