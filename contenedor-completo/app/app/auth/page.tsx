"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"
import { Header } from "@/components/Header"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get("register") ? "registro" : "login"
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [nombre, setNombre] = useState("")
  const [apellido, setApellido] = useState("")
  const router = useRouter()
  const { signIn, signUp, emailVerified, resendVerification, user } = useAuth()
  const [showVerifyNotice, setShowVerifyNotice] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      await signIn(email, password)
      if (user && !user.emailVerified) {
        setShowVerifyNotice(true)
        return
      }
      router.push("/")
    } catch (error) {
      setError("Credenciales incorrectas")
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar contraseña
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una letra mayúscula y un número")
      return
    }

    try {
      await signUp(email, password, nombre, apellido)
      router.push("/")
    } catch (error: any) {
      setError(error.message || "Error al crear la cuenta")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header showBackButton={true} />

      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-sm">
          {showVerifyNotice && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
              <p>Debes verificar tu correo electrónico antes de continuar.</p>
              <button
                className="mt-2 underline text-emerald-700"
                onClick={async () => { await resendVerification(); alert('Correo de verificación reenviado.'); }}
              >
                Reenviar correo de verificación
              </button>
            </div>
          )}
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="registro">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Bienvenido de nuevo</h1>
                  <p className="text-gray-600 mt-1">Inicia sesión para continuar aprendiendo</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Correo electrónico</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="tu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-login">Contraseña</Label>
                      <Link href="#" className="text-xs text-emerald-600 hover:underline">
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>
                    <div className="relative">
                      <Input
                        id="password-login"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Iniciar sesión
                  </Button>
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </div>
              </form>
            </TabsContent>
            <TabsContent value="registro">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="text-center mb-6">
                  <h1 className="text-2xl font-bold">Crea tu cuenta</h1>
                  <p className="text-gray-600 mt-1">Únete a nuestra comunidad de aprendizaje</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">Nombre</Label>
                      <Input 
                        id="first-name" 
                        placeholder="Juan" 
                        value={nombre}
                        onChange={e => setNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Apellido</Label>
                      <Input 
                        id="last-name" 
                        placeholder="Pérez" 
                        value={apellido}
                        onChange={e => setApellido(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-register">Correo electrónico</Label>
                    <Input 
                      id="email-register" 
                      type="email" 
                      placeholder="tu@email.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-register">Contraseña</Label>
                    <div className="relative">
                      <Input 
                        id="password-register" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••••" 
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Mínimo 8 caracteres, incluyendo una letra mayúscula y un número
                    </p>
                  </div>
                  <div className="flex items-start space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4 mt-1"
                      required
                    />
                    <Label htmlFor="terms" className="font-normal text-sm">
                      Acepto los{" "}
                      <Link href="/terminos-privacidad" className="text-emerald-600 hover:underline">
                        Términos de servicio
                      </Link>{" "}
                      y la{" "}
                      <Link href="/terminos-privacidad" className="text-emerald-600 hover:underline">
                        Política de privacidad
                      </Link>
                    </Label>
                  </div>
                  <Button type="submit" className="w-full">Crear cuenta</Button>
                  {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
