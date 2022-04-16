import { ScaleLinear, ScaleTime } from "d3-scale";
import { useMemo } from "react";
import { Xydata } from "../core/GraphBasic";

interface Props {
    data: Xydata[];
    initalFilter: "none" | number;
    brushXScale: ScaleTime<number, number, never> | ScaleLinear<number, number, never>;
}

const useInitialBrushPosition = ({ data, initalFilter, brushXScale }: Props) => {
    return useMemo(() => {
        // If there is no data or no filter don't set the brush
        return data.length === 0 || initalFilter === "none"
            ? {
                  start: { x: 0 },
                  end: { y: 0 },
              }
            : {
                  // Brush starts at scaled location of the first dataset x position
                  start: { x: brushXScale(data[0].x) },
                  // Brush ends at scaled location of an x position in the
                  // dataset at a fraction of the way through the data
                  end: {
                      x: brushXScale(data[Math.floor(data.length / initalFilter)].x),
                  },
              };
    }, [brushXScale, data, initalFilter]);
};

export default useInitialBrushPosition;
