import { useMemo } from "react";
import { scaleLinear, scaleTime } from "@visx/scale";
import { extent } from "d3-array";
import GraphBasic, { Xydata } from "./GraphBasic";
import Tooltip from "../parts/Tooltip";
import TooltipMarker from "../parts/TooltipMarker";
import { Bar } from "@visx/shape";
import { useTooltipLineHelper } from "../hooks/useTooltipLineHelper";
import { StandardGraphProps, graphMargin } from "../types";

export interface GraphProps<DataType> extends StandardGraphProps<DataType> {
    timeScale?: boolean;
    tooltipLabel?: (tooltipData: Xydata) => React.ReactNode;
}

const labelSize = 15;
const margin: graphMargin = {
    top: 20,
    left: 60,
    bottom: 40,
    right: 20,
};
function Graph<DataType>({
    width,
    height,
    accessors,
    data,
    timeScale = false,
    graphType,
    xLabel,
    yLabel,
    isSkeleton,
    tooltipLabel,
}: GraphProps<DataType>) {
    // convert data into a common format using accessors
    const xydata = useMemo(
        () =>
            data.map(d => ({
                x: accessors.xAccessor(d),
                y: accessors.yAccessor(d),
            })),
        [data, accessors],
    );

    // taking 15 stops the bottom axis from being cut off
    const innerHeight = height - margin.top - margin.bottom - labelSize;

    const xBounds = Math.max(width - margin.left - margin.right, 0);
    const yBounds = Math.max(innerHeight, 0);

    const scaleType = useMemo(() => (timeScale ? scaleTime : scaleLinear), [timeScale]);
    const xScale = useMemo(
        () =>
            scaleType<number>({
                range: [0, xBounds],
                domain: extent(xydata, d => d.x) as [Date, Date],
            }),
        [xBounds, xydata, scaleType],
    );
    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [yBounds, 0],
                domain: extent(xydata, d => d.y) as [number, number],
                nice: true,
            }),
        [yBounds, xydata],
    );

    const { handleTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltipLineHelper({
        xScale,
        margin,
        filteredData: xydata,
    });

    return (
        <div style={{ position: "relative", userSelect: "none" }}>
            <svg data-testid="svg-container" width={width} height={height}>
                <GraphBasic
                    graph={graphType}
                    data={xydata}
                    width={width}
                    margin={margin}
                    xMax={xBounds}
                    yMax={yBounds}
                    xScale={xScale}
                    yScale={yScale}
                    xLabel={xLabel}
                    yLabel={yLabel}
                    isSkeleton={isSkeleton}
                />
                {tooltipData ? (
                    <TooltipMarker
                        tooltipTop={tooltipTop}
                        tooltipLeft={tooltipLeft}
                        tooltipData={tooltipData}
                        yMax={yBounds}
                        topMargin={margin.top}
                    />
                ) : null}
                {/* This is invisible and used for handling tooltips */}
                <Bar
                    data-testid="tooltip-handler"
                    x={margin.left}
                    y={margin.top}
                    width={xBounds}
                    height={yBounds}
                    fill="transparent"
                    onTouchStart={handleTooltip}
                    onTouchMove={handleTooltip}
                    onMouseMove={handleTooltip}
                    onMouseLeave={() => hideTooltip()}
                />
            </svg>
            {tooltipLabel && tooltipData ? (
                <Tooltip tooltipTop={tooltipTop} tooltipLeft={tooltipLeft} data={tooltipLabel(tooltipData)} />
            ) : null}
        </div>
    );
}

export default Graph;
