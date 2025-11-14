// src/app/send/_components/Step4_Send.js
"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import api from '@/lib/api';
import { format } from 'date-fns';

export default function Step4_Send({ document, signers, config, onBack, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(''); // Estado para a mensagem personalizada
  const [errorMessage, setErrorMessage] = useState('');

  /**
   * Função final que envia todas as configurações e convites para a API.
   */
  const handleSend = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      // 1. Atualiza o documento com as configurações do Passo 3 (data limite e lembretes).
      await api.patch(`/documents/${document.id}`, { 
        deadlineAt: config.deadlineAt,
        autoReminders: config.autoReminders 
      });
      
      // 2. Prepara o payload dos signatários para a API.
      const signersPayload = signers.map(s => {
        let authChannels;
        // Mapeia a escolha do frontend para o formato de array que o backend espera.
        if (s.authMethod === 'Ambos') {
          authChannels = ['WHATSAPP', 'EMAIL'];
        } else if (s.authMethod === 'Whatsapp') {
          authChannels = ['WHATSAPP'];
        } else { // 'E-mail'
          authChannels = ['EMAIL'];
        }
        
        return {
          name: s.name,
          email: s.email,
          phone: s.phone || s.phoneWhatsE164,
          cpf: s.cpf,
          qualification: s.qualification,
          authChannels: authChannels,
        };
      });
      
      // 3. Envia os convites, incluindo a mensagem personalizada.
      await api.post(`/documents/${document.id}/invite`, { 
        signers: signersPayload,
        message: message // Envia o conteúdo do textarea
      });

      // 4. Se tudo deu certo, avança para a tela de sucesso.
      onSuccess();

    } catch (error) {
      console.error("Falha ao enviar documento:", error);
      setErrorMessage(error.response?.data?.message || "Ocorreu um erro ao enviar o documento. Verifique os dados e tente novamente.");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-lg rounded-xl border-none p-8">
      <CardHeader className="text-center p-0 mb-8">
        <CardTitle className="text-3xl font-bold text-[#151928]">Envio</CardTitle>
      </CardHeader>
      
      <CardContent className="p-0 space-y-8">
        {/* Campo de Mensagem Personalizada */}
        <div className="space-y-2">
          <label htmlFor="message" className="text-base font-medium text-gray-700">Mensagem</label>
          <Textarea 
            id="message" 
            placeholder="Escreva uma mensagem opcional para os signatários..."
            className="min-h-[100px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        {/* Abas de Revisão */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Revise documentos e signatários selecionados
          </h3>
          <Tabs defaultValue="signers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signers">Signatários</TabsTrigger>
              <TabsTrigger value="documents">Documentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signers" className="mt-4 border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Celular</TableHead>
                      <TableHead>Função</TableHead>
                      <TableHead>Autenticação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {signers.map((signer) => (
                      <TableRow key={signer.email}>
                        <TableCell className="font-medium">{signer.name}</TableCell>
                        <TableCell>{signer.email}</TableCell>
                        <TableCell>{signer.phone || signer.phoneWhatsE164}</TableCell>
                        <TableCell>{signer.qualification}</TableCell>
                        <TableCell>{signer.authMethod}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-4 border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome do Arquivo</TableHead>
                            <TableHead>Data de Criação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {document ? (
                            <TableRow>
                                <TableCell className="font-medium">{document.title}</TableCell>
                                <TableCell>{format(new Date(document.createdAt), 'dd/MM/yyyy')}</TableCell>
                            </TableRow>
                        ) : (
                            <TableRow><TableCell colSpan={2}>Carregando dados do documento...</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </TabsContent>
          </Tabs>
        </div>
        {errorMessage && <p className="text-sm text-red-600 font-medium text-center pt-4">{errorMessage}</p>}
      </CardContent>

      <CardFooter className="flex justify-between p-0 mt-10">
        <Button variant="outline" onClick={onBack} className="h-10">
          Anterior
        </Button>
        <Button onClick={handleSend} disabled={loading} className="bg-[#1c4ed8] hover:bg-[#1c4ed8]/90 h-10">
          {loading ? 'Enviando...' : 'Enviar documento'}
        </Button>
      </CardFooter>
    </Card>
  );
}