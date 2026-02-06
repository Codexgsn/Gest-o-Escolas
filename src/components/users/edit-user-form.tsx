
'use client'

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { updateUserAction } from "@/app/actions/users"
import type { User } from "@/lib/definitions"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  role: z.enum(["Admin", "Usuário"], { required_error: "Por favor, selecione uma função." }),
  avatar: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal("")),
});

export function EditUserForm({ user }: { user: User }) {
  const router = useRouter();
  const { toast } = useToast();

  const currentUserId = '00000000-0000-0000-0000-000000000000'; // Placeholder UUID

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      role: (user.role as "Admin" | "Usuário") || "Usuário",
      avatar: user.avatar || "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const result = await updateUserAction({ id: user.id, ...values }, currentUserId);

    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message,
      });
      router.push("/dashboard/users");
      router.refresh();
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message,
      });
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Editar Perfil do Usuário</CardTitle>
        <CardDescription>
          Atualize os detalhes do usuário abaixo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Ex: joao.silva@example.com" {...field} />
                  </FormControl>
                  <FormDescription>
                    O usuário usará este email para fazer login.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Função</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma função" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Usuário">Usuário</SelectItem>
                      <SelectItem value="Admin">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    O nível de permissão que o usuário terá no sistema.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Imagem do Avatar</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/avatar.png" {...field} />
                  </FormControl>
                  <FormDescription>
                    Cole a URL de uma imagem para o perfil do usuário.
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
  );
}
