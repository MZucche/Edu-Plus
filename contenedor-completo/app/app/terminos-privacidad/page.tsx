"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function TerminosPrivacidadPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Términos y Privacidad</h1>

      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Términos de Servicio</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Al acceder y utilizar EduPlus, aceptas estar sujeto a estos términos de servicio. 
                Por favor, léelos cuidadosamente antes de utilizar nuestra plataforma.
              </p>
              <h3 className="text-lg font-medium text-gray-900">1. Uso del Servicio</h3>
              <p>
                EduPlus proporciona una plataforma educativa en línea. Al registrarte, aceptas 
                proporcionar información precisa y mantener la confidencialidad de tu cuenta.
              </p>
              <h3 className="text-lg font-medium text-gray-900">2. Contenido del Curso</h3>
              <p>
                Todo el contenido proporcionado en nuestros cursos está protegido por derechos 
                de autor. No está permitida la reproducción o distribución sin autorización.
              </p>
              <h3 className="text-lg font-medium text-gray-900">3. Pagos y Reembolsos</h3>
              <p>
                Los pagos son procesados de manera segura. Ofrecemos reembolsos dentro de los 
                primeros 30 días si no estás satisfecho con el curso.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Política de Privacidad</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                En EduPlus, nos tomamos muy en serio la privacidad de nuestros usuarios. 
                Esta política describe cómo recopilamos, usamos y protegemos tu información.
              </p>
              <h3 className="text-lg font-medium text-gray-900">1. Información que Recopilamos</h3>
              <p>
                Recopilamos información que nos proporcionas directamente, como nombre, 
                dirección de correo electrónico y datos de pago. También recopilamos 
                información sobre tu uso de la plataforma.
              </p>
              <h3 className="text-lg font-medium text-gray-900">2. Uso de la Información</h3>
              <p>
                Utilizamos tu información para proporcionar y mejorar nuestros servicios, 
                procesar pagos y comunicarnos contigo sobre tu cuenta y nuestros servicios.
              </p>
              <h3 className="text-lg font-medium text-gray-900">3. Protección de Datos</h3>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas para proteger 
                tu información personal contra acceso no autorizado o pérdida.
              </p>
              <h3 className="text-lg font-medium text-gray-900">4. Tus Derechos</h3>
              <p>
                Tienes derecho a acceder, corregir o eliminar tu información personal. 
                También puedes solicitar una copia de tus datos o retirar tu consentimiento 
                en cualquier momento.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Cookies y Tecnologías Similares</h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Utilizamos cookies y tecnologías similares para mejorar tu experiencia en 
                nuestra plataforma. Estas tecnologías nos ayudan a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mantener tu sesión activa</li>
                <li>Recordar tus preferencias</li>
                <li>Analizar el uso de la plataforma</li>
                <li>Mejorar nuestros servicios</li>
              </ul>
              <p>
                Puedes controlar el uso de cookies a través de la configuración de tu navegador.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 