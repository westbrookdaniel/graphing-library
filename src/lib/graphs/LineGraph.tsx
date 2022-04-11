import { LinePath } from "@visx/shape";
import { curveLinear } from "d3-shape";
import Graph, { GraphProps } from "../core/Graph";
import { graphColors } from "../colors";
import type { AddSVGProps } from "@visx/shape/lib/types";
import type { LinePathProps } from "@visx/shape/lib/shapes/LinePath";
import { Xydata } from "../core/GraphBasic";

interface Props {
    lineProps?: AddSVGProps<LinePathProps<Xydata>, SVGPathElement>;
}

export default function LineGraph<T>({
    lineProps = {},
    ...props
}: Omit<GraphProps<T>, "graphType" | "isSkeleton"> & Props) {
    return (
        <Graph
            {...props}
            graphType={({ data, x, y, isSkeleton }) => {
                return (
                    <LinePath
                        data={data}
                        x={x}
                        y={y}
                        strokeWidth={lineProps.strokeWidth || 2}
                        stroke={isSkeleton ? graphColors.grid : lineProps.stroke || graphColors.stroke}
                        curve={lineProps.curve || curveLinear}
                        {...lineProps}
                    />
                );
            }}
        />
    );
}
