import React, { useMemo } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface WeightDataPoint {
    date: Date;
    weight: number;
}

interface WeightTrendChartProps {
    history: { date: string | Date; weight: number }[];
    currentWeight: number;
}

const WeightTrendChart: React.FC<WeightTrendChartProps> = ({ history, currentWeight }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // Advanced Chart Configuration
    const width = 350;
    const height = 220;
    const padding = { top: 30, right: 20, bottom: 30, left: 40 };
    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    const chartData = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // Filter and Sort
        let points: WeightDataPoint[] = history
            .map(h => ({ date: new Date(h.date), weight: Number(h.weight) }))
            .filter(p => !isNaN(p.weight) && p.weight > 0) // Basic validation
            .filter(p => p.date.getMonth() === currentMonth && p.date.getFullYear() === currentYear)
            .sort((a, b) => a.date.getTime() - b.date.getTime());

        // Use ALL points for the month (drawing continuous line), 
        // but if there are too many, we might need to downsample for performance? 
        // For a single user month, it's unlikely to be > 31 points (once per day). 
        // So keeping all is fine.

        // If empty, add current
        if (points.length === 0) {
            points = [{ date: now, weight: currentWeight }];
        }

        // Ensure strictly chronological for line drawing
        return points;
    }, [history, currentWeight]);

    // Calculate Scales
    const weights = chartData.map(p => p.weight);
    // Determine strict bounds to make the chart look "zoomed in" like the screenshot
    // Min should be slightly below the lowest, Max slightly above highest.
    const minW = Math.min(...weights);
    const maxW = Math.max(...weights);

    // Y-Axis Range padding (e.g. +1/-1 kg)
    const yMin = Math.floor(minW) - 1;
    const yMax = Math.ceil(maxW) + 1;
    const yRange = yMax - yMin || 2;

    const dates = chartData.map(p => p.date.getTime());
    const xMin = Math.min(...dates);
    const xMax = Math.max(...dates);

    // Determine X-Axis range (start of month to end of month OR current range)
    // Screenshot shows full month grid (1, 8, 15, 22, 29). 
    // Let's use the full current month as the X domain.
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day
    const xRange = endOfMonth.getTime() - startOfMonth.getTime();

    // Coordinate Helpers
    const getX = (date: Date) => {
        const fraction = (date.getTime() - startOfMonth.getTime()) / xRange;
        return padding.left + fraction * graphWidth;
    };

    const getY = (weight: number) => {
        const fraction = (weight - yMin) / yRange;
        return (height - padding.bottom) - (fraction * graphHeight);
    };

    // Generate Path
    const pointsStr = chartData.map(p => `${getX(p.date)},${getY(p.weight)}`).join(' ');

    // Area Path
    const areaPath = `
        M ${getX(chartData[0].date)},${height - padding.bottom}
        L ${pointsStr}
        L ${getX(chartData[chartData.length - 1].date)},${height - padding.bottom}
        Z
    `;

    // Colors (Purple Aesthetic)
    const strokeColor = '#a78bfa'; // Violet-400
    const areaGradientStart = 'rgba(167, 139, 250, 0.5)'; // Violet-400 with opacity
    const areaGradientEnd = 'rgba(167, 139, 250, 0.05)';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
    const textColor = isDark ? '#a3a3a3' : '#737373';

    // Grid Generation
    // Y-Axis Lines (every 2kg or integer based on range)
    const yGridLines = [];
    const step = yRange <= 5 ? 1 : 2;
    for (let w = yMin; w <= yMax; w += step) {
        yGridLines.push(w);
    }

    // X-Axis Lines (weeks: 1, 8, 15, 22, 29)
    const xGridLines = [1, 8, 15, 22, 29];

    return (
        <div className="w-full flex justify-center bg-transparent">
            <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                <defs>
                    <linearGradient id="purpleArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={areaGradientStart} />
                        <stop offset="100%" stopColor={areaGradientEnd} />
                    </linearGradient>
                </defs>

                {/* Y-Axis Grid & Labels */}
                {yGridLines.map(val => {
                    const y = getY(val);
                    return (
                        <g key={`y-${val}`}>
                            {/* Grid Line */}
                            <line
                                x1={padding.left}
                                y1={y}
                                x2={width - padding.right}
                                y2={y}
                                stroke={gridColor}
                                strokeWidth="1"
                            />
                            {/* Label */}
                            <text
                                x={padding.left - 8}
                                y={y + 3}
                                textAnchor="end"
                                fontSize="10"
                                fill={textColor}
                                fontWeight="500"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}

                {/* X-Axis Grid & Labels */}
                {xGridLines.map(day => {
                    // Reconstruct date for position
                    const d = new Date(startOfMonth);
                    d.setDate(day);
                    const x = getX(d);

                    // Only draw if within bounds
                    if (d > endOfMonth) return null;

                    return (
                        <g key={`x-${day}`}>
                            {/* Grid Line */}
                            <line
                                x1={x}
                                y1={padding.top}
                                x2={x}
                                y2={height - padding.bottom}
                                stroke={gridColor}
                                strokeWidth="1"
                            />
                            {/* Label */}
                            <text
                                x={x}
                                y={height - padding.bottom + 15}
                                textAnchor="middle"
                                fontSize="10"
                                fill={textColor}
                                fontWeight="500"
                            >
                                {day}
                            </text>
                        </g>
                    );
                })}

                {/* Main Graph Area */}
                {chartData.length > 0 && (
                    <>
                        <path d={areaPath} fill="url(#purpleArea)" stroke="none" />
                        <polyline
                            points={pointsStr}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="drop-shadow-md"
                        />
                    </>
                )}

                {/* Axis Unit Label */}
                <text x={10} y={padding.top - 10} fontSize="12" fill={textColor} fontWeight="bold">kg</text>

            </svg>
        </div>
    );
};

export default WeightTrendChart;
