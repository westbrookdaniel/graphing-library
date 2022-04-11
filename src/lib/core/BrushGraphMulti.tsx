import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { scaleLinear, scaleTime } from "@visx/scale";
import { Brush } from "@visx/brush";
import type { Bounds } from "@visx/brush/lib/types";
import type { BaseBrushState, UpdateBrush } from "@visx/brush/lib/BaseBrush";
import type BaseBrush from "@visx/brush/lib/BaseBrush";
import { PatternLines } from "@visx/pattern";
import { extent } from "d3-array";
import GraphBasic, { Xydata } from "./GraphBasic";
import debounce from "lodash/debounce";
import { StandardGraphProps, graphMargin } from "../types";
import { graphColors } from "../colors";
import useInitialBrushPosition from "../hooks/useInitialBrushPosition";
import { filterLineData } from "../helpers/filterLineData";
import TooltipWrapper from "../parts/TooltipWrapper";

// Initialize some variables
const brushMargin: graphMargin = { top: 10, bottom: 15, left: 60, right: 20 };
const chartSeparation = 40;
const PATTERN_ID = "brush_pattern";
const selectedBrushStyle = {
    fill: `url(#${PATTERN_ID})`,
    stroke: graphColors.accent,
};

export interface BrushProps<DataType> extends Omit<StandardGraphProps<DataType>, "data"> {
    initalFilter?: "none" | number;
    compact?: boolean;
    timeScale?: boolean;
    multidata: DataType[][];
    tooltipLabel?: (tooltipData: Xydata[]) => React.ReactNode;
}

const margin: graphMargin = {
    top: 20,
    left: 60,
    bottom: 40,
    right: 20,
};
function BrushGraphMulti<DataType>({
    compact = false,
    width,
    height,
    accessors,
    multidata,
    timeScale = false,
    initalFilter = "none",
    graphType,
    xLabel,
    yLabel,
    isSkeleton,
    tooltipLabel,
}: BrushProps<DataType>) {
    // convert data into a common format using accessors
    const combinedxydata = useMemo(
        () =>
            multidata.flat().map(d => ({
                x: accessors.xAccessor(d),
                y: accessors.yAccessor(d),
            })),
        [multidata, accessors],
    );
    const xydata = useMemo(
        () =>
            multidata.map(dset =>
                dset.map(d => ({
                    x: accessors.xAccessor(d),
                    y: accessors.yAccessor(d),
                })),
            ),
        [multidata, accessors],
    );

    const brushRef = useRef<BaseBrush | null>(null);
    const [filteredData, setFilteredData] = useState<Xydata[][]>([]);
    const [filteredCombinedData, setFilteredCombinedData] = useState<Xydata[]>([]);

    const handleFilter = useCallback(
        (domain: Bounds) => {
            const copy = xydata.map(data => filterLineData(domain, data));
            const copyCombined = filterLineData(domain, combinedxydata);
            setFilteredData(copy);
            setFilteredCombinedData(copyCombined);
        },
        [xydata, combinedxydata],
    );
    // very short debounce time to prevent it feeling delayed
    const debouncedFilter = useMemo(() => debounce(handleFilter, 5), [handleFilter]);
    const onBrushChange = (domain: Bounds | null) => {
        if (!domain) return;
        debouncedFilter(domain);
    };

    const innerHeight = height - margin.top - (compact ? 0 : margin.bottom);
    const topChartBottomMargin = compact ? chartSeparation / 2 : chartSeparation + 10;
    const topChartHeight = 0.8 * innerHeight - topChartBottomMargin - (compact ? chartSeparation / 2 : 0);
    const bottomChartHeight = innerHeight - topChartHeight - (compact ? chartSeparation / 2 : chartSeparation);

    const xBounds = Math.max(width - margin.left - margin.right, 0);
    const yBounds = Math.max(topChartHeight, 0) - margin.bottom;
    const xBrushBounds = Math.max(width - brushMargin.left - brushMargin.right, 0);
    const yBrushBounds = Math.max(bottomChartHeight - brushMargin.top - brushMargin.bottom, 0);

    const scaleType = useMemo(() => (timeScale ? scaleTime : scaleLinear), [timeScale]);
    const xScale = useMemo(
        () =>
            scaleType<number>({
                range: [0, xBounds],
                domain: extent(filteredCombinedData, d => d.x) as [Date, Date],
            }),
        [scaleType, xBounds, filteredCombinedData],
    );
    const yScale = useMemo(
        () =>
            scaleLinear<number>({
                range: [yBounds, 0],
                domain: extent(filteredCombinedData, d => d.y) as [number, number],
                nice: true,
            }),
        [yBounds, filteredCombinedData],
    );
    const brushXScale = useMemo(
        () =>
            scaleType<number>({
                range: [0, xBrushBounds],
                domain: extent(combinedxydata, d => d.x) as [number, number],
            }),
        [scaleType, xBrushBounds, combinedxydata],
    );
    const brushYScale = useMemo(
        () =>
            scaleLinear({
                range: [yBrushBounds, 0],
                domain: extent(combinedxydata, d => d.y) as [number, number],
                nice: true,
            }),
        [yBrushBounds, combinedxydata],
    );

    // sets the brush position when loaded and rest
    const initialBrushPosition = useInitialBrushPosition({ data: combinedxydata, brushXScale, initalFilter });

    const handleClear = () => {
        if (brushRef?.current) {
            setFilteredData(xydata);
            setFilteredCombinedData(combinedxydata);
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

    // Wait until we have some xydata before reseting the graph to use the initialBrushPosition
    const [hasSetInitialFilter, setHasSetInitialFilter] = useState(false);
    useEffect(() => {
        if (!hasSetInitialFilter && xydata.length > 0) {
            handleReset();
            setHasSetInitialFilter(true);
        }
    }, [handleReset, hasSetInitialFilter, initialBrushPosition, xydata]);

    // Triggers displaing the filtered data when it's updated
    useEffect(() => {
        if (initalFilter !== "none") {
            // Force update doesn't actually update it so we just do this to force an update
            // If we don't force an update it will appear to not be filtered
            brushRef.current?.updateBrush(b => b);
        } else {
            setFilteredData(xydata);
            setFilteredCombinedData(combinedxydata);
        }
    }, [combinedxydata, initalFilter, xydata]);

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
            <TooltipWrapper
                margin={margin}
                xydata={xydata}
                xScale={xScale}
                yScale={yScale}
                isSkeleton={isSkeleton}
                width={width}
                xBounds={xBounds}
                yBounds={yBounds}
                tooltipLabel={tooltipLabel}
            />
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

export default BrushGraphMulti;
