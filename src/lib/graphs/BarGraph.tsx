import { GraphProps } from "../core/Graph";
import BarBasic from "../core/BarBasic";

export default function BarGraph<T>(props: Omit<GraphProps<T>, "graphType" | "isSkeleton">) {
    return <BarBasic {...props} />;
}
