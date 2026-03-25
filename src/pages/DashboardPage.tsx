import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge'; 
import { Button } from '@/components/ui/button';
import { formatarMoeda, formatarData, calcularStatusAluguel } from '@/utils/rentalCalculations';
import { Package, Users, DollarSign, AlertTriangle, CheckCircle, XCircle, TrendingUp, Boxes, ListFilter } from 'lucide-react';

export default function DashboardPage() {
  const { alugueis, produtos, clientes, getCliente } = useApp();
  const hoje = new Date();
  
  const [verApenasAtivos, setVerApenasAtivos] = useState(true);

  // 1. Mapeia os aluguéis respeitando o status "cancelado" vindo do banco
  const alugueisComStatus = useMemo(() => {
    return alugueis.map(a => {
      if (a.status === 'cancelado') return { ...a, statusCalculado: 'cancelado' as const };
      if (a.status === 'finalizado') return { ...a, statusCalculado: 'finalizado' as const };

      return {
        ...a,
        statusCalculado: calcularStatusAluguel(a.data_prevista_devolucao, hoje),
      };
    });
  }, [alugueis, hoje]);

  // 2. Filtra cancelados dos cálculos de KPI
  const alugueisValidos = alugueisComStatus.filter(a => a.statusCalculado !== 'cancelado');

  const ativos = alugueisValidos.filter(a => a.statusCalculado === 'ativo').length;
  const proxVencimento = alugueisValidos.filter(a => a.statusCalculado === 'proximo_vencimento').length;
  const vencidos = alugueisValidos.filter(a => a.statusCalculado === 'vencido').length;

  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const faturamentoTotal = alugueis.filter(a => a.status === 'finalizado').reduce((s, a) => s + (Number(a.valor_previsto) || 0), 0);
  
  const faturamentoMes = alugueis
    .filter(a => {
      const d = new Date(a.created_at);
      return a.status === 'finalizado' && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    })
    .reduce((s, a) => s + (Number(a.valor_previsto) || 0), 0);

  // 🚩 CORREÇÃO: Lê do banco mesmo que os tipos variem entre PT e EN
  const totalAlugado = produtos
    .filter((p: any) => p.active || p.ativo)
    .reduce((s, p: any) => s + (Number(p.rented_quantity || p.quantidade_alugada) || 0), 0);

  const totalDisponivel = produtos
    .filter((p: any) => p.active || p.ativo)
    .reduce((s, p: any) => s + (Number(p.available_quantity || p.quantidade_disponivel) || 0), 0);

  // 3. Lógica da Tabela
  const alugueisParaExibir = useMemo(() => {
    let lista = [...alugueisComStatus];
    if (verApenasAtivos) {
      lista = lista.filter(a => a.status === 'ativo');
    }
    return lista.sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 10);
  }, [alugueisComStatus, verApenasAtivos]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-primary">PAINEL DE CONTROLE OSIEL</h2>

      {/* KPI Cards Superiores */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Aluguéis Ativos</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /><span className="text-3xl font-bold">{ativos}</span></div></CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Próx. Vencimento</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-500" /><span className="text-3xl font-bold">{proxVencimento}</span></div></CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Vencidos</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><XCircle className="h-5 w-5 text-red-500" /><span className="text-3xl font-bold">{vencidos}</span></div></CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Mês</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-blue-600" /><span className="text-2xl font-bold">{formatarMoeda(faturamentoMes)}</span></div></CardContent>
        </Card>
      </div>

      {/* Cards de Estoque e Clientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-orange-50/40 border-t-4 border-t-orange-400">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Itens Locados Agora</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Boxes className="h-5 w-5 text-orange-500" /><span className="text-xl font-bold">{totalAlugado}</span></div></CardContent>
        </Card>

        {/* 🚩 CARD DE ESTOQUE DETALHADO (LISTA DIRETA) */}
        <Card className="bg-green-50/40 border-t-4 border-t-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
              Estoque Disponível
              <Package className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-2xl font-bold text-slate-900">{totalDisponivel}</span>
              <span className="text-[10px] text-muted-foreground uppercase font-black">Total</span>
            </div>
            
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 pt-2 border-t border-green-200">
              {produtos
                .filter((p: any) => p.active || p.ativo)
                .map((p: any) => (
                  <div key={p.id} className="flex flex-col">
                    <span className="text-[9px] uppercase font-black text-slate-500 truncate leading-tight">
                      {p.name || p.nome}
                    </span>
                    <span className="text-lg font-bold text-green-700 leading-none">
                      {p.available_quantity || p.quantidade_disponivel} <small className="text-[10px] font-normal text-slate-400">un</small>
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Total Clientes</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" /><span className="text-xl font-bold">{clientes.length}</span></div></CardContent>
        </Card>

        <Card className="bg-slate-50 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Faturamento Total</CardTitle></CardHeader>
          <CardContent><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-blue-600" /><span className="text-xl font-bold">{formatarMoeda(faturamentoTotal)}</span></div></CardContent>
        </Card>
      </div>

      {/* Tabela de Aluguéis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-lg">Últimas Movimentações</CardTitle>
          <div className="flex items-center gap-2">
            <ListFilter className="h-4 w-4 text-muted-foreground" />
            <Button variant={verApenasAtivos ? "default" : "outline"} size="sm" onClick={() => setVerApenasAtivos(true)}>Ativos</Button>
            <Button variant={!verApenasAtivos ? "default" : "outline"} size="sm" onClick={() => setVerApenasAtivos(false)}>Tudo</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Contrato</TableHead><TableHead>Cliente</TableHead><TableHead>Previsão</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
            <TableBody>
              {alugueisParaExibir.slice(0, 8).map(a => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-[10px]">{a.numero_contrato}</TableCell>
                  <TableCell className="text-xs font-medium truncate max-w-[120px]">{getCliente(a.cliente_id)?.nome || '...'}</TableCell>
                  <TableCell className="text-xs">{formatarData(a.data_prevista_devolucao)}</TableCell>
                  <TableCell><StatusBadge status={a.statusCalculado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}