'use client';
import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function DateRangeFilter({ onFilterChange }) {
  const [period, setPeriod] = useState('today');
  const [customDate, setCustomDate] = useState({ start: '', end: '' });

  const applyFilter = (selectedPeriod) => {
    setPeriod(selectedPeriod);
    
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (selectedPeriod === 'today') {
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
    } else if (selectedPeriod === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para segunda-feira
      start.setDate(diff);
      start.setHours(0,0,0,0);
      end.setHours(23,59,59,999);
    } else if (selectedPeriod === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    } else if (selectedPeriod === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = new Date(now.getFullYear(), 11, 31);
    } else if (selectedPeriod === 'custom') {
      return; // Aguarda input manual
    }

    onFilterChange({
      period: selectedPeriod,
      start: start.toISOString(),
      end: end.toISOString()
    });
  };

  const applyCustomDate = () => {
    if (customDate.start && customDate.end) {
      onFilterChange({
        period: 'custom',
        start: new Date(customDate.start).toISOString(),
        end: new Date(customDate.end + 'T23:59:59').toISOString()
      });
    }
  };

  return (
    <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
      <Select value={period} onValueChange={applyFilter}>
        <SelectTrigger className="w-[140px] h-9 border-none bg-transparent focus:ring-0">
          <Calendar className="mr-2 h-4 w-4 text-gray-500" />
          <SelectValue placeholder="Período" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoje</SelectItem>
          <SelectItem value="week">Esta Semana</SelectItem>
          <SelectItem value="month">Este Mês</SelectItem>
          <SelectItem value="quarter">Trimestre</SelectItem>
          <SelectItem value="year">Este Ano</SelectItem>
          <SelectItem value="custom">Personalizado</SelectItem>
        </SelectContent>
      </Select>

      {period === 'custom' && (
        <div className="flex items-center gap-2 px-2 border-l">
          <Input 
            type="date" 
            className="h-8 w-32 text-xs" 
            onChange={(e) => setCustomDate({...customDate, start: e.target.value})} 
          />
          <span className="text-gray-400">-</span>
          <Input 
            type="date" 
            className="h-8 w-32 text-xs" 
            onChange={(e) => setCustomDate({...customDate, end: e.target.value})} 
          />
          <Button size="sm" onClick={applyCustomDate} className="h-8 bg-[#df0024] hover:bg-red-700">Ok</Button>
        </div>
      )}
    </div>
  );
}