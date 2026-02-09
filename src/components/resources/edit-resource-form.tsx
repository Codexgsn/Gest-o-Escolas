
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { updateResourceAction } from "@/app/actions/resources"
import type { Resource } from "@/lib/definitions"
import { ImageCropper } from "./image-cropper"
import { useState } from "react"

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
  imageUrl: z.string().min(1, { message: "A imagem é obrigatória." }),
  tags: z.array(z.string()).default([]),
});

interface EditResourceFormProps {
  resource: Resource;
  availableTags: string[];
  currentUserId: string;
}

export function EditResourceForm({ resource, availableTags, currentUserId }: EditResourceFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [croppingImage, setCroppingImage] = useState<string | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: resource.name || "",
      type: resource.type || "",
      location: resource.location || "",
      capacity: resource.capacity || 1,
      equipment: Array.isArray(resource.equipment) ? resource.equipment.join(', ') : "",
      imageUrl: resource.imageUrl || "",
      tags: resource.tags || [],
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Arquivo muito grande",
          description: "Por favor, selecione uma imagem com menos de 2MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppingImage(reader.result as string);
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    form.setValue("imageUrl", croppedImage, { shouldValidate: true });
    setIsCropperOpen(false);
    setCroppingImage(null);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const resourceDataWithId = { ...values, id: resource.id };

    const result = await updateResourceAction(resourceDataWithId, currentUserId);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message || "Recurso atualizado com sucesso!",
      })
      router.push("/dashboard/resources")
      router.refresh();
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
                Cole a URL de uma imagem ou faça o upload abaixo.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Ou faça upload de uma foto</FormLabel>
          <FormControl>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </FormControl>
          <FormDescription>
            Envie uma imagem do seu dispositivo (máx. 2MB).
          </FormDescription>
        </FormItem>

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

      {croppingImage && (
        <ImageCropper
          image={croppingImage}
          open={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setCroppingImage(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </Form>
  )
}
