
'use client' 

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  type User,
  type Resource,
  type Reservation
} from "@/lib/data";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, Pie, PieChart, Cell } from "recharts";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState, useMemo } from 'react';
import { database } from "@/firebase";
import { ref, onValue } from "firebase/database";

const DynamicLineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

const DynamicPieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

const DynamicBarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[300px] w-full" />,
});

function DashboardCharts({
  bookingTrendsData,
  resourceTypeChartData,
  chartConfig,
  pieChartConfig
}: {
  bookingTrendsData: any[],
  resourceTypeChartData: any[],
  chartConfig: any,
  pieChartConfig: any
}) {
  const { CartesianGrid, XAxis, YAxis } = require('recharts');

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Tendências de Agendamento</CardTitle>
                <CardDescription>Reservas nos últimos 7 dias.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <DynamicLineChart accessibilityLayer data={bookingTrendsData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
                    </DynamicLineChart>
                </ChartContainer>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Tipos de Recurso</CardTitle>
                <CardDescription>Distribuição de recursos disponíveis.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={pieChartConfig} className="h-[300px] w-full">
                    <DynamicPieChart>
                        <ChartTooltip content={<ChartTooltipContent nameKey="value" hideLabel />} />
                        <Pie data={resourceTypeChartData} dataKey="value" nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}>
                        {resourceTypeChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={pieChartConfig[entry.name as keyof typeof pieChartConfig]?.color} />
                        ))}
                        </Pie>
                    </DynamicPieChart>
                </ChartContainer>
            </CardContent>
        </Card>
    </div>
  )
}

function ResourceUsageChart({ data, config }: { data: any[], config: any }) {
    const { Bar, CartesianGrid, XAxis, YAxis } = require('recharts');
    return (
        <ChartContainer config={config} className="w-full h-[300px]">
            <DynamicBarChart
                data={data}
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
            </DynamicBarChart>
        </ChartContainer>
    );
}

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userMap, setUserMap] = useState<Map<string, User>>(new Map());
  const [resourceMap, setResourceMap] = useState<Map<string, Resource>>(new Map());

  const isLoading = !users.length || !resources.length || !reservations.length;

  useEffect(() => {
    const usersRef = ref(database, 'users');
    const resourcesRef = ref(database, 'resources');
    const reservationsRef = ref(database, 'reservations');

    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: User[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setUsers(list);
            setUserMap(new Map(list.map(u => [u.id, u])));
        }
    });

    const unsubscribeResources = onValue(resourcesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: Resource[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
            setResources(list);
            setResourceMap(new Map(list.map(r => [r.id, r])));
        }
    });

    const unsubscribeReservations = onValue(reservationsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const list: Reservation[] = Object.keys(data).map(key => ({
                id: key,
                ...data[key],
                startTime: new Date(data[key].startTime),
                endTime: new Date(data[key].endTime)
            }));
            setReservations(list);
        }
    });

    return () => {
        unsubscribeUsers();
        unsubscribeResources();
        unsubscribeReservations();
    };
  }, []);


 const dashboardData = useMemo(() => {
    if (isLoading) {
        return {
            activeReservations: 0,
            upcomingReservations: 0,
            totalUsers: 0,
            totalResources: 0,
            totalReservations: 0,
            recentReservations: [],
            resourceUsageData: [],
            bookingTrendsData: [],
            resourceTypeChartData: [],
        };
    }

    const now = new Date();
    const activeReservations = reservations.filter(
      (r) => r.status === "Confirmada" && new Date(r.endTime) > now
    ).length;

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);
    const upcomingReservations = reservations.filter(
        (r) =>
            new Date(r.startTime) > now &&
            new Date(r.startTime) <= sevenDaysFromNow &&
            r.status === "Confirmada"
    ).length;

    const totalUsers = users.length;
    const totalResources = resources.length;
    const totalReservations = reservations.length;

    const recentReservations = reservations
      .slice()
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 5);
    
    const resourceUsageData = resources.map((resource) => ({
      name: resource.name,
      reservations: reservations.filter((r) => r.resourceId === resource.id)
        .length,
    })).sort((a, b) => b.reservations - a.reservations);

    const bookingTrendsData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return {
        date: d.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        count: reservations.filter(
          (r) => new Date(r.startTime).toDateString() === d.toDateString()
        ).length,
      };
    }).reverse();

    const resourceTypeData = resources.reduce((acc, resource) => {
      const type = resource.type || "Desconhecido";
      if (!acc[type]) {
        acc[type] = { name: type, value: 0 };
      }
      acc[type].value++;
      return acc;
    }, {} as Record<string, {name: string, value: number}>);

    const resourceTypeChartData = Object.values(resourceTypeData);

    return {
      activeReservations,
      upcomingReservations,
      totalUsers,
      totalResources,
      totalReservations,
      recentReservations,
      resourceUsageData,
      bookingTrendsData,
      resourceTypeChartData,
    }
  }, [isLoading, users, resources, reservations]);

  
  const chartConfig = {
    reservations: { label: "Reservas", color: "hsl(var(--primary))" },
    count: { label: "Agendamentos", color: "hsl(var(--primary))" },
  };

  const pieChartConfig = useMemo(() => {
    if (!resources || !resources.length) return {};
    const types = [...new Set(resources.map(r => r.type || "Desconhecido"))];
    const config: any = {};
    types.forEach((type, index) => {
        config[type as string] = {
            label: type,
            color: `hsl(var(--chart-${(index % 5) + 1}))`
        };
    });
    return config;
  }, [resources]);


  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Reservas</CardDescription>
            <CardTitle className="text-4xl">{dashboardData.totalReservations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {dashboardData.activeReservations} ativas agora
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-4xl">{dashboardData.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {users?.filter(u => u.role === 'Admin').length || 0} administradores
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Recursos</CardDescription>
            <CardTitle className="text-4xl">{dashboardData.totalResources}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Em {new Set(resources?.map(r => r.type) || []).size} tipos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximas Reservas</CardDescription>
            <CardTitle className="text-4xl">
              {dashboardData.upcomingReservations}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Nos próximos 7 dias
            </div>
          </CardContent>
        </Card>
      </div>

      <DashboardCharts 
        bookingTrendsData={dashboardData.bookingTrendsData}
        resourceTypeChartData={dashboardData.resourceTypeChartData}
        chartConfig={chartConfig}
        pieChartConfig={pieChartConfig}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
            <CardDescription>
              Um registro das reservas mais recentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentReservations.map((reservation) => {
                  const user = userMap.get(reservation.userId);
                  const resource = resourceMap.get(reservation.resourceId);
                  return (
                    <TableRow key={reservation.id}>
                      <TableCell>{user?.name || "Usuário Desconhecido"}</TableCell>
                      <TableCell>
                        {resource?.name || "Recurso Desconhecido"}
                      </TableCell>
                      <TableCell>
                        {new Date(reservation.startTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            reservation.status === "Confirmada"
                              ? "default"
                              : reservation.status === "Cancelada"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
              <CardTitle>Utilização de Recursos</CardTitle>
              <CardDescription>Total de reservas por recurso.</CardDescription>
          </CardHeader>
          <CardContent>
             <ResourceUsageChart data={dashboardData.resourceUsageData} config={chartConfig} />
             <p className="text-xs text-muted-foreground mt-2 text-center">
                Passe o mouse ou toque nas barras para ver os detalhes do recurso.
             </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
