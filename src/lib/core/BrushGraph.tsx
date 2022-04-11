import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Brush } from "@visx/brush";
import type { Bounds } from "@visx/brush/lib/types";
import type { BaseBrushState, UpdateBrush } from "@visx/brush/lib/BaseBrush";
import type BaseBrush from "@visx/brush/lib/BaseBrush";
import { PatternLines } from "@visx/pattern";
import { extent } from "d3-array";
import type { Xydata } from "./GraphBasic";
import GraphBasic from "./GraphBasic";
import Tooltip from "../parts/Tooltip";
import TooltipMarker from "../parts/TooltipMarker";
import { Bar } from "@visx/shape";
import debounce from "lodash/debounce";
import { useTooltipLineHelper } from "../hooks/useTooltipLineHelper";
import { graphColors } from "../colors";
import useInitialBrushPosition from "../hooks/useInitialBrushPosition";
import { filterLineData } from "../helpers/filterLineData";
import type { StandardGraphProps, graphMargin } from "../types";

// Initialize some variables
const brushMargin: graphMargin = { top: 10, bottom: 15, left: 60, right: 20 };
const chartSeparation = 40;
const PATTERN_ID = "brush_pattern";
const selectedBrushStyle = {
    fill: `url(#${PATTERN_ID})`,
    stroke: graphColors.accent,
};

