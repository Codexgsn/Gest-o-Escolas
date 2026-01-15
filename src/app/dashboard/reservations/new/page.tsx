
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState, Suspense } from "react";

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

import { getResources as getResourcesAction } from "@/app/actions/data";
import { type Resource } from "@/lib/data"
import { createReservationAction } from "@/app/actions/reservations"
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

    // Start slots are all times except the very last one
    const startSlots = sortedTimes.slice(0, -1);
    // End slots are all times except the very first one
    const endSlots = sortedTimes.slice(1);

    return { startSlots, endSlots };
}

function NewReservationForm() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const { toast } = useToast()
  const { currentUser } = useAuth();
  const [settings, setSettings] = useState<SchoolSettings | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const resourceIdFromParams = searchParams.get("resourceId");
  
  useEffect(() => {
    async function fetchInitialData() {
      try {
        const [schoolSettings, resourcesData] = await Promise.all([
          getSettings(),
          getResourcesAction(),
        ]);
        setSettings(schoolSettings);
        setResources(resourcesData);
      } catch (error) {
         toast({
            variant: "destructive",
            title: "Erro",
            description: "Não foi possível carregar as configurações e recursos.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchInitialData();
  }, [toast]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceId: resourceIdFromParams || "",
      description: "",
    },
  })

  // Set the resource ID from query params
  useEffect(() => {
     if (resourceIdFromParams) {
      form.setValue("resourceId", resourceIdFromParams);
    }
  }, [resourceIdFromParams, form]);


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!currentUser) {
        toast({
            variant: "destructive",
            title: "Erro",
            description: "Você precisa estar logado para criar uma reserva.",
        });
        return;
    }

    const submissionData = {
        ...values,
        userId: currentUser.id
    };

    const result = await createReservationAction(submissionData)

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
    today.setHours(0, 0, 0, 0); // Set to start of today
    if (date < today) return true; // Disable past dates
    if (settings?.operatingDays) {
      const dayOfWeek = date.getDay(); // Sunday is 0, Monday is 1, etc.
      return !settings.operatingDays.includes(dayOfWeek);
    }
    return false; // Enable all days if settings are not loaded
  };


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
        <CardTitle>Criar Nova Reserva</CardTitle>
        <CardDescription>
          Preencha o formulário para agendar um recurso. O sistema verificará
          automaticamente por conflitos e usará os horários da instituição.
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
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
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
            <Button type="submit">Verificar Disponibilidade &amp; Reservar</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default function NewReservationPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <NewReservationForm />
    </Suspense>
  )
}
