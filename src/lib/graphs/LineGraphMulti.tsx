import { LinePath } from "@visx/shape";
import type { LinePathProps } from "@visx/shape/lib/shapes/LinePath";
import type { AddSVGProps } from "@visx/shape/lib/types";
import { curveLinear } from "d3-shape";
import { graphColors } from "../colors";
import { Xydata } from "../core/GraphBasic";
import GraphMulti, { GraphProps } from "../core/GraphMulti";

export type lineProps = AddSVGProps<LinePathProps<Xydata>, SVGPathElement>;
interface MultiProps<T> {
    data: T[][];
    getLineProps?: (index?: number) => lineProps;
}

export default function LineGraphMulti<T>({
    data: multidata,
    getLineProps = () => ({}),
    ...props
}: Omit<GraphProps<T>, "graphType" | "isSkeleton" | "multidata"> & MultiProps<T>) {
    return (
        <GraphMulti
            multidata={multidata}
            {...props}
            graphType={({ data, x, y, isSkeleton, index }) => {
                const lineProps = getLineProps(index);
                return (
                    <LinePath
                        data={data}
                        x={x}
                        y={y}
                        strokeWidth={lineProps?.strokeWidth || 2}
                        stroke={isSkeleton ? graphColors.grid : lineProps?.stroke || graphColors.stroke}
                        curve={lineProps?.curve || curveLinear}
                        {...lineProps}
                    />
                );
            }}
        />
    );
}
