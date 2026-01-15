
'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter, useParams } from "next/navigation"
import React, { useEffect, useState } from "react"

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
import { useToast } from "@/hooks/use-toast"
import { updateUserAction, updateUserPasswordAction } from "@/app/actions/users"
import { getUserById as getUserByIdAction } from "@/app/actions/data"
import type { User } from "@/lib/data"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/hooks/use-auth"
import { Separator } from "@/components/ui/separator"

const profileFormSchema = z.object({
  name: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  role: z.enum(["Admin", "Usuário"], { required_error: "Por favor, selecione uma função." }),
  avatar: z.string().url({ message: "Por favor, insira uma URL válida." }).optional().or(z.literal("")),
});

const passwordFormSchema = z.object({
    password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
});


export default function EditUserPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [user, setUser] = useState<User | null>(null);
  const { currentUser } = useAuth();
  
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;
  const currentUserId = currentUser?.id ?? null;

  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Usuário",
      avatar: "",
    },
  })

  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
        password: "",
        confirmPassword: "",
    },
  });

  useEffect(() => {
    async function loadUser() {
        if (userId) {
            try {
                const foundUser = await getUserByIdAction(userId as string);
                if (foundUser) {
                    setUser(foundUser)
                    profileForm.reset({
                    name: foundUser.name,
                    email: foundUser.email,
                    role: foundUser.role,
                    avatar: foundUser.avatar,
                    })
                } else {
                    toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Usuário não encontrado.",
                    })
                    router.push("/dashboard/users")
                }
            } catch (error) {
                 toast({
                    variant: "destructive",
                    title: "Erro",
                    description: "Falha ao carregar dados do usuário.",
                })
            }
        }
    }
    loadUser();
  }, [userId, router, toast, profileForm])


  async function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (!userId || !currentUser) return;

    if (currentUser.role !== 'Admin') {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: "Você não tem permissão para editar usuários.",
      });
      return;
    }

    const result = await updateUserAction({ id: userId, ...values }, currentUserId)

    if (result.success) {
      toast({
        title: "Sucesso",
        description: result.message,
      })
      router.push("/dashboard/users")
    } else {
      toast({
        variant: "destructive",
        title: "Erro",
        description: result.message,
      })
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
      if (!userId || !currentUserId) return;

      const result = await updateUserPasswordAction({
          userIdToUpdate: userId,
          newPassword: values.password,
          currentUserId: currentUserId,
      });

      if (result.success) {
          toast({
              title: "Sucesso",
              description: result.message,
          });
          passwordForm.reset();
      } else {
          toast({
              variant: "destructive",
              title: "Erro",
              description: result.message,
          });
      }
  }

  const canEditProfile = currentUser?.role === 'Admin';
  const canEditPassword = user && currentUser && (
      (currentUser.role === 'Admin' && user.role !== 'Admin') || // Admin can edit non-admins
      (currentUser.id === user.id) // User can edit their own password
  );

  if (!user) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-8 mt-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
            </div>
             <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Editar Perfil do Usuário</CardTitle>
                <CardDescription>
                Atualize os detalhes do usuário abaixo. Apenas administradores podem alterar estas informações.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-8">
                    <FormField
                    control={profileForm.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Nome Completo</FormLabel>
                        <FormControl>
                            <Input placeholder="Ex: João da Silva" {...field} disabled={!canEditProfile} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={profileForm.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="Ex: joao.silva@example.com" {...field} disabled={!canEditProfile} />
                        </FormControl>
                        <FormDescription>
                            O usuário usará este email para fazer login.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={profileForm.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Função</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} disabled={!canEditProfile}>
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
                    control={profileForm.control}
                    name="avatar"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>URL da Imagem do Avatar</FormLabel>
                        <FormControl>
                            <Input placeholder="https://example.com/avatar.png" {...field} disabled={!canEditProfile} />
                        </FormControl>
                        <FormDescription>
                            Cole a URL de uma imagem para o perfil do usuário.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    {canEditProfile && <Button type="submit">Salvar Alterações do Perfil</Button>}
                </form>
                </Form>
            </CardContent>
        </Card>

        {canEditPassword && (
            <Card>
                <CardHeader>
                    <CardTitle>Alterar Senha</CardTitle>
                    <CardDescription>
                        {currentUser?.id === user.id 
                            ? "Crie uma nova senha segura para sua conta."
                            : `Crie uma nova senha para ${user.name}.`}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-8">
                             <FormField
                                control={passwordForm.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Nova Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Confirmar Nova Senha</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit">Alterar Senha</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        )}
    </div>
  )
}
