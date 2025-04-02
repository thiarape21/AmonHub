import Image from "next/image";

export default function InicioPage() {
  return (
    <div className="relative h-[calc(100vh-64px)]">
      {/* Background image with overlay */}
      <Image
        src="/hero.png"
        alt="hero"
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/30" />
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4">
        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-light tracking-wide">Asociación</h2>
            <h1 className="text-7xl font-extralight tracking-wider">
              BARRIO AMÓN
            </h1>
          </div>
          <div className="space-y-1">
            <h3 className="text-2xl font-light tracking-wide">AmónHub:</h3>
            <p className="text-xl font-light tracking-wide">
              Gestiona, Planifica y Transforma
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
