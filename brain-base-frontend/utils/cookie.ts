"use server";
import { cookies } from "next/headers";

/**
 * Set cookie
 * @param key
 * @param value
 * @returns
 * @example
 * setCookie("token", "123")
 */
export async function setCookies(key: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(key, value, {
    httpOnly: process.env.NODE_ENV === "production",
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
}

/**
 * Get cookie by key
 * @param key
 * @returns
 * @example
 * getCookie("token")
 */
export async function getCookies(key: string) {
  const cookieStore = await cookies();
  return cookieStore.get(key);
}

/**
 * Delete cookie by key
 * @param key
 * @returns
 * @example
 * deleteCookie("token")
 */
export async function deleteCookie(key: string) {
  const cookieStore = await cookies();
  cookieStore.delete(key);
}
