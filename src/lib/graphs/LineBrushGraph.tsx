import { LinePath } from "@visx/shape";
import type { LinePathProps } from "@visx/shape/lib/shapes/LinePath";
import type { AddSVGProps } from "@visx/shape/lib/types";
import { curveLinear } from "d3-shape";
import { graphColors } from "../colors";
import BrushGraph, { BrushProps } from "../core/BrushGraph";
import { Xydata } from "../core/GraphBasic";

interface Props {
    lineProps?: AddSVGProps<LinePathProps<Xydata>, SVGPathElement>;
}

export default function LineBrushGraph<T>({
    lineProps = {},
    ...props
}: Omit<BrushProps<T>, "graphType" | "isSkeleton"> & Props) {
    return (
        <BrushGraph
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
