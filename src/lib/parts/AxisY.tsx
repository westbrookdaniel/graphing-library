import { AxisLeft, AxisScale, TickRendererProps } from "@visx/axis";
import { useMemo } from "react";
import { graphColors } from "../colors";
import { getLargestLabel, createSkeletonAxisText } from "../helpers";
import { font, labelWidthOffset, labelProps, tickLength } from "./AxisHelpers";

const axisLeftTickLabelProps = {
    dx: "-0.4em",
    dy: "0.35em",
    fontFamily: font,
    fontSize: 10,
    textAnchor: "end" as const,
    fill: graphColors.axis,
};

export interface AxisProps {
    label: string | undefined;
    scale: AxisScale;
    isSkeleton?: boolean;
    allTicks?: boolean;
}

export default function AxisY({ label, scale, isSkeleton, allTicks }: AxisProps) {
    let labelWidth = useMemo(() => getLargestLabel(scale.domain()), [scale]);

    const tickComponent = useMemo(
        () =>
            isSkeleton
                ? (props: TickRendererProps) =>
                      createSkeletonAxisText({
                          ...props,
                          skeletonWidth: 20,
                          skeletonHeight: 10,
                          vertical: true,
                      })
                : undefined,
        [isSkeleton],
    );

    return (
        <AxisLeft
            scale={scale}
            numTicks={allTicks ? 999999999999 : 5}
            stroke={graphColors.axis}
            tickStroke={graphColors.axis}
            tickLabelProps={() => axisLeftTickLabelProps}
            tickComponent={tickComponent}
            tickLength={tickLength}
            label={label}
            labelProps={labelProps}
            labelOffset={labelWidthOffset(labelWidth)}
        />
    );
}
