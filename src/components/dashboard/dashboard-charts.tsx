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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
                <CardHeader>
                    <CardTitle>Tipos de Recurso</CardTitle>
                    <CardDescription>Distribuição de recursos disponíveis.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={resourceTypeChartData} dataKey="value" nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}>
                                {resourceTypeChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={pieChartConfig[entry.name as keyof typeof pieChartConfig]?.color} />
                                ))}
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-3">
                <CardHeader>
                    <CardTitle>Utilização de Recursos</CardTitle>
                    <CardDescription>Total de reservas por recurso.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="w-full h-[300px]">
                        <BarChart
                            data={resourceUsageData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={false}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis />
                            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                            <Bar dataKey="reservations" fill="var(--color-reservations)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                        Passe o mouse ou toque nas barras para ver os detalhes do recurso.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
