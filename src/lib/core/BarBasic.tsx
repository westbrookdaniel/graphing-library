import React, { useCallback, useMemo } from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { GridColumns } from "@visx/grid";
import { scaleBand, scaleLinear } from "@visx/scale";
import { useTooltip } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import { getColorFromLabel, graphColors } from "../colors";
import { max } from "d3-array";
import Tooltip from "../parts/Tooltip";
import AxisX from "../parts/AxisX";
import AxisY from "../parts/AxisY";
import { getLargestLabel } from "../helpers";
import { averageAxisCharacterWidth } from "../parts/AxisHelpers";
import type { StandardGraphProps, graphMargin } from "../types";
import type { Xydata } from "./GraphBasic";

type TooltipData = {
    x: number;
    y: number;
    color: string;
};

export interface BarProps<DataType> extends Omit<StandardGraphProps<DataType>, "graphType"> {
    tooltipLabel?: (tooltipData: Xydata) => React.ReactNode;
}

const margin: graphMargin = { top: 20, right: 30, bottom: 50, left: 30 };
export default function BarBasic<DataType>({
    width,
    height,
    accessors,
    data,
    xLabel,
    yLabel,
    tooltipLabel,
    isSkeleton,
}: BarProps<DataType>) {
    // convert data into a common format using accessors
    const xydata = useMemo(
        () =>
            data.map(d => ({
                x: accessors.xAccessor(d),
                y: accessors.yAccessor(d),
            })),
        [data, accessors],
    );

    const yScale = scaleBand<string>({
        domain: xydata.map(d => d.y),
        padding: 0.2,
    });
    const xScale = scaleLinear<number>({
        domain: [0, max(xydata, d => d.x || 0) as number],
        nice: true,
    });
    const getBarColor = useCallback(
        (label: number | string) => (isSkeleton ? graphColors.rangeGray[4] : getColorFromLabel(label.toString())),
        [isSkeleton],
    );

    // doesn't use useTooltipHelper since finding the nearest point behaves differently to line graphs
    const { tooltipOpen, tooltipLeft, tooltipTop, tooltipData, hideTooltip, showTooltip } = useTooltip<TooltipData>();

    const handleMouseMove = useCallback(
        (event, barY, barHeight, barColor, bar) => {
            const eventSvgCoords = localPoint(event);
            const top = barY + barHeight / 2;
            showTooltip({
                tooltipData: { ...bar, color: barColor },
                tooltipTop: top,
                // 16 offsets the tooltip to the right of the cursor
                tooltipLeft: (eventSvgCoords?.x || 0) + 16,
            });
        },
        [showTooltip],
    );

    const innerHeight = height - margin.top - margin.bottom;

    // Gets the text with the largest length from the x axis too
    // offset the inner bounds based on the dynamic axis height
    const yLabelSize = useMemo(() => getLargestLabel(Object.values(xydata.map(d => d.y))), [xydata]);

    const xBounds = Math.max(width - margin.left - margin.right, 0) - yLabelSize * averageAxisCharacterWidth;
    const yBounds = Math.max(innerHeight, 0);

    yScale.rangeRound([0, yBounds]);
    xScale.range([0, xBounds]);

    const renderBar = useCallback(
        (bar: Xydata) => {
            const barWidth = xScale(bar.x);
            const barY = yScale(bar.y) as number;
            const barX = 0; // Align the bars to the left edge
            const barHeight = yScale.bandwidth();
            return (
                <React.Fragment key={`bar-${bar.x}`}>
                    <Bar
                        data-testid="bar"
                        x={barX}
                        y={barY}
                        width={barWidth}
                        height={barHeight}
                        fill={getBarColor(bar.x)}
                    />
                    <Bar
                        x={barX}
                        y={barY}
                        width={xBounds}
                        height={barHeight}
                        fill="transparent"
                        onMouseLeave={() => hideTooltip()}
                        onMouseMove={event => handleMouseMove(event, barY, barHeight, getBarColor(bar.x), bar)}
                    />
                </React.Fragment>
            );
        },
        [getBarColor, handleMouseMove, hideTooltip, xBounds, xScale, yScale],
    );

    return (
        <div style={{ position: "relative", userSelect: "none" }}>
            <svg data-testid="svg-container" width={width} height={height}>
                <Group left={margin.left + yLabelSize * averageAxisCharacterWidth} top={margin.top}>
                    <GridColumns width={xBounds} height={yBounds} stroke="black" strokeOpacity={0.1} scale={xScale} />
                    <Group>{xydata.map(renderBar)}</Group>
                    <AxisX isSkeleton={isSkeleton} width={xBounds} top={yBounds} scale={xScale} label={xLabel} />
                    <AxisY allTicks isSkeleton={isSkeleton} scale={yScale} label={yLabel} />
                </Group>
            </svg>
            {!isSkeleton && tooltipOpen && tooltipData && tooltipLabel && (
                <Tooltip tooltipTop={tooltipTop || 0} tooltipLeft={tooltipLeft || 0} data={tooltipLabel(tooltipData)} />
            )}
        </div>
    );
}
