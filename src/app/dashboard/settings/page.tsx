
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import {
  getSettings,
  updateSettingsAction,
  type SchoolSettings,
} from '@/app/actions/settings';
import { Trash2, PlusCircle, Wand2, Building, ChevronRight, Tag, X } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';


const timeSlotSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
});

const settingsSchema = z.object({
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Formato inválido (HH:MM)'),
  classBlockMinutes: z.coerce.number().min(1, 'A duração deve ser maior que 0.'),
  operatingDays: z.array(z.number()).default([1, 2, 3, 4, 5]),
  classBlocks: z.array(timeSlotSchema).optional().default([]),
  breaks: z.array(timeSlotSchema).optional().default([]),
  resourceTags: z.array(z.string()).optional().default([]),
});

const daysOfWeek = [
  { id: 1, label: 'Segunda-feira' },
  { id: 2, label: 'Terça-feira' },
  { id: 3, label: 'Quarta-feira' },
  { id: 4, label: 'Quinta-feira' },
  { id: 5, label: 'Sexta-feira' },
  { id: 6, label: 'Sábado' },
  { id: 0, label: 'Domingo' },
];

function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

function minutesToTime(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60).toString().padStart(2, '0');
    const minutes = (totalMinutes % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [newTag, setNewTag] = useState('');

  const form = useForm<z.infer<typeof settingsSchema>>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      startTime: '07:30',
      endTime: '17:00',
      classBlockMinutes: 50,
      operatingDays: [1, 2, 3, 4, 5],
      classBlocks: [],
      breaks: [],
      resourceTags: [],
    },
  });

  const { fields: classBlockFields, append: appendClassBlock, remove: removeClassBlock, replace: replaceClassBlocks } = useFieldArray({
    control: form.control,
    name: 'classBlocks',
  });

  const { fields: breakFields, append: appendBreak, remove: removeBreak } = useFieldArray({
    control: form.control,
    name: 'breaks',
  });
  
  const { fields: tagFields, append: appendTag, remove: removeTag } = useFieldArray({
    control: form.control,
    name: "resourceTags",
  });

  const handleAddTag = () => {
    // @ts-ignore
    if (newTag && !tagFields.some(field => field.value === newTag)) {
       // @ts-ignore
      appendTag(newTag);
      setNewTag('');
    }
  };


  const handleGenerateClassBlocks = () => {
    const { startTime, endTime, classBlockMinutes, breaks = [] } = form.getValues();
    const newClassBlocks: { startTime: string; endTime: string }[] = [];

    let currentTime = timeToMinutes(startTime);
    const endTimeMinutes = timeToMinutes(endTime);
    const sortedBreaks = [...breaks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

    while (currentTime < endTimeMinutes) {
        let isBreakTime = false;
        
        for (const breakItem of sortedBreaks) {
            const breakStart = timeToMinutes(breakItem.startTime);
            const breakEnd = timeToMinutes(breakItem.endTime);
            if (currentTime >= breakStart && currentTime < breakEnd) {
                currentTime = breakEnd;
                isBreakTime = true;
                break;
            }
        }

        if (isBreakTime) continue;

        const newEndTime = currentTime + classBlockMinutes;

        if (newEndTime > endTimeMinutes) {
            break;
        }

        let overlap = false;
        for (const breakItem of sortedBreaks) {
            const breakStart = timeToMinutes(breakItem.startTime);
             if (currentTime < breakStart && newEndTime > breakStart) {
                overlap = true;
                break;
            }
        }
        
        if (overlap) {
            for (const breakItem of sortedBreaks) {
                const breakStart = timeToMinutes(breakItem.startTime);
                 const breakEnd = timeToMinutes(breakItem.endTime);
                if(breakStart > currentTime) {
                    currentTime = breakEnd
                    break;
                }
            }
            continue;
        }

        newClassBlocks.push({
            startTime: minutesToTime(currentTime),
            endTime: minutesToTime(newEndTime),
        });

        currentTime = newEndTime;
    }
    
    replaceClassBlocks(newClassBlocks);
     toast({
        title: "Grade Gerada",
        description: "Os blocos de aula foram calculados com base nas suas configurações.",
    });
  };


  useEffect(() => {
    async function fetchSettings() {
      if (currentUser?.role !== 'Admin') {
         toast({
          variant: "destructive",
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar esta página.",
        });
        router.push('/dashboard');
        return;
      }
      try {
        const currentSettings = await getSettings();
        if (currentSettings) {
          form.reset(currentSettings);
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Erro',
          description: 'Não foi possível carregar as configurações.',
        });
      } finally {
        setIsLoading(false);
      }
    }

    if (currentUser) {
      fetchSettings();
    }
  }, [currentUser, router, toast, form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    const result = await updateSettingsAction(values);

    if (result.success) {
      toast({
        title: 'Sucesso',
        description: result.message,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: result.message,
      });
    }
  }
  
  if (isLoading && currentUser?.role !== 'Admin') {
    return null; 
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
                 <Skeleton className="h-14 w-full" />
                 <Skeleton className="h-14 w-full" />
            </div>
            <Separator />
             <Skeleton className="h-6 w-1/4 mb-4" />
             <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 flex-1" />
                    <Skeleton className="h-10 w-10" />
                </div>
             </div>
             <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>
    )
  }


  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card>
          <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                  Ajustes para o funcionamento geral da plataforma.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-4">
                  <Button asChild variant="outline" className="w-full justify-between">
                    <Link href="/dashboard/settings/resources">
                      <div className="flex items-center gap-3">
                          <Building className="h-5 w-5 text-primary" />
                          <div>
                              <p className="font-semibold">Gerenciar Recursos</p>
                              <p className="text-sm text-muted-foreground">Adicione, edite ou remova salas e equipamentos.</p>
                          </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </Link>
                  </Button>
              </div>
          </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Configurações Avançadas</CardTitle>
          <CardDescription>
            Defina a grade de horários, tags de recursos e outras regras da instituição.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">Geral</TabsTrigger>
                  <TabsTrigger value="tags">Tags</TabsTrigger>
                  <TabsTrigger value="breaks">Intervalos</TabsTrigger>
                  <TabsTrigger value="blocks">Aulas</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <div className="space-y-8">
                         <div>
                            <h3 className="text-lg font-medium mb-4">Regras Gerais</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Início do Expediente</FormLabel>
                                    <FormControl>
                                    <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fim do Expediente</FormLabel>
                                    <FormControl>
                                    <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="classBlockMinutes"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duração da Aula (min)</FormLabel>
                                    <FormControl>
                                    <Input 
                                        type="number" 
                                        {...field}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            </div>
                        </div>

                        <Separator />
                        
                        <div>
                            <h3 className="text-lg font-medium mb-4">Dias de Funcionamento</h3>
                            <FormField
                            control={form.control}
                            name="operatingDays"
                            render={() => (
                                <FormItem>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {daysOfWeek.map((day) => (
                                    <FormField
                                        key={day.id}
                                        control={form.control}
                                        name="operatingDays"
                                        render={({ field }) => {
                                        return (
                                            <FormItem
                                            key={day.id}
                                            className="flex flex-row items-start space-x-3 space-y-0"
                                            >
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value?.includes(day.id)}
                                                onCheckedChange={(checked) => {
                                                    return checked
                                                    ? field.onChange([...(field.value || []), day.id])
                                                    : field.onChange(
                                                        (field.value || [])?.filter(
                                                            (value) => value !== day.id
                                                        )
                                                        )
                                                }}
                                                />
                                            </FormControl>
                                            <FormLabel className="font-normal">
                                                {day.label}
                                            </FormLabel>
                                            </FormItem>
                                        )
                                        }}
                                    />
                                    ))}
                                </div>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="tags" className="mt-6">
                     <div>
                        <h3 className="text-lg font-medium mb-4">Tags de Recursos</h3>
                        <div className="flex items-center gap-2 mb-4">
                            <Input
                                placeholder="Nova tag (ex: Auditório)"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag();
                                    }
                                }}
                            />
                            <Button type="button" onClick={handleAddTag}>
                                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {tagFields.map((field, index) => (
                              <Badge key={field.id} variant="secondary" className="text-base py-1 pl-3 pr-1">
                                  {/* @ts-ignore */}
                                  {field.value || field}
                                  <button 
                                      type="button" 
                                      onClick={() => removeTag(index)} 
                                      className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                                  >
                                      <X className="h-3 w-3" />
                                  </button>
                              </Badge>
                          ))}
                          {tagFields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4 w-full">Nenhuma tag definida.</p>
                          )}
                        </div>
                     </div>
                </TabsContent>

                <TabsContent value="breaks" className="mt-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Intervalos</h3>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendBreak({ startTime: '', endTime: '' })}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Intervalo
                        </Button>
                        </div>
                        <div className="space-y-4">
                        {breakFields.map((field, index) => (
                            <div
                            key={field.id}
                            className="flex items-center gap-4 p-4 border rounded-lg"
                            >
                            <FormField
                                control={form.control}
                                name={`breaks.${index}.startTime`}
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Início do Intervalo</FormLabel>
                                    <FormControl>
                                    <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`breaks.${index}.endTime`}
                                render={({ field }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Fim do Intervalo</FormLabel>
                                    <FormControl>
                                    <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-6 text-destructive hover:text-destructive"
                                onClick={() => removeBreak(index)}
                            >
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Remover Intervalo</span>
                            </Button>
                            </div>
                        ))}
                        {breakFields.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">Nenhum intervalo definido.</p>
                        )}
                        </div>
                    </div>
                </TabsContent>
                
                <TabsContent value="blocks" className="mt-6">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium">Blocos de Aula</h3>
                        <Button
                            type="button"
                            onClick={handleGenerateClassBlocks}
                        >
                            <Wand2 className="mr-2 h-4 w-4" />
                            Gerar Grade
                        </Button>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                        Clique em "Gerar Grade" para preencher os blocos de aula com base nas regras acima. Você pode adicionar, remover ou editar os blocos manualmente após a geração.
                        </p>
                        <div className="space-y-4">
                        {classBlockFields.map((field, index) => (
                            <div
                            key={field.id}
                            className="flex items-center gap-4 p-4 border rounded-lg bg-muted/40"
                            >
                            <FormField
                                control={form.control}
                                name={`classBlocks.${index}.startTime`}
                                render={({ field: formField }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Início da Aula</FormLabel>
                                    <FormControl>
                                    <Input 
                                        type="time" 
                                        {...formField}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`classBlocks.${index}.endTime`}
                                render={({ field: formField }) => (
                                <FormItem className="flex-1">
                                    <FormLabel>Fim da Aula</FormLabel>
                                    <FormControl>
                                    <Input
                                        type="time"
                                        {...formField}
                                    />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-6 text-destructive hover:text-destructive"
                                onClick={() => removeClassBlock(index)}
                            >
                                <Trash2 className="h-5 w-5" />
                                <span className="sr-only">Remover Bloco</span>
                            </Button>
                            </div>
                        ))}
                        {classBlockFields.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">A grade de horários está vazia.</p>
                                <p className="text-sm text-muted-foreground">Defina suas regras e clique em "Gerar Grade".</p>
                            </div>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => appendClassBlock({ startTime: '', endTime: '' })}
                            className="mt-4"
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Bloco Manualmente
                        </Button>
                        </div>
                    </div>
                </TabsContent>
              </Tabs>
              
              <Separator className="mt-8"/>
              
              <Button type="submit" size="lg">Salvar Configurações</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

    
