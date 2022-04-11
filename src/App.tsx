import { ParentSize } from "@visx/responsive";
import { getColorFromLabel } from "./lib/colors";
import BarGraph from "./lib/graphs/BarGraph";
import LineBrushGraph from "./lib/graphs/LineBrushGraph";
import LineGraphMulti from "./lib/graphs/LineGraphMulti";
import { dataGenerator, defaultAccessors } from "./lib/helpers";

const lineData = dataGenerator(10000);
const multiLineData = [dataGenerator(1000, "John"), dataGenerator(1000, "Daniel")];

const getLineProps = (index?: number) => {
    const label = typeof index === "number" ? multiLineData[index][0]?.label : undefined;
    return { stroke: getColorFromLabel(label) };
};

const App: React.FC = () => {
    return (
        <div className="w-full h-full max-w-[1440px] mx-auto">
            <div className="p-8 pb-32 space-y-16">
                <div className="flex items-baseline justify-between">
                    <h1 className="text-xl font-bold">Abstracted Visx Graph Library</h1>
                    <a
                        href="https://westbrookdaniel.com/"
                        target="_blank"
                        className="underline hover:no-underline text-neutral-500"
                        rel="noreferrer"
                    >
                        <p>Daniel Westbrook</p>
                    </a>
                </div>
                <ParentSize>
                    {({ width }) => (
                        <div className="space-y-16">
                            <LineBrushGraph
                                accessors={defaultAccessors}
                                data={lineData}
                                width={width}
                                height={500}
                                initalFilter={15}
                            />
                            <LineGraphMulti
                                accessors={defaultAccessors}
                                data={multiLineData}
                                width={width}
                                height={500}
                                xLabel="Sheep"
                                yLabel="Minutes until asleep"
                                getLineProps={getLineProps}
                                tooltipLabel={data => (
                                    <div className="space-y-1">
                                        <p className="text-xs">Sheep: {data[0].x}</p>
                                        {data.map((d, i) => {
                                            const label = multiLineData[i]?.[0]?.label;
                                            return (
                                                <div className="flex items-center space-x-2">
                                                    <div
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: getColorFromLabel(label) }}
                                                    />
                                                    <p key={i}>
                                                        {label || "Unknown"}'s Minutes: {d.y.toFixed(2)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            />
                            <BarGraph
                                accessors={defaultAccessors}
                                data={[
                                    { x: 30, y: "Monday" },
                                    { x: 12, y: "Tuesday" },
                                    { x: 21, y: "Wednesday" },
                                    { x: 6, y: "Thursday" },
                                    { x: 10, y: "Friday" },
                                    { x: 2, y: "Saturday" },
                                    { x: 3, y: "Sunday" },
                                ]}
                                xLabel="Coffees Drunk"
                                width={width}
                                height={500}
                            />
                        </div>
                    )}
                </ParentSize>
            </div>
        </div>
    );
};

export default App;
