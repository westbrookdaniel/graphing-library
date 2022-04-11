import { Bar } from "@visx/shape";
import { useTooltipMultiLineHelper } from "../hooks/useTooltipMultiLineHelper";
import TooltipMarker from "./TooltipMarker";
import Tooltip from "./Tooltip";
import { graphMargin } from "../types";
import { Xydata } from "../core/GraphBasic";
import { AxisScale } from "@visx/axis/lib/types";

interface Props {
    xScale: AxisScale<number>;
    yScale: AxisScale<number>;
    margin: graphMargin;
    xydata: Xydata[][];
    isSkeleton?: boolean;
    width: number;
    xBounds: number;
    yBounds: number;
    tooltipLabel?: (tooltipData: Xydata[]) => React.ReactNode;
}

const TooltipWrapper: React.FC<Props> = ({
    xScale,
    margin,
    xydata,
    yScale,
    isSkeleton,
    width,
    xBounds,
    yBounds,
    tooltipLabel,
}) => {
    const { handleTooltip, hideTooltip, tooltipData, tooltipLeft, tooltipTop } = useTooltipMultiLineHelper({
        xScale,
        margin,
        filteredData: xydata,
    });

    return (
        <>
            <svg style={{ position: "absolute", top: 0, left: 0 }} width={width} height={yBounds + margin.top}>
                {/* Invisible area used for handling the tooltip */}
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
                {tooltipData ? (
                    <TooltipMarker
                        tooltipTop={tooltipData.map(d => yScale(d.y) || 0)}
                        tooltipLeft={tooltipLeft}
                        tooltipData={tooltipData}
                        yMax={yBounds}
                        topMargin={margin.top}
                    />
                ) : null}
            </svg>
            {tooltipLabel && tooltipData ? (
                <Tooltip tooltipTop={tooltipTop} tooltipLeft={tooltipLeft} data={tooltipLabel(tooltipData)} />
            ) : null}
        </>
    );
};

export default TooltipWrapper;
