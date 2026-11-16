/**
 * Server-safe stream/level mapping utilities.
 * These functions don't import React/JSX so they can be used in API routes.
 */

const hsStreamIds = ["HSST", "HSIT", "HSCCE", "HSFM"];
const hssStreamIds = ["HSSL", "HSSCS", "HSSAH", "HSSFM"];
const bsStreamIds = ["BSSIRK", "BSSCI", "BSSQA", "BSSFM", "BSSL", "BSSPT"];

export const getLevelByStreamServer = (streamId: string): string => {
  if (streamId === "Rabbani") return "Rabbani";
  if (hsStreamIds.includes(streamId)) return "8";
  if (hssStreamIds.includes(streamId)) return "11";
  if (bsStreamIds.includes(streamId)) return "Degree";
  return "";
};

const streamNameMap: Record<string, string> = {
  // HS (Standard 8)
  HSST: "School of Science and Technology",
  HSIT: "School of Islamic Theology and Arabic Literature",
  HSCCE: "School of Civil Service",
  HSFM: "School of Finance and Management",
  // HSS (+1)
  HSSL: "School of Life Science (Biology)",
  HSSCS: "School of Computer Science",
  HSSAH: "School of Arts and Humanities",
  HSSFM: "School of Finance and Management (Senior School Level)",
  // BS (Degree)
  BSSIRK: "School of Islamic Revealed Knowledge",
  BSSCI: "School of Social Science and Civilization",
  BSSQA: "School of Quranic Studies and Arts",
  BSSFM: "School of Finance and Management",
  BSSL: "School of Language and Literature",
  BSSPT: "School of Pure Science and Technology",
  // Special
  Rabbani: "Rabbani Finishing",
};

export const getStreamNameServer = (streamId: string): string => {
  return streamNameMap[streamId] || streamId;
};
