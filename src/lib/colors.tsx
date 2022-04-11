export const graphColors = {
    axis: "#4C4E5D",
    grid: "#DADADA",
    stroke: "#3E3E3E",
    accent: "#0398FC",
    rangeColor: [
        "#ff8a86",
        "#e7a801",
        "#45c662",
        "#01c9e8",
        "#9a9cf2",
        "#d64448",
        "#b07903",
        "#1f8e39",
        "#0398b6",
        "#5b60ca",
        "#8c1e21",
        "#7d4e03",
        "#085919",
        "#026986",
        "#2d2a89",
    ],
    rangeGray: ["#c7c7c7", "#cdcdcd", "#9d9d9d", "#b6b6b6", "#c1c1c1", "#9d9d9d"],
};

const defaultColor = "black";
const colors = [...graphColors.rangeColor];
let allLabels: string[] = [];

/**
 * Gets a color from a pre-determined list of colors. If the index
 * exceeds the amount colors, it generates a new one and appends it
 * to the color list.
 */
export const getColor = (index: number): string => {
    if (index < 0) return defaultColor;
    const foundColor = colors[index];
    if (!foundColor) {
        colors.push(generateRandomColor());
        const newFoundColor = colors[index];
        if (!newFoundColor) return getColor(index);
        return newFoundColor;
    }
    return foundColor;
};

/**
 * Gets a color based on the label provided.
 */
export const getColorFromLabel = (label?: string): string => {
    if (!label) return defaultColor;
    if (allLabels.indexOf(label) === -1) allLabels.push(label);
    const foundColor = getColor(allLabels.indexOf(label));
    return foundColor;
};

/**
 * Gets a color based on the label provided.
 */
export const generateRandomColor = () => {
    const chars = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += chars[Math.floor(Math.random() * (chars.length - 1))];
    }
    return color;
};
