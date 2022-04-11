import { defaultStyles, TooltipWithBounds } from "@visx/tooltip";
import { ReactNode } from "react";

interface Props {
    data?: ReactNode;
    tooltipTop: number;
    tooltipLeft: number;
}
const tooltipStyles = {
    ...defaultStyles,
};

export default function Tooltip({ tooltipLeft, tooltipTop, data }: Props) {
    return data ? (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
            {/* @ts-expect-error visx's types are wrong */}
            {data}
        </TooltipWithBounds>
    ) : null;
}
