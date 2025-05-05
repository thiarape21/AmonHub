'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface FodaItem {
  id: string;
  text: string;
  isEditing: boolean;
}

export default function AnalisisFodaPage() {
  const [fortalezas, setFortalezas] = useState<FodaItem[]>([]);
  const [oportunidades, setOportunidades] = useState<FodaItem[]>([]);
  const [debilidades, setDebilidades] = useState<FodaItem[]>([]);
  const [amenazas, setAmenazas] = useState<FodaItem[]>([]);
  const [nuevaFortaleza, setNuevaFortaleza] = useState("");
  const [nuevaOportunidad, setNuevaOportunidad] = useState("");
  const [nuevaDebilidad, setNuevaDebilidad] = useState("");
  const [nuevaAmenaza, setNuevaAmenaza] = useState("");

  const handleAddFortaleza = () => {
    if (nuevaFortaleza.trim()) {
      setFortalezas([
        ...fortalezas,
        { id: Date.now().toString(), text: nuevaFortaleza.trim(), isEditing: false }
      ]);
      setNuevaFortaleza("");
    }
  };

  const handleAddOportunidad = () => {
    if (nuevaOportunidad.trim()) {
      setOportunidades([
        ...oportunidades,
        { id: Date.now().toString(), text: nuevaOportunidad.trim(), isEditing: false }
      ]);
      setNuevaOportunidad("");
    }
  };

  const handleAddDebilidad = () => {
    if (nuevaDebilidad.trim()) {
      setDebilidades([
        ...debilidades,
        { id: Date.now().toString(), text: nuevaDebilidad.trim(), isEditing: false }
      ]);
      setNuevaDebilidad("");
    }
  };

  const handleAddAmenaza = () => {
    if (nuevaAmenaza.trim()) {
      setAmenazas([
        ...amenazas,
        { id: Date.now().toString(), text: nuevaAmenaza.trim(), isEditing: false }
      ]);
      setNuevaAmenaza("");
    }
  };

  const handleEdit = (section: string, id: string) => {
    switch (section) {
      case 'fortalezas':
        setFortalezas(fortalezas.map(item => 
          item.id === id ? { ...item, isEditing: true } : item
        ));
        break;
      case 'oportunidades':
        setOportunidades(oportunidades.map(item => 
          item.id === id ? { ...item, isEditing: true } : item
        ));
        break;
      case 'debilidades':
        setDebilidades(debilidades.map(item => 
          item.id === id ? { ...item, isEditing: true } : item
        ));
        break;
      case 'amenazas':
        setAmenazas(amenazas.map(item => 
          item.id === id ? { ...item, isEditing: true } : item
        ));
        break;
    }
  };

  const handleSave = (section: string, id: string, newText: string) => {
    switch (section) {
      case 'fortalezas':
        setFortalezas(fortalezas.map(item => 
          item.id === id ? { ...item, text: newText, isEditing: false } : item
        ));
        break;
      case 'oportunidades':
        setOportunidades(oportunidades.map(item => 
          item.id === id ? { ...item, text: newText, isEditing: false } : item
        ));
        break;
      case 'debilidades':
        setDebilidades(debilidades.map(item => 
          item.id === id ? { ...item, text: newText, isEditing: false } : item
        ));
        break;
      case 'amenazas':
        setAmenazas(amenazas.map(item => 
          item.id === id ? { ...item, text: newText, isEditing: false } : item
        ));
        break;
    }
  };

  const handleDelete = (section: string, id: string) => {
    switch (section) {
      case 'fortalezas':
        setFortalezas(fortalezas.filter(item => item.id !== id));
        break;
      case 'oportunidades':
        setOportunidades(oportunidades.filter(item => item.id !== id));
        break;
      case 'debilidades':
        setDebilidades(debilidades.filter(item => item.id !== id));
        break;
      case 'amenazas':
        setAmenazas(amenazas.filter(item => item.id !== id));
        break;
    }
  };

  const renderItem = (item: FodaItem, section: string) => {
    if (item.isEditing) {
      return (
        <div className="flex gap-2 items-center">
          <Input
            defaultValue={item.text}
            onBlur={(e) => handleSave(section, item.id, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSave(section, item.id, e.currentTarget.value);
              }
            }}
            autoFocus
            className="bg-white"
          />
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
        <span>{item.text}</span>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleEdit(section, item.id)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(section, item.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Análisis FODA</h1>
      
      <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
        <Card className="p-6 bg-green-50">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Fortalezas</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="fortaleza" className="text-green-700">Nueva fortaleza</Label>
              <Input 
                id="fortaleza" 
                placeholder="Agregar fortaleza" 
                value={nuevaFortaleza}
                onChange={(e) => setNuevaFortaleza(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAddFortaleza} className="bg-green-600 hover:bg-green-700">Agregar</Button>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-green-700">Fortalezas agregadas:</h3>
              <ul className="space-y-2">
                {fortalezas.map((item) => (
                  <li key={item.id}>
                    {renderItem(item, 'fortalezas')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">Oportunidades</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="oportunidad" className="text-blue-700">Nueva oportunidad</Label>
              <Input 
                id="oportunidad" 
                placeholder="Agregar oportunidad" 
                value={nuevaOportunidad}
                onChange={(e) => setNuevaOportunidad(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAddOportunidad} className="bg-blue-600 hover:bg-blue-700">Agregar</Button>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-blue-700">Oportunidades agregadas:</h3>
              <ul className="space-y-2">
                {oportunidades.map((item) => (
                  <li key={item.id}>
                    {renderItem(item, 'oportunidades')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-orange-50">
          <h2 className="text-xl font-semibold mb-4 text-orange-800">Debilidades</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="debilidad" className="text-orange-700">Nueva debilidad</Label>
              <Input 
                id="debilidad" 
                placeholder="Agregar debilidad" 
                value={nuevaDebilidad}
                onChange={(e) => setNuevaDebilidad(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAddDebilidad} className="bg-orange-600 hover:bg-orange-700">Agregar</Button>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-orange-700">Debilidades agregadas:</h3>
              <ul className="space-y-2">
                {debilidades.map((item) => (
                  <li key={item.id}>
                    {renderItem(item, 'debilidades')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-red-50">
          <h2 className="text-xl font-semibold mb-4 text-red-800">Amenazas</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="amenaza" className="text-red-700">Nueva amenaza</Label>
              <Input 
                id="amenaza" 
                placeholder="Agregar amenaza" 
                value={nuevaAmenaza}
                onChange={(e) => setNuevaAmenaza(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button onClick={handleAddAmenaza} className="bg-red-600 hover:bg-red-700">Agregar</Button>
            
            <div className="mt-4">
              <h3 className="font-medium mb-2 text-red-700">Amenazas agregadas:</h3>
              <ul className="space-y-2">
                {amenazas.map((item) => (
                  <li key={item.id}>
                    {renderItem(item, 'amenazas')}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}