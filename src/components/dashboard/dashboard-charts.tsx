'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, Pie, PieChart, Cell, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

export function DashboardCharts({
    bookingTrendsData,
    resourceTypeChartData,
    resourceUsageData,
    chartConfig,
    pieChartConfig
}: {
    bookingTrendsData: any[],
    resourceTypeChartData: any[],
    resourceUsageData: any[],
    chartConfig: any,
    pieChartConfig: any
}) {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4 border-none shadow-premium overflow-hidden">
                <CardHeader className="pb-4 border-b bg-muted/20">
                    <CardTitle className="text-lg font-bold">Distribuição de Recursos</CardTitle>
                    <CardDescription>Visualização por categorias de ensino.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={resourceTypeChartData} dataKey="value" nameKey="name"
                                innerRadius={70}
                                outerRadius={100}
                                paddingAngle={5}
                                strokeWidth={0}>
                                {resourceTypeChartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={pieChartConfig[entry.name as keyof typeof pieChartConfig]?.color}
                                        className="hover:opacity-80 transition-opacity outline-none"
                                    />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3 border-none shadow-premium overflow-hidden">
                <CardHeader className="pb-4 border-b bg-muted/20">
                    <CardTitle className="text-lg font-bold">Uso mais Frequente</CardTitle>
                    <CardDescription>Top recursos por volume de reservas.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <BarChart
                            data={resourceUsageData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.1} />
                            <XAxis
                                dataKey="name"
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <ChartTooltip cursor={{ fill: 'hsl(var(--muted)/0.3)' }} content={<ChartTooltipContent indicator="line" />} />
                            <Bar
                                dataKey="reservations"
                                fill="hsl(var(--primary))"
                                radius={[6, 6, 0, 0]}
                                barSize={32}
                            />
                        </BarChart>
                    </ChartContainer>
                    <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        Total de Reservas
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
