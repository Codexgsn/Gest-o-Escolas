
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { updateResourceAction } from "@/app/actions/resources"
import type { Resource } from "@/lib/definitions"

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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"


const formSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  type: z.string().min(3, { message: "O tipo deve ter pelo menos 3 caracteres." }),
  location: z.string().min(3, { message: "A localização deve ter pelo menos 3 caracteres." }),
  capacity: z.coerce.number().min(1, { message: "A capacidade deve ser de pelo menos 1." }),
  equipment: z.string().optional(),
  imageUrl: z.string().url({ message: "Por favor, insira uma URL de imagem válida." }),
  tags: z.array(z.string()).default([]),
});

interface EditResourceFormProps {
    resource: Resource;
    availableTags: string[];
}

export function EditResourceForm({ resource, availableTags }: EditResourceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const currentUserId = 'simulated-admin-id';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resource.name || "",
      type: resource.type || "",
      location: resource.location || "",
      capacity: resource.capacity || 1,
      // The equipment array is joined back into a comma-separated string for the textarea.
      equipment: Array.isArray(resource.equipment) ? resource.equipment.join(', ') : "",
      imageUrl: resource.imageUrl || "",
      tags: resource.tags || [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // We need to include the resource ID in the data passed to the action.
    const resourceDataWithId = { ...values, id: resource.id };

    const result = await updateResourceAction(resourceDataWithId, currentUserId);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message || "Recurso atualizado com sucesso!",
      })
      router.push("/dashboard/resources") // Redirect to the resources list
      router.refresh(); // Force a refresh to ensure the list is up-to-date
    } else {
      toast({
        variant: "destructive",
        title: "Erro ao Atualizar Recurso",
        description: result.message || "Ocorreu um erro desconhecido.",
      })
    }
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Nome do Recurso</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Tipo de Recurso</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                     <FormDescription>
                        Agrupe recursos por tipo, como 'Sala de Aula', 'Laboratório', 'Equipamento'.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Localização</FormLabel>
                    <FormControl>
                    <Input {...field} />
                    </FormControl>
                    <FormDescription>
                        Onde o recurso pode ser encontrado ou retirado.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Capacidade / Quantidade</FormLabel>
                    <FormControl>
                    <Input type="number" {...field} />
                    </FormControl>
                     <FormDescription>
                        Para salas: número de pessoas. Para objetos: a quantidade disponível.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="equipment"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Itens Incluídos (separados por vírgula)</FormLabel>
                    <FormControl>
                    <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>URL da Imagem</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                     <FormDescription>
                        Cole a URL de uma imagem representativa.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}\n                />

                {availableTags.length > 0 && (
                    <FormField
                    control={form.control}
                    name="tags"
                    render={() => (
                        <FormItem>
                        <div className="mb-4">
                            <FormLabel className="text-base">Tags</FormLabel>
                            <FormDescription>
                            Selecione as tags que descrevem este recurso.
                            </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {availableTags.map((tag) => (
                            <FormField
                                key={tag}
                                control={form.control}
                                name="tags"
                                render={({ field }) => {
                                return (
                                    <FormItem
                                    key={tag}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                    <FormControl>
                                        <Checkbox
                                        checked={field.value?.includes(tag)}
                                        onCheckedChange={(checked) => {
                                            return checked
                                            ? field.onChange([...field.value, tag])
                                            : field.onChange(
                                                field.value?.filter(
                                                (value) => value !== tag
                                                )
                                            )
                                        }}
                                        />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                        {tag}
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
                )}

            <Button type="submit">Salvar Alterações</Button>
        </form>
    </Form>
  )
}
