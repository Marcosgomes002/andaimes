import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarMoeda, calcularStatusAluguel } from '@/utils/rentalCalculations';
import { DollarSign, TrendingUp, Clock, AlertTriangle, Wallet } from 'lucide-react';

export default function FinanceiroPage() {
  const { alugueis, clientes, getCliente, getProduto } = useApp();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('todos');
  const hoje = new Date();

  const faturadoTotal = alugueis.reduce((s, a) => s + (a.valor_total_final || 0), 0);
  const antecipadoTotal = alugueis
    .filter((a) => a.pagamento_antecipado)
    .reduce((s, a) => s + (a.valor_antecipado || 0), 0);
  const atrasoTotal = alugueis.reduce((s, a) => s + (a.valor_adicional_atraso || 0), 0);
  const avariaTotal = alugueis.reduce((s, a) => s + (a.valor_avaria || 0), 0);
  const entregaTotal = alugueis.reduce((s, a) => s + (a.taxa_entrega || 0), 0);

  const emAberto = alugueis
    .filter((a) => a.status !== 'finalizado')
    .reduce((s, a) => s + (a.valor_previsto || 0), 0);

  const aReceber =
    emAberto -
    alugueis
      .filter((a) => a.status !== 'finalizado' && a.pagamento_antecipado)
      .reduce((s, a) => s + (a.valor_antecipado || 0), 0);

  const filtrados = useMemo(() => {
    return alugueis.filter((a) => {
      if (filtroStatus !== 'todos') {
        const status =
          a.status === 'finalizado'
            ? 'finalizado'
            : calcularStatusAluguel(a.data_prevista_devolucao, hoje);

        if (status !== filtroStatus) return false;
      }

      if (filtroCliente !== 'todos' && a.cliente_id !== filtroCliente) return false;

      return true;
    });
  }, [alugueis, filtroStatus, filtroCliente, hoje]);

  const faturamentoPorProduto = useMemo(() => {
    const map = new Map<string, { produto: string; valor: number }>();

    alugueis.forEach((a) => {
      a.itens.forEach((item) => {
        const id = item.produto_id;
        const nome = getProduto(id)?.nome || id;
        const valor = item.subtotal_final || item.subtotal_previsto || 0;
        const atual = map.get(id);

        if (atual) {
          map.set(id, { ...atual, valor: atual.valor + valor });
        } else {
          map.set(id, { produto: nome, valor });
        }
      });
    });

    return Array.from(map.entries())
      .map(([id, dados]) => ({
        id,
        produto: dados.produto,
        valor: dados.valor,
      }))
      .sort((a, b) => b.valor - a.valor);
  }, [alugueis, getProduto]);

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <DollarSign className="h-6 w-6" /> Financeiro
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Faturado Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-status-active" />
              <span className="text-xl font-bold">{formatarMoeda(faturadoTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Recebido Antecipado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              <span className="text-xl font-bold">{formatarMoeda(antecipadoTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Cobrado por Atraso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-status-warning" />
              <span className="text-xl font-bold">{formatarMoeda(atrasoTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avaria / Perda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span className="text-xl font-bold">{formatarMoeda(avariaTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Taxa de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
              <span className="text-xl font-bold">{formatarMoeda(entregaTotal)}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">A Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xl font-bold text-primary">{formatarMoeda(aReceber)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-48"
            >
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="finalizado">Finalizados</option>
              <option value="vencido">Vencidos</option>
              <option value="proximo_vencimento">Próx. Vencimento</option>
            </select>

            <select
              value={filtroCliente}
              onChange={(e) => setFiltroCliente(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-48"
            >
              <option value="todos">Todos Clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Previsto</TableHead>
                  <TableHead className="text-right">Antecipado</TableHead>
                  <TableHead className="text-right">Atraso</TableHead>
                  <TableHead className="text-right">Total Final</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtrados.length > 0 ? (
                  filtrados.map((a) => {
                    const status =
                      a.status === 'finalizado'
                        ? 'finalizado'
                        : calcularStatusAluguel(a.data_prevista_devolucao, hoje);

                    return (
                      <TableRow key={a.id}>
                        <TableCell className="font-mono text-sm">{a.numero_contrato}</TableCell>
                        <TableCell>{getCliente(a.cliente_id)?.nome || '-'}</TableCell>
                        <TableCell className="text-right">{formatarMoeda(a.valor_previsto || 0)}</TableCell>
                        <TableCell className="text-right">
                          {a.pagamento_antecipado ? formatarMoeda(a.valor_antecipado || 0) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          {a.valor_adicional_atraso > 0 ? formatarMoeda(a.valor_adicional_atraso) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {a.valor_total_final > 0 ? formatarMoeda(a.valor_total_final) : '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={status} />
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      Nenhum registro encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faturamentoPorProduto.length > 0 ? (
                faturamentoPorProduto.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.produto}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatarMoeda(p.valor)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-muted-foreground">
                    Nenhum faturamento por produto encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}