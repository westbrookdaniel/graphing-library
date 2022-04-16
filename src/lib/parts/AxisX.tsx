import { graphColors } from "../colors";
import { AxisBottom, TickRendererProps } from "@visx/axis";
import { AxisProps } from "./AxisY";
import { Text } from "@visx/text";
import { createSkeletonAxisText, getLargestLabel } from "../helpers";
import { font, labelProps, tickLength, labelHeightOffset, axisGap, averageAxisCharacterHeight } from "./AxisHelpers";
import { useMemo } from "react";

const axisBottomTickLabelProps = {
    dy: "0.2em",
    textAnchor: "middle" as const,
    fontFamily: font,
    fontSize: 10,
    fill: graphColors.axis,
};

interface Props extends AxisProps {
    top: number;
    width: number;
}

export default function AxisX({ top, label, width, scale, isSkeleton, allTicks }: Props) {
    // This shows less ticks (markers on an axis) at smaller widths
    const ticks = width > 520 ? 10 : 5;
    // Text anchor isn't recongised as a css property for some reason
    const tickProps = useMemo(
        () => (allTicks ? { writingMode: "tb", textAnchor: "start" as const, dy: "-0.4em" } : {}),
        [allTicks],
    );

    let labelHeight = useMemo(() => getLargestLabel(scale.domain()), [scale]);

    const tickComponent = useMemo(
        () =>
            isSkeleton
                ? (props: TickRendererProps) =>
                      createSkeletonAxisText({
                          ...props,
                          skeletonWidth: 20,
                          skeletonHeight: 10,
                          vertical: false,
                      })
                : ({ formattedValue, ...props }: TickRendererProps) => (
                      <Text {...props} {...axisBottomTickLabelProps} {...tickProps}>
                          {formattedValue}
                      </Text>
                  ),
        [isSkeleton, tickProps],
    );

    return (
        <AxisBottom
            top={top}
            scale={scale}
            numTicks={allTicks ? 999999999999 : ticks}
            stroke={graphColors.axis}
            tickStroke={graphColors.axis}
            tickLength={tickLength}
            tickComponent={tickComponent}
            label={label}
            labelProps={labelProps}
            labelOffset={allTicks ? labelHeightOffset(labelHeight) : axisGap + averageAxisCharacterHeight}
        />
    );
}
