import {IBookingVariants} from "../store/bookings/interfaceBooking.ts";
import {IOption} from "../pages/admin/Modal.tsx";

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Europe/Moscow',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  };

  return date.toLocaleString('ru-RU', options).replace(',', '');
}

export function getTimeFormatedDate(isoString: string) {
  const formatedDate = formatDateTime(isoString)
  return formatedDate.split(" ")[1];
}

export const getMinStartTime = (startedAt: string, currentTime: Date, endedAt: string, timeRange = 60): Date | undefined => {
  const startTime = new Date(startedAt);
  const endTime = new Date(endedAt);

  if ((endTime.getTime() - startTime.getTime()) < timeRange * 60 * 1000) {
    return undefined
  } else if (startTime > currentTime) {
    return roundToNextHourIfNeeded(startTime);
  } else {
    return roundToNextHourIfNeeded(currentTime);
  }
};

export const getMinEndTime = (startedAt: string, endedAt: string, timeRange = 60): Date | undefined => {
  const startTime = new Date(startedAt);
  const endTime = new Date(endedAt);
  const minEndTime = new Date(startTime.getTime() + timeRange * 60 * 1000);
  if ((endTime.getTime() - startTime.getTime()) < timeRange * 60 * 1000) {
    return undefined
  } else {
    return roundToNextHourIfNeeded(minEndTime);
  }
};

const roundToNextHourIfNeeded = (date: Date): Date => {
  if (date.getMinutes() === 0) {
    return date;
  } else {
    return roundToNextHour(date);
  }
};

export const roundToNextHour = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + 1);
  newDate.setMinutes(0);
  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
};

export const adjustStartTime = (endedAt: Date, startedAt: Date, timeRange = 60): Date => {
  if (endedAt < startedAt) {
    return new Date(endedAt.getTime() - timeRange * 60 * 1000); // Subtract 1 hour
  }
  return startedAt;
};

export const getDateArray = function(start, end) {
  const arr: any = [];
  const dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

// Функция для получения свободных интервалов
export const findBookingSlots = (times) => {
  if (!times || times.length === 0) {
    return []; // Return an empty array if there are no times defined
  }

  const freeSlots: any = [];
  let lastEnd = new Date(times[0].ended_at);

  for (let i = 1; i < times.length; i++) {
    const start = new Date(times[i].started_at);
    if (lastEnd < start) {
      freeSlots.push(...getDateArray(lastEnd, new Date(start)));
    }
    lastEnd = new Date(times[i].ended_at);
  }

  // Adding time after the last event to the end of the day
  const endOfDay = new Date(lastEnd);
  endOfDay.setHours(23, 59, 59, 999);
  if (lastEnd < endOfDay) {
    freeSlots.push(...getDateArray(lastEnd, endOfDay));
  }

  return freeSlots;
};

export function findBookingByTime(searchTime: Date, variants) {
  // Convert the search time to a Date object
  const searchDate = searchTime;

  // Find the booking that includes the given time
  return variants.find(booking => {
    const startDate = new Date(booking.started_at);
    const endDate = new Date(booking.ended_at);
    return searchDate >= startDate && searchDate < endDate;
  });
}

export const stringToTime = (string: string) => {
  const date = new Date(string);
  const option: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }

  return date.toLocaleTimeString('ru-RU', option)
}

