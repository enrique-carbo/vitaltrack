import { db } from "@/db/db";

const USER_PROFILE_KEY = "user_height_cm";

// Guardar altura (en cm)
export const saveHeight = async (heightCm: number) => {
  await db.settings.put({ key: USER_PROFILE_KEY, value: heightCm });
};

// Obtener altura (en cm)
export const getHeight = async (): Promise<number | undefined> => {
  const setting = await db.settings.get(USER_PROFILE_KEY);
  return setting?.value as number | undefined;
};
