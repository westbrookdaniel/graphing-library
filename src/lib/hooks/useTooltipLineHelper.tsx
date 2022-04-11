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
    filteredData: Xydata[];
}

export function useTooltipLineHelper({ xScale, margin, filteredData }: Props) {
    const {
        hideTooltip,
        updateTooltip,
        tooltipData,
        tooltipOpen,
        tooltipTop = 0,
        tooltipLeft = 0,
    } = useTooltip<Xydata>();
    // the handler for tooltip is debounced to improve performance for large datasets
    // very short debounce time to prevent it feeling delayed
    const debouncedUpdate = useRef(debounce(updateTooltip, 5)).current;
    const handleTooltip = useCallback(
        (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
            const { x, y } = localPoint(event) || { x: 0 };

            // account for the offset we put on the handler
            // invert exists on LinearScale but the types only say it only exists on DateScale
            const x0 = (xScale as any).invert(x - margin.left);

            // figures out where x0 would lie within the dataset
            const index = findDatasetPoint(x0, filteredData);

            const d0 = filteredData[index - 1];
            const d1 = filteredData[index];
            let d = d0;
            if (!d) return;
            // This makes sure the point being shown is the closest one the the cursor
            if (d1 && d1.x) {
                d = x0 - d0.x > d1.x - x0 ? d1 : d0;
            }
            debouncedUpdate({
                tooltipData: d,
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
