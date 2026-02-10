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
import { DashboardCharts } from "@/components/dashboard/dashboard-charts";
import * as motion from "framer-motion/client";
import {
  Users,
  CalendarCheck2,
  Building2,
  History,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Painel de Gestão</h1>
          <p className="text-muted-foreground">Bem-vindo de volta! Aqui está um resumo do que está acontecendo.</p>
        </div>
        <Button asChild className="shadow-premium hover:scale-105 transition-transform">
          <Link href="/dashboard/reservations/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Nova Reserva
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="relative overflow-hidden border-none shadow-premium bg-gradient-to-br from-primary/10 via-background to-background">
            <div className="absolute top-0 right-0 p-3 opacity-20">
              <CalendarCheck2 className="w-12 h-12 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium text-primary/80">Total de Reservas</CardDescription>
              <CardTitle className="text-4xl font-bold">{stats.totalReservations}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-3 h-3" />
                <span>{stats.activeReservations} ativas agora</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="relative overflow-hidden border-none shadow-premium">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Users className="w-12 h-12" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total de Usuários</CardDescription>
              <CardTitle className="text-4xl font-bold">{stats.totalUsers}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Membros registrados
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="relative overflow-hidden border-none shadow-premium">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Building2 className="w-12 h-12" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Total de Recursos</CardDescription>
              <CardTitle className="text-4xl font-bold">{stats.totalResources}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Em {stats.resourceTypeChartData.length} categorias
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="relative overflow-hidden border-none shadow-premium bg-gradient-to-br from-accent/50 via-background to-background">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <History className="w-12 h-12 text-primary" />
            </div>
            <CardHeader className="pb-2">
              <CardDescription className="font-medium">Próximas Reservas</CardDescription>
              <CardTitle className="text-4xl font-bold">{stats.upcomingReservations}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-muted-foreground">
                Agendadas para os próximos 7 dias
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >

        <DashboardCharts
          bookingTrendsData={stats.bookingTrendsData}
          resourceTypeChartData={stats.resourceTypeChartData}
          resourceUsageData={stats.resourceUsageData}
          chartConfig={chartConfig}
          pieChartConfig={pieChartConfig}
        />

      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid gap-6 md:grid-cols-2 lg:grid-cols-7"
      >
        <Card className="lg:col-span-7 border-none shadow-premium overflow-hidden">
          <CardHeader className="border-b bg-muted/30 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <CardTitle>Atividade Recente</CardTitle>
            </div>
            <CardDescription>
              Últimas 10 reservas realizadas no sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px] font-semibold">Usuário</TableHead>
                  <TableHead className="font-semibold">Recurso</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="text-right font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentReservations.map((reservation: any, index: number) => (
                  <TableRow
                    key={reservation.id}
                    className="group transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                          {(reservation.userName || "U")[0].toUpperCase()}
                        </div>
                        {reservation.userName || "Usuário Desconhecido"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {reservation.resourceName || "Recurso Desconhecido"}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(reservation.startTime).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          reservation.status === "Confirmada"
                            ? "default"
                            : reservation.status === "Cancelada"
                              ? "destructive"
                              : "secondary"
                        }
                        className="rounded-full px-3 py-0.5"
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
      </motion.div>
    </div>
  );
}
