import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarMoeda, formatarData, calcularStatusAluguel, calcularDiasCobrados } from '@/utils/rentalCalculations';
import { BarChart3, Search } from 'lucide-react';

export default function RelatoriosPage() {
  const { alugueis, getCliente, getProduto, diasNaoCobrados } = useApp();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [busca, setBusca] = useState('');
  const hoje = new Date();

  const dados = (alugueis ?? []).map((a) => {
    const status =
      a.status === 'finalizado'
        ? ('finalizado' as const)
        : calcularStatusAluguel(a.data_prevista_devolucao, hoje);

    const dataFinalCalculo =
      a.data_devolucao_real || new Date().toISOString().split('T')[0];

    const diasAlugados = calcularDiasCobrados(
      a.data_inicio,
      dataFinalCalculo,
      diasNaoCobrados ?? []
    );

    const diasPrevistos = calcularDiasCobrados(
      a.data_inicio,
      a.data_prevista_devolucao,
      diasNaoCobrados ?? []
    );

    const diasAtraso =
      a.data_devolucao_real ? Math.max(0, diasAlugados - diasPrevistos) : 0;

    return {
      ...a,
      statusCalc: status,
      diasAlugados,
      diasAtraso,
    };
  });

  const filtrados = dados.filter((a) => {
    if (filtroStatus !== 'todos' && a.statusCalc !== filtroStatus) return false;

    if (busca) {
      const cliente = getCliente(a.cliente_id);
      const termo = busca.toLowerCase();
      const nomeCliente = (cliente?.nome ?? '').toLowerCase();
      const cpfCliente = cliente?.cpf ?? '';
      const numeroContrato = (a.numero_contrato ?? '').toLowerCase();

      if (
        !nomeCliente.includes(termo) &&
        !cpfCliente.includes(termo) &&
        !numeroContrato.includes(termo)
      ) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <BarChart3 className="h-6 w-6" /> Relatórios e Histórico
      </h2>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente, CPF ou contrato..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativos</SelectItem>
                <SelectItem value="proximo_vencimento">Próx. Vencimento</SelectItem>
                <SelectItem value="vencido">Vencidos</SelectItem>
                <SelectItem value="finalizado">Finalizados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Previsão</TableHead>
                  <TableHead>Devolução</TableHead>
                  <TableHead className="text-center">Dias</TableHead>
                  <TableHead className="text-center">Atraso</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Antec.</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtrados.map((a) => {
                  const cliente = getCliente(a.cliente_id);

                  const produtoNomes = (a.itens ?? [])
                    .map((i) => {
                      const nome = getProduto(i.produto_id)?.nome ?? 'Produto';
                      return `${nome} (${i.quantidade ?? 0})`;
                    })
                    .join(', ');

                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-mono text-xs">
                        {a.numero_contrato ?? '-'}
                      </TableCell>

                      <TableCell className="text-sm">
                        {cliente?.nome ?? '-'}
                      </TableCell>

                      <TableCell className="max-w-48 truncate text-xs">
                        {produtoNomes || '-'}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatarData(a.data_inicio)}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatarData(a.data_prevista_devolucao)}
                      </TableCell>

                      <TableCell className="text-sm">
                        {a.data_devolucao_real ? formatarData(a.data_devolucao_real) : '-'}
                      </TableCell>

                      <TableCell className="text-center">
                        {a.diasAlugados}
                      </TableCell>

                      <TableCell className="text-center">
                        {a.diasAtraso > 0 ? (
                          <span className="font-bold text-destructive">{a.diasAtraso}</span>
                        ) : (
                          '-'
                        )}
                      </TableCell>

                      <TableCell className="text-right text-sm">
                        {formatarMoeda(a.valor_total_final || a.valor_previsto || 0)}
                      </TableCell>

                      <TableCell className="text-sm">
                        {a.pagamento_antecipado ? 'Sim' : 'Não'}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={a.statusCalc} />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center text-muted-foreground">
                      Nenhum resultado encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}