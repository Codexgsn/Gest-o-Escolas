
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useParams } from "next/navigation"
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react"

import { getReservationById as getReservationByIdAction, getResources as getResourcesAction } from "@/app/actions/data";
import { type Reservation, type Resource } from "@/lib/data"
import { updateReservationAction } from "@/app/actions/reservations"
import { getSettings, type SchoolSettings } from "@/app/actions/settings"
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  resourceId: z.string().min(1, { message: "Por favor, selecione um recurso." }),
  date: z.date({ required_error: "Uma data é obrigatória." }),
  startTime: z.string({ required_error: "Por favor, selecione uma hora de início." }),
  endTime: z.string({ required_error: "Por favor, selecione uma hora de fim." }),
  description: z.string().optional(),
}).refine(data => data.endTime > data.startTime, {
    message: "A hora de fim deve ser posterior à hora de início.",
    path: ["endTime"],
});

function generateTimeSlots(settings: SchoolSettings | null): { startSlots: string[], endSlots: string[] } {
    if (!settings) return { startSlots: [], endSlots: [] };

    const { classBlocks, breaks } = settings;
    
    const allTimes = new Set<string>();

    classBlocks.forEach(block => {
        allTimes.add(block.startTime);
        allTimes.add(block.endTime);
    });

    breaks.forEach(breakItem => {
        allTimes.add(breakItem.startTime);
        allTimes.add(breakItem.endTime);
    });
    
    const sortedTimes = Array.from(allTimes).sort();

    const startSlots = sortedTimes.slice(0, -1);
    const endSlots = sortedTimes.slice(1);

    return { startSlots, endSlots };
}

export default function EditReservationPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const reservationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceId: "",
      description: "",
    },
  })

  useEffect(() => {
    async function fetchData() {
      if (!currentUser || !reservationId) {
        setIsLoading(false);
        return;
      };
      
      try {
        const [schoolSettings, reservationData, resourcesData] = await Promise.all([
            getSettings(),
            getReservationByIdAction(reservationId as string),
            getResourcesAction()
        ]);
        
        setResources(resourcesData);

        if (reservationData) {
            const isOwner = reservationData.userId === currentUser?.id;
            const isAdmin = currentUser?.role === 'Admin';
            if (!isOwner && !isAdmin) {
                 toast({
                    variant: "destructive",
                    title: "Acesso Negado",
                    description: "Você não tem permissão para editar esta reserva.",
                });
                router.push('/dashboard/reservations');
                return;
            }
            const parsedReservation = {
                ...reservationData,
                startTime: new Date(reservationData.startTime),
                endTime: new Date(reservationData.endTime),
            };
            setReservation(parsedReservation);
            form.reset({
                resourceId: parsedReservation.resourceId,
                date: new Date(parsedReservation.startTime),
                startTime: format(new Date(parsedReservation.startTime), 'HH:mm'),
                endTime: format(new Date(parsedReservation.endTime), 'HH:mm'),
                description: parsedReservation.purpose,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Reserva não encontrada.",
            });
            router.push('/dashboard/reservations');
            return;
        }

        setSettings(schoolSettings);
      } catch (error) {
         toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar os dados necessários para a edição.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [reservationId, currentUser, router, toast, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser || !reservation) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível salvar as alterações.",
        });
        return;
    }

    const submissionData = {
        ...values,
        id: reservation.id,
        userId: reservation.userId
    };

    const result = await updateReservationAction(submissionData, currentUser.id)

    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message,
      })
      router.push("/dashboard/reservations")
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message,
      })
    }
  }

  const { startSlots, endSlots } = generateTimeSlots(settings);
  const startTimeValue = form.watch("startTime");

  const isDayDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today && !isSameDay(date, today)) return true; // Disable past dates but not today
    if (settings?.operatingDays) {
      const dayOfWeek = date.getDay();
      return !settings.operatingDays.includes(dayOfWeek);
    }
    return false;
  };

  function isSameDay(date1: Date, date2: Date) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }


  if (isLoading) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2 mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-24 w-60" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Reserva</CardTitle>
        <CardDescription>
          Modifique os detalhes da sua reserva. O sistema verificará novamente por conflitos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="resourceId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recurso</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um recurso para reservar" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {resources.map((resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-[240px] pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ptBR })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={isDayDisabled}
                        initialFocus
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hora de Início</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione o início" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {startSlots.map((time) => (
                                <SelectItem key={`start-${time}`} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="endTime"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Hora de Fim</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                            <SelectTrigger>
                            <SelectValue placeholder="Selecione o fim" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {endSlots.filter(time => !startTimeValue || time > startTimeValue).map((time) => (
                                <SelectItem key={`end-${time}`} value={time}>
                                    {time}
                                </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Propósito / Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Reunião semanal do departamento"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Forneça uma breve descrição para a reserva.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Salvar Alterações</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
