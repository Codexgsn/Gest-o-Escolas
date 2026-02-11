
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
import {
  getSettings,
  updateSettingsAction,
  type SchoolSettings,
} from '@/app/actions/settings';
import { Trash2, PlusCircle, Wand2, Tag, X, GripVertical } from 'lucide-react';
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


/**
 * Componente para exibição e edição de um bloco de aula, com suporte a drag-and-drop.
 */
function ClassBlockItem({
  field,
  index,
  form,
  removeClassBlock,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragOver,
  isDragging,
}: {
  field: any;
  index: number;
  form: any;
  removeClassBlock: (index: number) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragOver: boolean;
  isDragging: boolean;
}) {
  const itemRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={itemRef}
      draggable
      onDragStart={(e) => {
        if (itemRef.current) {
          const clone = itemRef.current.cloneNode(true) as HTMLElement;
          clone.style.position = 'absolute';
          clone.style.top = '-9999px';
          clone.style.left = '-9999px';
          clone.style.width = `${itemRef.current.offsetWidth}px`;
          clone.style.opacity = '1';
          clone.style.backgroundColor = 'hsl(var(--card))';
          clone.style.borderRadius = '0.5rem';
          clone.style.border = '2px solid hsl(var(--primary))';
          clone.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
          clone.style.transform = 'scale(1.02)';
          document.body.appendChild(clone);
          e.dataTransfer.setDragImage(clone, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
          requestAnimationFrame(() => document.body.removeChild(clone));
        }
        onDragStart(e, index);
      }}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      onDrop={(e) => onDrop(e, index)}
      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg bg-card shadow-sm hover:border-primary/50 relative transition-all duration-200 ${
        isDragOver ? 'border-primary border-2 bg-primary/5' : ''
      } ${isDragging ? 'opacity-40 border-dashed' : ''}`}
    >
      <div
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-primary transition-colors flex items-center justify-center h-8 sm:h-12 w-full sm:w-10 sm:-ml-2 order-first sm:order-none"
      >
        <GripVertical className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>

      <div className="flex-1 flex flex-col gap-2 sm:gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            Bloco {index + 1}
          </Badge>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <FormField
            control={form.control}
            name={`classBlocks.${index}.startTime`}
            render={({ field: formField }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-xs">Início</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...formField}
                    className="bg-background h-9"
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
                <FormLabel className="text-xs">Fim</FormLabel>
                <FormControl>
                  <Input
                    type="time"
                    {...formField}
                    className="bg-background h-9"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive hover:bg-destructive/10 self-end sm:self-start sm:mt-8"
        onClick={() => removeClassBlock(index)}
      >
        <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
        <span className="sr-only">Remover Bloco</span>
      </Button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [newTag, setNewTag] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const scrollIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

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

  const handleDragStart = (_e: React.DragEvent, index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);

    // Auto-scroll quando próximo das bordas
    const scrollThreshold = 100;
    const scrollSpeed = 10;
    const mouseY = e.clientY;
    const windowHeight = window.innerHeight;

    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }

    if (mouseY < scrollThreshold) {
      // Scroll para cima
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy({ top: -scrollSpeed, behavior: 'auto' });
      }, 16);
    } else if (mouseY > windowHeight - scrollThreshold) {
      // Scroll para baixo
      scrollIntervalRef.current = setInterval(() => {
        window.scrollBy({ top: scrollSpeed, behavior: 'auto' });
      }, 16);
    }
  };

  const handleDragEnd = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === toIndex) {
      handleDragEnd();
      return;
    }
    const blocks = form.getValues('classBlocks') as { startTime: string; endTime: string }[];
    const newBlocks = [...blocks];
    const [movedBlock] = newBlocks.splice(dragIndex, 1);
    newBlocks.splice(toIndex, 0, movedBlock);
    replaceClassBlocks(newBlocks);
    handleDragEnd();
  };

  const resourceTags = form.watch('resourceTags') || [];

  const handleAddTag = () => {
    if (newTag && !resourceTags.includes(newTag)) {
      form.setValue('resourceTags', [...resourceTags, newTag]);
      setNewTag('');
      toast({
        title: "Tag adicionada",
        description: `A tag "${newTag}" foi adicionada.`,
      });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    form.setValue('resourceTags', resourceTags.filter(tag => tag !== tagToRemove));
    toast({
      title: "Tag removida",
      description: `A tag "${tagToRemove}" foi removida.`,
    });
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
          if (breakStart > currentTime) {
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
      description: `${newClassBlocks.length} blocos de aula foram gerados com sucesso.`,
    });
  };


  useEffect(() => {
    async function fetchSettings() {
      try {
        const currentSettings = await getSettings();
        if (currentSettings) {
          form.reset(currentSettings);
        }
      } catch (error) {
        console.error('Erro ao carregar as configurações.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [form]);

  async function onSubmit(values: z.infer<typeof settingsSchema>) {
    const result = await updateSettingsAction(values);

    if (result.success) {
      toast({
        title: "Configurações salvas",
        description: result.message,
      });
    } else {
      toast({
        title: "Erro ao salvar",
        description: result.message,
        variant: "destructive",
      });
    }
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
    <div className="max-w-4xl mx-auto space-y-4 md:space-y-8 px-4 md:px-0">

      <Card>
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="text-xl md:text-2xl">Configurações Avançadas</CardTitle>
          <CardDescription className="text-sm md:text-base">
            Defina a grade de horários, tags de recursos e outras regras da instituição.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:space-y-8">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                  <TabsTrigger value="general" className="text-xs sm:text-sm py-2">Geral</TabsTrigger>
                  <TabsTrigger value="tags" className="text-xs sm:text-sm py-2">Tags</TabsTrigger>
                  <TabsTrigger value="breaks" className="text-xs sm:text-sm py-2">Intervalos</TabsTrigger>
                  <TabsTrigger value="blocks" className="text-xs sm:text-sm py-2">Aulas</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-4 md:mt-6">
                  <div className="space-y-6 md:space-y-8">
                    <div>
                      <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Regras Gerais</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 items-end">
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
                      <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Dias de Funcionamento</h3>
                      <FormField
                        control={form.control}
                        name="operatingDays"
                        render={() => (
                          <FormItem>
                            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
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

                <TabsContent value="tags" className="mt-4 md:mt-6">
                  <div>
                    <h3 className="text-base md:text-lg font-medium mb-3 md:mb-4">Tags de Recursos</h3>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
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
                        className="flex-1"
                      />
                      <Button type="button" onClick={handleAddTag} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {resourceTags.map((tag, index) => (
                        <Badge key={`${tag}-${index}`} variant="secondary" className="text-base py-1 pl-3 pr-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      {resourceTags.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4 w-full">Nenhuma tag definida.</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="breaks" className="mt-4 md:mt-6">
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-base md:text-lg font-medium">Intervalos</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendBreak({ startTime: '', endTime: '' })}
                        className="w-full sm:w-auto"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Intervalo
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {breakFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 border rounded-lg"
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
                            className="sm:mt-6 text-destructive hover:text-destructive self-end sm:self-auto"
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

                <TabsContent value="blocks" className="mt-4 md:mt-6">
                  <div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                      <h3 className="text-base md:text-lg font-medium">Blocos de Aula</h3>
                      <Button
                        type="button"
                        onClick={handleGenerateClassBlocks}
                        className="w-full sm:w-auto"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        Gerar Grade
                      </Button>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                      Clique em "Gerar Grade" para preencher os blocos de aula com base nas regras acima. Você pode adicionar, remover ou editar os blocos manualmente após a geração.
                    </p>
                    <div className="space-y-4 md:space-y-6 pt-2">
                      <div className="space-y-4">
                        {classBlockFields.map((field, index) => (
                          <ClassBlockItem
                            key={field.id}
                            field={field}
                            index={index}
                            form={form}
                            removeClassBlock={removeClassBlock}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            onDrop={handleDrop}
                            isDragOver={dragOverIndex === index && dragIndex !== index}
                            isDragging={dragIndex === index}
                          />
                        ))}
                      </div>
                      {(form.watch('classBlocks')?.length || 0) === 0 && (
                        <div className="text-center py-6 md:py-8 border-2 border-dashed rounded-lg">
                          <p className="text-sm md:text-base text-muted-foreground">A grade de horários está vazia.</p>
                          <p className="text-xs md:text-sm text-muted-foreground mt-1">Defina suas regras e clique em "Gerar Grade".</p>
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendClassBlock({ startTime: '', endTime: '' })}
                        className="mt-4 w-full sm:w-auto"
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Adicionar Bloco Manualmente
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="mt-6 md:mt-8" />

              <Button type="submit" size="lg" className="w-full sm:w-auto">Salvar Configurações</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
