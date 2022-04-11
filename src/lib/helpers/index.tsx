import { graphColors } from "../colors";
import type { TickRendererProps } from "@visx/axis/lib";
import type { Xydata } from "../core/GraphBasic";

export function dataGenerator(n: number, label?: string) {
    const result = [];
    let lastY = Math.random() * 40 - 20;
    let y;
    const firstY = lastY;
    for (let i = 0; i < n; i++) {
        y = Math.random() * firstY - firstY / 2 + lastY;
        result.push({
            x: i,
            y,
            label,
        });
        lastY = y;
    }
    return result;
}

export const defaultAccessors = {
    xAccessor: (d: Xydata) => d.x,
    yAccessor: (d: Xydata) => d.y,
};

export const getLargestLabel = (labels: (string | number)[]) => {
    return Math.max(...labels.map(item => item.toString().length));
};

interface CreateSkeletonAxisTextProps extends TickRendererProps {
    skeletonWidth: number;
    skeletonHeight: number;
    vertical: boolean;
    tickOffset?: number;
}
export const createSkeletonAxisText = ({
    vertical,
    skeletonWidth,
    skeletonHeight,
    tickOffset = 5,
    x,
    y,
}: CreateSkeletonAxisTextProps) => {
    const position = vertical
        ? {
              x: x - skeletonWidth - tickOffset,
              y: y - skeletonHeight / 2,
          }
        : {
              x: x - skeletonHeight,
              y: y - skeletonWidth / 2 + tickOffset,
          };
    return (
        <rect
            {...position}
            fill={graphColors.grid}
            width={skeletonWidth}
            height={skeletonHeight}
            data-testid="skeleton"
        />
    );
};
