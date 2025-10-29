"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

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
