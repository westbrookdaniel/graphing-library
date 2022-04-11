import { GraphElement } from "./core/GraphBasic";

export interface StandardGraphProps<DataType> extends CoreGraphProps {
    accessors: {
        xAccessor: (d: DataType) => any;
        yAccessor: (d: DataType) => any;
    };
    graphType: GraphElement;
    xLabel?: string;
    yLabel?: string;
    data: DataType[];
}

export type CoreGraphProps = {
    width: number;
    height: number;
    isSkeleton?: boolean;
};

export interface graphMargin {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
