"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Performs a one-time client-side redirect using a path stored in sessionStorage and renders nothing.
 *
 * On mount, reads the "redirect" key from sessionStorage; if present, removes it and navigates to that path using the Next.js router.
 *
 * @returns null — renders no UI
 */
export function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Check if there's a stored redirect path
    const redirect = sessionStorage.getItem("redirect");
    if (redirect) {
      sessionStorage.removeItem("redirect");
      router.replace(redirect);
    }
  }, [router]);

  return null;
}