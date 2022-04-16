import { AxisScale } from "@visx/axis";
import { localPoint } from "@visx/event";
import { useTooltip } from "@visx/tooltip";
import debounce from "lodash/debounce";
import { useCallback, useRef } from "react";
import { Xydata } from "../core/GraphBasic";
import { graphMargin } from "../types";
import { findDatasetPoint } from "../helpers/findDatasetPoint";

interface Props {
    xScale: AxisScale<number>;
    margin: graphMargin;
    filteredData: Xydata[][];
}

export function useTooltipMultiLineHelper({ xScale, margin, filteredData }: Props) {
    const {
        hideTooltip,
        updateTooltip,
        tooltipData,
        tooltipOpen,
        tooltipTop = 0,
        tooltipLeft = 0,
    } = useTooltip<Xydata[]>();
    // The handler for tooltip is debounced to improve performance for large datasets
    // very short debounce time to prevent it feeling delayed
    const debouncedUpdate = useRef(debounce(updateTooltip, 5)).current;
    const handleTooltip = useCallback(
        (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
            const { x, y } = localPoint(event) || { x: 0 };

            // Account for the offset we put on the handler
            // Invert exists on LinearScale but the types only say it only exists on DateScale
            const x0 = (xScale as any).invert(x - margin.left);

            // Figures out where x0 would lie within the dataset
            const index = filteredData.map(filtered => findDatasetPoint(x0, filtered));

            const d0 = index.map((pos, i) => filteredData[i][pos - 1]);
            const d1 = index.map((pos, i) => filteredData[i][pos]);
            let d = d0;

            // Checks is at least one point that exists
            if (d.length === 0) return;

            // This makes sure the point being shown is the closest one the the cursor
            // Checks if there any points ahead with a x position
            if (d1 && d1.reduce((a, b) => a || b)?.x) {
                // Get the closest set of points for each dataset (eg line)
                const closest = d0.map((d0i, i) => {
                    const d1i = d1[i];
                    return x0 - d0i.x > d1i.x - x0 ? d1 : d0;
                });
                // Use the first set of points that includes x0
                d = closest.reduce((a, b) => {
                    // Check if any of the points contain x0 as the x value
                    const bContainsX = b.map(bi => bi.x === x0).reduce((a, b) => a || b);
                    return bContainsX ? b : a;
                });
            }

            // The multiple markers aren't offset by half a point due to the difficulty in
            // calculating what the previous point is for each of the lines

            debouncedUpdate({
                tooltipData: d as Xydata[],
                tooltipLeft: x,
                tooltipTop: y,
                tooltipOpen,
            });
        },
        [debouncedUpdate, filteredData, margin.left, tooltipOpen, xScale],
    );

    return {
        handleTooltip,
        hideTooltip,
        updateTooltip,
        tooltipData,
        tooltipOpen,
        tooltipTop,
        tooltipLeft,
    };
}
