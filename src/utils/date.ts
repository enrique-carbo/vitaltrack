import { format } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Obtiene la hora actual en formato 'HH:mm' para inputs de tipo time
 */
export const getCurrentLocalTime = (): string => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

export const toLocalISODate = (date: Date = new Date()): string => {
  return format(date, "yyyy-MM-dd");
};

/**
 * Convierte Date String y Time String a Timestamp exacto
 * @param isoDateString 'YYYY-MM-DD'
 * @param isoTimeString 'HH:mm' (Default: 00:00)
 */
export const localDateTimeToTimestamp = (
  isoDateString: string,
  isoTimeString: string = "00:00",
): number => {
  const [year, month, day] = isoDateString.split("-").map(Number);
  const [hours, minutes] = isoTimeString.split(":").map(Number);

  // Creamos la fecha con hora, minutos y segundos incluidos
  return new Date(year, month - 1, day, hours, minutes).getTime();
};

export const formatTimestamp = (timestamp: number): string => {
  return format(new Date(timestamp), "dd MMM, HH:mm", { locale: es });
};

export const getStartOfToday = (): number => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
};
