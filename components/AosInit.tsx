"use client";

import { useEffect } from "react";

const AosInit = () => {
  useEffect(() => {
    import("aos").then((aos) => {
      aos.init({});
    });
  }, []);

  return null;
};

export default AosInit;
