import { bisector } from "d3";
import { Xydata } from "../core/GraphBasic";

export const bisectDate = bisector<Xydata, Date>(d => new Date(d.x)).left;
export const bisectNumber = bisector<Xydata, number>(d => d.x).left;

export const findDatasetPoint = (x0: number | Date, filtered: Xydata[]) => {
    // Figures out where x0 would lie within the dataset
    let index;
    if (typeof x0 === "number") {
        index = bisectNumber(filtered, x0, 1);
    } else if (x0 instanceof Date) {
        index = bisectDate(filtered, x0, 1);
    } else {
        throw new Error("Type not supported");
    }
    return index;
};
