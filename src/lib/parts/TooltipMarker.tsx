import { Line } from "@visx/shape";
import { graphColors } from "../colors";

interface Props<DataType> {
    tooltipData?: DataType;
    tooltipTop: number | number[];
    tooltipLeft: number;
    yMax: number;
    topMargin: number;
}
export default function TooltipMarker<DataType>({
    yMax,
    tooltipLeft,
    tooltipTop,
    tooltipData,
    topMargin,
}: Props<DataType>) {
    const CircleMarker = ({ tTop }: { tTop: number }) => (
        <g>
            <circle
                cx={tooltipLeft}
                cy={tTop + 1 + topMargin}
                r={4}
                fill="black"
                fillOpacity={0.1}
                stroke="black"
                strokeOpacity={0.1}
                strokeWidth={2}
                pointerEvents="none"
            />
            <circle
                cx={tooltipLeft}
                cy={tTop + topMargin}
                r={4}
                fill={graphColors.accent}
                stroke="white"
                strokeWidth={2}
                pointerEvents="none"
            />
        </g>
    );
    return (
        <>
            {tooltipData && (
                <g data-testid="tooltip">
                    <Line
                        from={{ x: tooltipLeft, y: topMargin }}
                        to={{ x: tooltipLeft, y: yMax + topMargin }}
                        stroke={graphColors.accent}
                        strokeWidth={2}
                        pointerEvents="none"
                        strokeDasharray="5,2"
                    />
                    {Array.isArray(tooltipTop) ? (
                        tooltipTop.map((tTop, i) => <CircleMarker key={i} tTop={tTop} />)
                    ) : (
                        <CircleMarker tTop={tooltipTop} />
                    )}
                </g>
            )}
        </>
    );
}
