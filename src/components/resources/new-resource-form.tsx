
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { createResourceAction } from "@/app/actions/resources"

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

interface NewResourceFormProps {
    availableTags: string[];
    currentUserId: string;
}

export function NewResourceForm({ availableTags, currentUserId }: NewResourceFormProps) {
    const router = useRouter()
    const { toast } = useToast()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "",
            location: "",
            capacity: 10,
            equipment: "",
            imageUrl: "",
            tags: [],
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
                form.setValue("imageUrl", reader.result as string, { shouldValidate: true });
            };
            reader.readAsDataURL(file);
        }
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const result = await createResourceAction(values, currentUserId)

        if (result.success) {
            toast({
                title: "Sucesso",
                description: result.message || "Novo recurso criado com sucesso!",
            })
            router.push("/dashboard/resources") // Redirect to the resources list
            router.refresh() // Ensures the page is re-fetched
        } else {
            toast({
                variant: "destructive",
                title: "Erro ao Criar Recurso",
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
                                <Input placeholder="Ex: Sala de Conferências 2, Projetor Epson 3" {...field} />
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
                                <Input placeholder="Ex: Sala de Conferência, Equipamento Audiovisual" {...field} />
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
                                <Input placeholder="Ex: Prédio B, 3º Andar ou Armário de TI" {...field} />
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
                                Para salas: número de pessoas. Para objetos: a quantidade disponível (geralmente 1).
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
                            <FormLabel>Itens Incluídos / Equipamentos (separados por vírgula)</FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="Ex: Projetor, Quadro Branco, Cabos HDMI"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                Liste os equipamentos disponíveis neste recurso.
                            </FormDescription>
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
                                <Input placeholder="https://exemplo.com/imagem.png" {...field} />
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
                                    <FormLabel className="text-base">Tags do Recurso</FormLabel>
                                    <FormDescription>
                                        Selecione as tags que melhor descrevem este recurso.
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

                <Button type="submit">Adicionar Recurso</Button>
            </form>
        </Form>
    )
}
