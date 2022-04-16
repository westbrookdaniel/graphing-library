import { scaleBand, scaleLinear } from "@visx/scale";
import { Group } from "@visx/group";
import { HeatmapRect } from "@visx/heatmap";
import { graphMargin, CoreGraphProps } from "../types";
import AxisY from "../parts/AxisY";
import AxisX from "../parts/AxisX";
import { graphColors } from "../colors";
import { getLargestLabel } from "../helpers";
import { averageAxisCharacterWidth, font } from "../parts/AxisHelpers";
import React, { useCallback, useEffect, useMemo } from "react";
import type { RectCell } from "@visx/heatmap/lib/heatmaps/HeatmapRect";

export interface GraphProps extends CoreGraphProps {
    data: number[][];
    labels: string[];
    xLabel?: string;
    yLabel?: string;
}

const minCellFontSize = 9;
const maxCellFontSize = 40;

const axisOffset = 15;
const margin: graphMargin = {
    top: 20,
    left: 40,
    bottom: 30,
    right: 20,
};
const skeletonColours = ["#fff", "#ececec", "#c0c0c0"];
const matrixColours = ["#fff", "#ccebc5", "#7bccc4"];

function MatrixGraph({ width, height, data, labels, isSkeleton, xLabel, yLabel }: GraphProps) {
    // This forces you to provide a "square" confusion matrix
    // Doing this simplifies a lot of scaling logic
    useEffect(() => {
        if (!(data.map(d => d.length === labels.length).reduce((a, b) => a && b) && data.length === labels.length)) {
            throw new Error("Invalid data provided");
        }
    }, [data, labels]);

    // Gets the text with the largest length from the x axis too
    // offset the inner bounds based on the dynamic axis height
    const labelSize = useMemo(() => getLargestLabel(labels), [labels]);

    // taking 15 stops the bottom axis from being cut off
    const innerHeight = height - margin.top - margin.bottom - axisOffset;

    const xBounds = Math.max(width - margin.left - margin.right, 0) - labelSize * averageAxisCharacterWidth;
    const yBounds = Math.max(innerHeight, 0) - labelSize * averageAxisCharacterWidth;

    const xAxisScale = useMemo(
        () =>
            scaleBand<string>({
                domain: labels,
                range: [0, xBounds],
            }),
        [labels, xBounds],
    );
    const yAxisScale = useMemo(
        () =>
            scaleBand<string>({
                domain: labels,
                range: [0, yBounds],
            }),
        [labels, yBounds],
    );
    const xMatrixScale = useMemo(
        () =>
            scaleLinear<number>({
                domain: [0, labels.length],
                range: [0, xBounds],
            }),
        [labels.length, xBounds],
    );
    const yMatrixScale = useMemo(
        () =>
            scaleLinear<number>({
                domain: [0, labels.length],
                range: [0, yBounds],
            }),
        [labels.length, yBounds],
    );

    // This changes the font size dynamically between min and max cell font size depending on the amount of labels
    const fontSize = useMemo(
        () => minCellFontSize + (maxCellFontSize - minCellFontSize) / labels.length,
        [labels.length],
    );

    type Cell = RectCell<{ bin: number; i: number }, unknown>;

    const renderCell = useCallback(
        (cell: Cell) => {
            return (
                <React.Fragment key={`heatmap-${cell.row}-${cell.column}`}>
                    {cell.color === "rgb(255, 255, 255)" ? null : (
                        <rect
                            shapeRendering="optimizeSpeed"
                            x={cell.x}
                            y={cell.y}
                            height={cell.height}
                            width={cell.width}
                            fill={cell.color}
                        />
                    )}
                    <text
                        textRendering="optimizeSpeed"
                        data-testid="cell"
                        dy="0.333em"
                        y={cell.y + cell.height / 2}
                        x={cell.x + cell.width / 2}
                        fontSize={fontSize}
                        fontFamily={font}
                        textAnchor="middle"
                        fill={graphColors.axis}
                    >
                        {cell.bin as number}
                    </text>
                </React.Fragment>
            );
        },
        [fontSize],
    );

    const renderSkeleton = useCallback((cell: Cell) => {
        return (
            <React.Fragment key={`heatmap-${cell.row}-${cell.column}`}>
                {cell.color === "rgb(255, 255, 255)" ? null : (
                    <rect
                        shapeRendering="optimizeSpeed"
                        x={cell.x}
                        y={cell.y}
                        height={cell.height}
                        width={cell.width}
                        fill={cell.color}
                    />
                )}
                <rect
                    shapeRendering="optimizeSpeed"
                    data-testid="skeleton"
                    x={cell.x + cell.height / 2 - 10}
                    y={cell.y + cell.width / 2 - 12}
                    dy="0.333em"
                    fill={graphColors.grid}
                    width={24}
                    height={20}
                />
            </React.Fragment>
        );
    }, []);

    const handleRender = useMemo(
        () => (isSkeleton ? renderSkeleton : renderCell),
        [isSkeleton, renderCell, renderSkeleton],
    );

    const getColorScale = useCallback(
        (row: number[]) => {
            const colorMax = Math.max(...row);
            const colorScale = scaleLinear<string>({
                range: isSkeleton ? skeletonColours : matrixColours,
                // This gives more emphasis to small numbers than a linear scale
                domain: [0, colorMax / 8, colorMax],
            });
            return colorScale;
        },
        [isSkeleton],
    );
    const colorScales = useMemo(() => data.map(row => getColorScale(row)), [data, getColorScale]);

    return (
        <div style={{ position: "relative", userSelect: "none" }}>
            <svg data-testid="svg-container" width={width} height={height}>
                <Group left={margin.left + labelSize * averageAxisCharacterWidth} top={margin.top}>
                    <Group>
                        {data.map((row, i) => {
                            return (
                                <Group key={i} top={(yBounds / labels.length) * i}>
                                    <HeatmapRect
                                        data={row.map((bin, i) => ({ bin, i }))}
                                        yScale={d => yMatrixScale(d) ?? 0}
                                        xScale={d => xMatrixScale(d) ?? 0}
                                        colorScale={colorScales[i]}
                                        binWidth={xBounds / labels.length}
                                        binHeight={yBounds / labels.length}
                                        bins={d => [d.bin]}
                                        count={cellValue => cellValue as number}
                                        gap={0}
                                    >
                                        {heatmap => heatmap.map(rows => rows.map(handleRender))}
                                    </HeatmapRect>
                                </Group>
                            );
                        })}
                    </Group>

                    <AxisX
                        allTicks
                        isSkeleton={isSkeleton}
                        width={xBounds}
                        top={yBounds}
                        scale={xAxisScale}
                        label={xLabel}
                    />
                    <AxisY allTicks isSkeleton={isSkeleton} scale={yAxisScale} label={yLabel} />
                </Group>
            </svg>
        </div>
    );
}

export default MatrixGraph;
