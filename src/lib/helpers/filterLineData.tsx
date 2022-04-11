import type { Bounds } from "@visx/brush/lib/types";
import { Xydata } from "../core/GraphBasic";

// for two x axis points (x0 and x1), filters the xydata
// provided to only include points within this range
export const filterLineData = ({ x0, x1 }: Bounds, xydata: Xydata[]) => {
    return xydata.filter(s => {
        return s.x >= x0 && s.x <= x1;
    });
};
