import { ParentSize } from "@visx/responsive";
import MatrixGraph from "./lib/graphs/MatrixGraph";
import { getColorFromLabel } from "./lib/colors";
import BarGraph from "./lib/graphs/BarGraph";
import { dataGenerator, defaultAccessors } from "./lib/helpers";
import LineGraph from "./lib/graphs/LineGraph";
import LineBrushGraphMulti from "./lib/graphs/LineBrushGraphMulti";

const lineData = dataGenerator(1000);
const multiLineData = [dataGenerator(10000, "John"), dataGenerator(10000, "Daniel")];

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
                        href="https://github.com/westbrookdaniel/graphing-library"
                        target="_blank"
                        className="underline hover:no-underline text-neutral-500"
                        rel="noreferrer"
                    >
                        <p>View on Github</p>
                    </a>
                </div>
                <ParentSize>
                    {({ width }) => (
                        <div className="flex flex-col items-center space-y-16">
                            <LineGraph accessors={defaultAccessors} data={lineData} width={width} height={500} />
                            <LineBrushGraphMulti
                                accessors={defaultAccessors}
                                data={multiLineData}
                                initalFilter={15}
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
                                tooltipLabel={data => (
                                    <div className="space-y-1">
                                        <p>{data.y}</p>
                                        <p>Coffees Drunk: {data.x}</p>
                                    </div>
                                )}
                            />
                            {/* 
                                Confusion Matrix Graph
                                Similar to: https://scikit-learn.org/stable/modules/generated/sklearn.metrics.plot_confusion_matrix.html
                            */}
                            <MatrixGraph
                                data={[
                                    [7, 4, 1, 2, 0],
                                    [1, 4, 4, 1, 0],
                                    [1, 8, 5, 6, 1],
                                    [0, 2, 6, 4, 2],
                                    [2, 1, 1, 4, 5],
                                ]}
                                labels={["Apple", "Orange", "Grape", "Mango", "Pear"]}
                                xLabel="Predicted Fruit Eaten"
                                yLabel="Actual Fruit Eaten"
                                width={width > 600 ? 600 : width}
                                height={width > 600 ? 600 : width}
                            />
                        </div>
                    )}
                </ParentSize>
            </div>
        </div>
    );
};

export default App;
