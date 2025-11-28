"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function SobreNosotrosPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Sobre EduPlus</h1>
      
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestra Misión</h2>
            <p className="text-gray-600 mb-4">
              En EduPlus, nos dedicamos a transformar la educación a través de la tecnología, 
              haciendo que el aprendizaje sea accesible, interactivo y efectivo para todos. 
              Nuestra plataforma combina la mejor tecnología educativa con contenido de alta 
              calidad para crear una experiencia de aprendizaje única.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestra Visión</h2>
            <p className="text-gray-600 mb-4">
              Aspiramos a ser la plataforma líder en educación online, reconocida por nuestra 
              innovación, calidad y compromiso con el éxito de nuestros estudiantes. Buscamos 
              crear un mundo donde la educación de calidad esté al alcance de todos, sin importar 
              su ubicación o circunstancias.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestros Valores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Excelencia</h3>
                <p className="text-gray-600">
                  Nos comprometemos a ofrecer la más alta calidad en nuestros cursos y servicios.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Innovación</h3>
                <p className="text-gray-600">
                  Constantemente buscamos nuevas formas de mejorar la experiencia de aprendizaje.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Accesibilidad</h3>
                <p className="text-gray-600">
                  Creemos que la educación debe ser accesible para todos, en cualquier momento y lugar.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Comunidad</h3>
                <p className="text-gray-600">
                  Fomentamos un ambiente de colaboración y apoyo mutuo entre estudiantes e instructores.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Nuestro Equipo</h2>
            <p className="text-gray-600 mb-4">
              Contamos con un equipo apasionado de educadores, desarrolladores y profesionales 
              dedicados a crear la mejor experiencia de aprendizaje posible. Nuestros instructores 
              son expertos en sus campos, con años de experiencia tanto en la industria como en la enseñanza.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 