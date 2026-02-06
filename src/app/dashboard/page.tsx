import { getDashboardStats } from '@/app/actions/dashboard';
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
import { DashboardCharts } from "@/components/dashboard/dashboard-charts"; // Separated client component for charts

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const chartConfig = {
    reservations: { label: "Reservas", color: "hsl(var(--primary))" },
    count: { label: "Agendamentos", color: "hsl(var(--primary))" },
  };

  const pieChartConfig: any = {};
  stats.resourceTypeChartData.forEach((item: any, index: number) => {
    pieChartConfig[item.name] = {
      label: item.name,
      color: `hsl(var(--chart-${(index % 5) + 1}))`
    };
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Reservas</CardDescription>
            <CardTitle className="text-4xl">{stats.totalReservations}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              {stats.activeReservations} ativas agora
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Usuários</CardDescription>
            <CardTitle className="text-4xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total de Recursos</CardDescription>
            <CardTitle className="text-4xl">{stats.totalResources}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              Em {stats.resourceTypeChartData.length} tipos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Próximas Reservas</CardDescription>
            <CardTitle className="text-4xl">
              {stats.upcomingReservations}
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
        bookingTrendsData={stats.bookingTrendsData}
        resourceTypeChartData={stats.resourceTypeChartData}
        resourceUsageData={stats.resourceUsageData}
        chartConfig={chartConfig}
        pieChartConfig={pieChartConfig}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-7">
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
                {stats.recentReservations.map((reservation: any) => (
                  <TableRow key={reservation.id}>
                    <TableCell>{reservation.userName || "Usuário Desconhecido"}</TableCell>
                    <TableCell>
                      {reservation.resourceName || "Recurso Desconhecido"}
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
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
