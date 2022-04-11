import type { TextProps } from "@visx/text/lib/types";
import { graphColors } from "../colors";

export const font = "benton-sans, sans-serif";
export const labelProps: Partial<TextProps> = {
    style: { fontSize: "0.7rem", fontFamily: font, fill: graphColors.axis, textAnchor: "middle" },
};
export const averageAxisCharacterWidth = 6.2;
export const averageAxisCharacterHeight = 14;
export const axisGap = 12;
export const labelWidthOffset = (labelSize: number) => averageAxisCharacterWidth * labelSize + axisGap;
export const labelHeightOffset = (labelSize: number) => averageAxisCharacterWidth * labelSize + axisGap;
export const tickLength = 6;