export function formatMinutesToTimeString(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  const seconds = 0;

  // Форматируем часы, минуты и секунды с добавлением ведущих нулей
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(remainingMinutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const isSameDate = (date1: Date, date2: Date) => {
  return date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();
};

export const roundToNextInterval = (date: Date, interval: number): Date => {
  const newDate = new Date(date.getTime());
  const minutes = newDate.getMinutes();
  const mod = minutes % interval;

  if (mod !== 0 || newDate.getSeconds() !== 0 || newDate.getMilliseconds() !== 0) {
    newDate.setMinutes(minutes + (interval - mod));
  }

  // Дополнительная проверка для случаев, когда округление доходит до конца часа
  if (newDate.getMinutes() === 60) {
    newDate.setMinutes(0);
    newDate.setHours(newDate.getHours() + 1);
  }

  newDate.setSeconds(0);
  newDate.setMilliseconds(0);
  return newDate;
};
export const adjustStartTimeForCurrentDate = (variants: any[], minBookingDuration: number): Date => {
  const now = new Date();

  if (variants.length === 0) {
    return roundToNextInterval(now, minBookingDuration);
  }

  for (let i = 0; i < variants.length; i++) {
    const slotStart = new Date(variants[i].started_at);
    const slotEnd = new Date(variants[i].ended_at);

    if (now < slotStart) {
      return roundToNextInterval(slotStart, minBookingDuration);
    }

    if (now >= slotStart && now < slotEnd) {
      const nextIntervalStart = roundToNextInterval(now, minBookingDuration);
      if (nextIntervalStart < slotEnd) {
        return nextIntervalStart;
      }

      if (i + 1 < variants.length) {
        return roundToNextInterval(new Date(variants[i + 1].started_at), minBookingDuration);
      } else {
        return roundToNextInterval(slotEnd, minBookingDuration);
      }
    }
  }

  return roundToNextInterval(now, minBookingDuration);
};

export const generateTimeSlots = (variants: any[], minBookingDuration: number, ) => {

  if (variants.length === 0) {
    return {
      freeTimeSlots: [],
      bookedTimeSlots: []
    };
  }

  const bookedSlots = findBookingSlots(variants);
  const adjustedStartTime = adjustStartTimeForCurrentDate(variants, minBookingDuration);
  const freeSlots: any[] = [];

  for (let i = 0; i < variants.length; i++) {
    let slotStart = new Date(variants[i].started_at);
    const slotEnd = new Date(variants[i].ended_at);

    if (i === 0 && adjustedStartTime > slotStart && adjustedStartTime <= slotEnd) {
      slotStart = adjustedStartTime;
    }

    freeSlots.push({
      started_at: slotStart,
      ended_at: slotEnd
    });
  }

  if (freeSlots.length > 0 && new Date(freeSlots[0].started_at).getTime() === new Date (freeSlots[0].ended_at).getTime()) {
    freeSlots.shift();
  }

  return {
    freeTimeSlots: freeSlots,
    bookedTimeSlots: bookedSlots
  };
};

export const addTimeIntervalIfNotExists = (variants: any[], newInterval: { started_at: Date, ended_at: Date }) => {
  const newStart = new Date(newInterval.started_at);
  const newEnd = new Date(newInterval.ended_at);

  // Добавляем новый интервал в список
  variants.push({ started_at: newStart, ended_at: newEnd });

  // Сортируем интервалы по времени начала
  variants.sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());

  // Объединяем пересекающиеся интервалы
  const mergedVariants: any[] = [];
  let currentInterval = {
    started_at: new Date(variants[0].started_at),
    ended_at: new Date(variants[0].ended_at)
  };

  for (let i = 1; i < variants.length; i++) {
    const nextInterval = {
      started_at: new Date(variants[i].started_at),
      ended_at: new Date(variants[i].ended_at)
    };

    // Если интервалы пересекаются, объединяем их
    if (currentInterval.ended_at.getTime() >= nextInterval.started_at.getTime()) {
      currentInterval.ended_at = new Date(Math.max(currentInterval.ended_at.getTime(), nextInterval.ended_at.getTime()));
    } else {
      // Если нет пересечения, добавляем текущий интервал и переходим к следующему
      mergedVariants.push({
        started_at: currentInterval.started_at.toISOString(),
        ended_at: currentInterval.ended_at.toISOString()
      });
      currentInterval = nextInterval;
    }
  }

  // Добавляем последний интервал
  mergedVariants.push({
    started_at: currentInterval.started_at.toISOString(),
    ended_at: currentInterval.ended_at.toISOString()
  });

  return mergedVariants;
};

export function splitIntoHourIntervals(workRange: { started_at: string; ended_at: string }) {
  const { started_at, ended_at } = workRange;

  // Преобразуем строки в объекты Date
  let start = new Date(started_at);
  const end = new Date(ended_at);

  const intervals: { started_at: string; ended_at: string }[]  = [];

  while (start < end) {
    // Создаем новый объект Date для конца текущего интервала
    let next = new Date(start);
    next.setHours(next.getHours() + 1);

    // Если следующий интервал выходит за границу, ограничиваем его концом
    if (next > end) {
      next = end;
    }

    // Добавляем интервал в массив
    intervals.push({
      started_at: start.toISOString(),
      ended_at: next.toISOString()
    });

    // Обновляем начало следующего интервала
    start = next;
  }

  return intervals;

}

export const generationTimesForDatePicker = (variants: IBookingVariants[], name: "started_at" | "ended_at", editTime?: string) => {
  if (editTime) {
    return variants.map(variant => {
      if (new Date(variant[name]).getTime() === new Date(editTime).getTime() || !variant.is_closed) {
        return {
          value: new Date(variant[name]),
          label: new Date(variant[name]).toLocaleTimeString("ru-Ru")
        };
      }
      return undefined;
    })
      .filter((date): date is {value: Date, label: string} => date !== undefined); // Filter out undefined values
  } else {
    return variants
      .map(variant => {
        if (!variant.is_closed) {
          return {
            value: new Date(variant[name]),
            label: new Date(variant[name]).toLocaleTimeString("ru-Ru")
          };
        }
        return undefined; // Explicitly return undefined for closed variants
      })
      .filter((date): date is {value: Date, label: string} => date !== undefined); // Filter out undefined values

  }

}

export const generateBlockedTimeSlots = () => {
  const blockedSlots: Date[] = [];
  const start = new Date();
  start.setHours(1, 0, 0); // Устанавливаем время на 1:00
  const end = new Date();
  end.setHours(15, 59, 0); // Устанавливаем время на 15:59

  // Заполняем массив заблокированными временными слотами
  for (let date = start; date <= end; date.setMinutes(date.getMinutes() + 1)) {
    blockedSlots.push(new Date(date));
  }
  return blockedSlots;
};

export const generationTimesEndForDatepicker = (variants: IBookingVariants[], time: Date) => {
  const firstSelectedIndex = variants.findIndex(variant => new Date(variant.started_at).getTime() === time.getTime());
  const indexAfterSelected = variants.findIndex((variant, index) => {
    return (index > firstSelectedIndex && variant.is_closed)
  })

  if (indexAfterSelected === -1) {
    return variants.filter((_, index) => index >= firstSelectedIndex)
  } else {
    return variants.filter((_, index) => index <= indexAfterSelected && index >= firstSelectedIndex)
  }
}

export const generationTimesMinutes = (variants: IBookingVariants[], recommendedTimeRange: number = 60) => {
  const availableTimes: IOption<Date>[] = []

  variants.forEach(interval => {
    let startTime = new Date(interval.started_at);
    const endTime = new Date(interval.ended_at);

    // Корректируем конечное время с учетом recommendedTimeRange
    const adjustedEndTime = new Date(endTime.getTime() - recommendedTimeRange * 60000);

    // Добавляем временные шаги до adjustedEndTime
    while (startTime <= adjustedEndTime) {
      availableTimes.push({
        value: startTime,
        label: startTime.toLocaleTimeString("ru-RU", {hour: "2-digit", minute: "2-digit"})
      });
      startTime = new Date(startTime.getTime() + 10 * 60000); // Увеличиваем на time минут
    }

    // Добавляем последнее время, если оно еще не добавлено
    if (availableTimes.length > 0 && availableTimes[availableTimes.length - 1].value.getTime() !== adjustedEndTime.getTime()) {
      availableTimes.push({
        value: adjustedEndTime,
        label: adjustedEndTime.toLocaleTimeString("ru-RU")
      });
    }
  });

  return availableTimes;
}