export interface BrushProps<DataType> extends StandardGraphProps<DataType> {
    initalFilter?: "none" | number;
    compact?: boolean;
    timeScale?: boolean;
    tooltipLabel?: (tooltipData: Xydata) => React.ReactNode;
}
const margin: graphMargin = {
    top: 20,
    left: 60,
    bottom: 40,
    right: 20,
};
function BrushGraph<DataType>({
    compact = false,
    width,
    height,
    accessors,
    data,
    timeScale = false,
    initalFilter = "none",
    graphType,
    xLabel,
    yLabel,
    isSkeleton,
    tooltipLabel,
}: BrushProps<DataType>) {
    // convert data into a common format using accessors
    const xydata = useMemo(
        () =>
            data.map(d => ({
                x: accessors.xAccessor(d),
                y: accessors.yAccessor(d),
            })),
        [data, accessors],
    );

    const brushRef = useRef<BaseBrush | null>(null);
    const [filteredData, setFilteredData] = useState<Xydata[]>([]);

    const handleFilter = useCallback(
        (domain: Bounds) => {
            setFilteredData(filterLineData(domain, xydata));
        },
        [xydata],
    );
    // very short debounce time to prevent it feeling delayed
    const debouncedFilter = useRef(debounce(handleFilter, 5)).current;
    const onBrushChange = (domain: Bounds | null) => {
        if (!domain) return;
        debouncedFilter(domain);
    };

    const innerHeight = height - margin.top - (compact ? 0 : margin.bottom);
    const topChartBottomMargin = compact ? chartSeparation / 2 : chartSeparation + 10;
    const topChartHeight = 0.8 * innerHeight - topChartBottomMargin - (compact ? chartSeparation / 2 : 0);
    const bottomChartHeight = innerHeight - topChartHeight - (compact ? chartSeparation / 2 : chartSeparation);

    const xBounds = Math.max(width - margin.left - margin.right, 0);
    const yBounds = Math.max(topChartHeight, 0);
    const xBrushBounds = Math.max(width - brushMargin.left - brushMargin.right, 0);
    const yBrushBounds = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

    const scaleType = useMemo(() => (timeScale ? scaleTime : scaleLinear), [timeScale]);
    const xScale = useMemo(
        () =>
            scaleType<number>({
                range: [0, xBounds],
                domain: extent(filteredData, d => d.x) as [Date, Date],
            }),
        [xBounds, filteredData, scaleType],
    );
    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [yBounds, 0],
                domain: extent(filteredData, d => d.y) as [number, number],
                nice: true,
            }),
        [yBounds, filteredData],
    );
    const brushXScale = useMemo(
        () =>
            scaleType<number>({
                range: [0, xBrushBounds],
                domain: extent(xydata, d => d.x) as [number, number],
            }),
        [xBrushBounds, xydata, scaleType],
    );
    const brushYScale = useMemo(
        () =>
            scaleLinear({
                range: [yBrushBounds, 0],
                domain: extent(xydata, d => d.y) as [number, number],
                nice: true,
            }),
        [yBrushBounds, xydata],
    );

    // sets the brush position when loaded and rest
    const initialBrushPosition = useInitialBrushPosition({ data: xydata, brushXScale, initalFilter });

    const { handleTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltipLineHelper({
        xScale,
        margin,
        filteredData,
    });

    // event handlers
    const handleClear = () => {
        if (brushRef?.current) {
            setFilteredData(xydata);
            brushRef.current.reset();
        }
    };

    const handleReset = useCallback(() => {
        if (brushRef?.current) {
            const updater: UpdateBrush = prevBrush => {
                // ! is because despite the check above typescript thinks this could be null
                const newExtent = brushRef.current!.getExtent(initialBrushPosition.start, initialBrushPosition.end);

                const newState: BaseBrushState = {
                    ...prevBrush,
                    start: { y: newExtent.y0, x: newExtent.x0 },
                    end: { y: newExtent.y1, x: newExtent.x1 },
                    extent: newExtent,
                };

                return newState;
            };
            brushRef.current.updateBrush(updater);
        }
    }, [initialBrushPosition.end, initialBrushPosition.start]);

    // triggers displaing the filtered data on first load
    useEffect(() => {
        initalFilter !== "none" ? handleReset() : setFilteredData(xydata);
    }, [handleReset, initalFilter, xydata]);

    return (
        <div style={{ position: "relative", userSelect: "none" }}>
            <svg data-testid="svg-container" width={width} height={height}>
                <GraphBasic
                    graph={graphType}
                    hideBottomAxis={compact}
                    data={filteredData}
                    width={width}
                    margin={{ ...margin, bottom: topChartBottomMargin }}
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
                {/* Invisible area used for handling the tooltip (turned off when skeleton) */}
                {isSkeleton ? null : (
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
                )}
                <GraphBasic
                    graph={graphType}
                    hideBottomAxis
                    hideLeftAxis
                    hideGrid
                    data={xydata}
                    width={width}
                    xMax={xBrushBounds}
                    yMax={yBrushBounds}
                    xScale={brushXScale}
                    yScale={brushYScale}
                    margin={brushMargin}
                    top={topChartHeight + topChartBottomMargin + margin.top + 4}
                    isSkeleton={isSkeleton}
                >
                    <PatternLines
                        id={PATTERN_ID}
                        height={8}
                        width={8}
                        stroke={graphColors.accent}
                        strokeWidth={1}
                        orientation={["diagonal"]}
                    />
                    <Brush
                        xScale={brushXScale}
                        yScale={brushYScale}
                        width={xBrushBounds}
                        height={yBrushBounds}
                        margin={brushMargin}
                        handleSize={8}
                        innerRef={brushRef}
                        resizeTriggerAreas={["left", "right"]}
                        brushDirection="horizontal"
                        initialBrushPosition={initalFilter ? initialBrushPosition : undefined}
                        onChange={onBrushChange}
                        onClick={handleClear}
                        selectedBoxStyle={selectedBrushStyle}
                    />
                </GraphBasic>
            </svg>
            {tooltipLabel && tooltipData ? (
                <Tooltip tooltipTop={tooltipTop} tooltipLeft={tooltipLeft} data={tooltipLabel(tooltipData)} />
            ) : null}
            {isSkeleton || compact ? null : (
                <div className="absolute flex mt-4 space-x-2 bottom-2 right-4">
                    <button className="button" onClick={handleClear}>
                        Clear
                    </button>
                    {initalFilter === "none" ? null : (
                        <button className="button-outline" onClick={handleReset}>
                            Reset
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default BrushGraph;
