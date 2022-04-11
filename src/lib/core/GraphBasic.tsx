import { ReactNode } from "react";
import { Group } from "@visx/group";
import { AxisScale } from "@visx/axis";
import { GridRows } from "@visx/grid";
import { graphColors } from "../colors";
import { graphMargin } from "../types";
import AxisY from "../parts/AxisY";
import AxisX from "../parts/AxisX";

interface LineBasicProps {
    data: Xydata[] | Xydata[][];
    xScale: AxisScale<number>;
    yScale: AxisScale<number>;
    width: number;
    xMax: number;
    yMax: number;
    margin: graphMargin;
    hideBottomAxis?: boolean;
    hideLeftAxis?: boolean;
    hideGrid?: boolean;
    top?: number;
    left?: number;
    children?: React.ReactNode;
    graph: GraphElement;
    xLabel?: string;
    yLabel?: string;
    isSkeleton?: boolean;
}

export type GraphElement = (graphElementProps: {
    data: Xydata[];
    x: (d: Xydata) => number;
    y: (d: Xydata) => number;
    isSkeleton?: boolean;
    index?: number;
}) => ReactNode;

export interface Xydata {
    x: any;
    y: any;
}

export default function GraphBasic({
    data,
    width,
    xMax,
    yMax,
    margin,
    xScale,
    yScale,
    hideBottomAxis = false,
    hideLeftAxis = false,
    hideGrid = false,
    top,
    left,
    graph,
    children,
    xLabel,
    yLabel,
    isSkeleton,
}: LineBasicProps) {
    // this shows less ticks (markers on an axis) at smaller widths
    const ticks = width > 520 ? 10 : 5;

    return (
        <Group left={left || margin.left} top={top || margin.top}>
            <>
                {!hideGrid && <GridRows scale={yScale} numTicks={ticks} stroke={graphColors.grid} width={xMax} />}
                {Array.isArray(data[0])
                    ? data.map((d: any, index: number) => (
                          <g key={index}>
                              {graph({
                                  data: d as Xydata[],
                                  x: d => xScale(d.x) || 0,
                                  y: d => yScale(d.y) || 0,
                                  isSkeleton,
                                  index,
                              })}
                          </g>
                      ))
                    : graph({
                          data: data as Xydata[],
                          x: d => xScale(d.x) || 0,
                          y: d => yScale(d.y) || 0,
                          isSkeleton,
                      })}
                {!hideBottomAxis && (
                    <AxisX isSkeleton={isSkeleton} width={width} top={yMax} scale={xScale} label={xLabel} />
                )}
                {!hideLeftAxis && <AxisY isSkeleton={isSkeleton} scale={yScale} label={yLabel} />}
                {children}
            </>
        </Group>
    );
}
