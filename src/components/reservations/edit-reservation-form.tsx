
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { format, parse } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react"

import type { Reservation, Resource } from "@/lib/definitions"
import { updateReservationAction } from "@/app/actions/reservations"
import type { SchoolSettings } from "@/app/actions/settings"

// Valid admin UUID found in database. Replace with your actual auth logic.
const DUMMY_USER_ID = 'f2a33cb6-66ca-4081-b5ff-5076547744d9';

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
  const allTimes = new Set<string>();
  settings.classBlocks.forEach(block => {
    allTimes.add(block.startTime);
    allTimes.add(block.endTime);
  });
  settings.breaks.forEach(breakItem => {
    allTimes.add(breakItem.startTime);
    allTimes.add(breakItem.endTime);
  });
  const sortedTimes = Array.from(allTimes).sort();
  return { startSlots: sortedTimes.slice(0, -1), endSlots: sortedTimes.slice(1) };
}

interface EditReservationFormProps {
  reservation: Reservation;
  resources: Resource[];
  settings: SchoolSettings | null;
}

export function EditReservationForm({ reservation, resources, settings }: EditReservationFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      resourceId: reservation.resourceId,
      date: new Date(reservation.startTime),
      startTime: format(new Date(reservation.startTime), 'HH:mm'),
      endTime: format(new Date(reservation.endTime), 'HH:mm'),
      description: reservation.description || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const submissionData = {
      ...values,
      id: reservation.id, // Include the reservation ID for the update action
    };

    const result = await updateReservationAction(submissionData, DUMMY_USER_ID);

    if (result.success) {
      toast({ title: "Sucesso", description: result.message });
      router.push("/dashboard/reservations");
      router.refresh(); // Refresh the list page
    } else {
      toast({ variant: "destructive", title: "Erro", description: result.message });
    }
  }

  const { startSlots, endSlots } = generateTimeSlots(settings);
  const startTimeValue = form.watch("startTime");

  const isDayDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reservationDate = new Date(reservation.startTime);
    reservationDate.setHours(0, 0, 0, 0);
    // Allow the original reservation date, but disable other past dates.
    if (date < today && date.getTime() !== reservationDate.getTime()) return true;
    if (settings?.operatingDays) {
      return !settings.operatingDays.includes(date.getDay());
    }
    return false;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      className={cn("w-[240px] pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                    >
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={isDayDisabled} initialFocus locale={ptBR} />
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o início" /></SelectTrigger></FormControl>
                  <SelectContent>{startSlots.map((time) => <SelectItem key={`start-${time}`} value={time}>{time}</SelectItem>)}</SelectContent>
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
                  <FormControl><SelectTrigger><SelectValue placeholder="Selecione o fim" /></SelectTrigger></FormControl>
                  <SelectContent>{endSlots.filter(time => !startTimeValue || time > startTimeValue).map((time) => <SelectItem key={`end-${time}`} value={time}>{time}</SelectItem>)}</SelectContent>
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
              <FormControl><Textarea placeholder="Ex: Reunião semanal do departamento" {...field} /></FormControl>
              <FormDescription>Forneça uma breve descrição para a reserva.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Salvar Alterações</Button>
      </form>
    </Form>
  );
}
