'use client';

import { useState } from 'react';
import ManagerLayout from '../../../../components/ManagerLayout.js/ManagerLayout';
import DateRangeFilter from '../../../../components/DateRangeFilter';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Table as TableIcon } from 'lucide-react';

export default function ReportsPage() {
  const [filter, setFilter] = useState({});

  // Mock de tipos de relatório
  const reportTypes = [
    { id: 1, name: 'Vendas Detalhadas', desc: 'Lista de todos os pedidos com data, valor e itens.' },
    { id: 2, name: 'Fechamento de Caixa', desc: 'Totais diários de faturamento por método de pagamento.' },
    { id: 3, name: 'Performance de Produtos', desc: 'Ranking de itens mais vendidos e menos vendidos.' },
    { id: 4, name: 'Cancelamentos', desc: 'Relatório de pedidos cancelados e motivos.' },
  ];

  return (
    <ManagerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Central de Relatórios</h1>
            <p className="text-gray-500">Exporte dados para contabilidade e análise.</p>
          </div>
          <DateRangeFilter onFilterChange={setFilter} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map(rpt => (
            <Card key={rpt.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="bg-red-50 p-3 rounded-xl text-[#df0024]">
                    <FileText size={24} />
                  </div>
                  <Button variant="outline" className="gap-2">
                    <Download size={16} /> Excel
                  </Button>
                </div>
                <CardTitle className="mt-4">{rpt.name}</CardTitle>
                <p className="text-sm text-gray-500">{rpt.desc}</p>
              </CardHeader>
              <CardContent>
                <div className="text-xs text-gray-400 pt-2 border-t mt-2">
                  Período selecionado: {filter.period || 'Hoje'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ManagerLayout>
  );
}