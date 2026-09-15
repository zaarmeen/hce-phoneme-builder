"use client";

import { useEffect } from "react";
import { getTheme, getLayout } from "../lib/themeCookie";

export default function ThemeInit() {
  useEffect(() => {
    document.documentElement.dataset.theme = getTheme();
    document.documentElement.dataset.layout = getLayout();
  }, []);

  return null;
}
