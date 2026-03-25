import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarMoeda, formatarData, calcularStatusAluguel } from '@/utils/rentalCalculations';
import { FileText, Search, Printer, XCircle, Pencil } from 'lucide-react'; // Importado o Pencil

export default function AlugueisPage() {
  const { alugueis, getCliente, getProduto, cancelarAluguel } = useApp();
  const navigate = useNavigate();

  const [verApenasAtivos, setVerApenasAtivos] = useState(true);
  const [busca, setBusca] = useState('');
  const [detalhes, setDetalhes] = useState<string | null>(null);

  const hoje = new Date();

  const alugueisComStatus = useMemo(() => {
    return alugueis.map((a) => ({
      ...a,
      statusCalculado:
        a.status === 'finalizado' ? ('finalizado' as const) :
        a.status === 'cancelado' ? ('cancelado' as const) :
        calcularStatusAluguel(a.data_prevista_devolucao, hoje),
    }));
  }, [alugueis, hoje]);

  const filtrados = useMemo(() => {
    return alugueisComStatus
      .filter((a) => {
        if (verApenasAtivos && (a.status === 'finalizado' || a.status === 'cancelado')) {
          return false;
        }

        if (busca) {
          const cliente = getCliente(a.cliente_id);
          const termo = busca.toLowerCase();
          const nomeCliente = (cliente?.nome ?? '').toLowerCase();
          const numeroContrato = (a.numero_contrato ?? '').toLowerCase();
          if (!numeroContrato.includes(termo) && !nomeCliente.includes(termo)) return false;
        }

        return true;
      })
      .sort((a, b) => (b.created_at ?? '').localeCompare(a.created_at ?? ''));
  }, [alugueisComStatus, verApenasAtivos, busca, getCliente]);

  const aluguelDetalhe = detalhes ? alugueis.find((a) => a.id === detalhes) ?? null : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <FileText className="h-6 w-6" /> Gestão de Aluguéis
        </h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant={verApenasAtivos ? "default" : "outline"} 
            size="sm" 
            onClick={() => setVerApenasAtivos(true)}
          >
            Ativos
          </Button>
          <Button 
            variant={!verApenasAtivos ? "default" : "outline"} 
            size="sm" 
            onClick={() => setVerApenasAtivos(false)}
          >
            Histórico Total
          </Button>
          <Button onClick={() => navigate('/alugueis/novo')} className="ml-2">
            Novo Aluguel
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contrato ou cliente..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Previsão</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtrados.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-sm">{a.numero_contrato ?? '-'}</TableCell>
                    <TableCell>{getCliente(a.cliente_id)?.nome ?? '-'}</TableCell>
                    <TableCell>{formatarData(a.data_inicio)}</TableCell>
                    <TableCell>{formatarData(a.data_prevista_devolucao)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(a.valor_previsto ?? 0)}</TableCell>
                    <TableCell><StatusBadge status={a.statusCalculado} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setDetalhes(a.id)} title="Ver Detalhes">
                          Detalhes
                        </Button>

                        {/* --- BOTÃO DE EDITAR ADICIONADO --- */}
                        {a.statusCalculado !== 'finalizado' && a.statusCalculado !== 'cancelado' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/alugueis/editar/${a.id}`)}
                            title="Editar Aluguel"
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                        )}

                        {a.statusCalculado !== 'finalizado' && a.statusCalculado !== 'cancelado' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/devolucao?id=${a.id}`)}
                          >
                            Devolver
                          </Button>
                        )}

                        <Button variant="ghost" size="sm" onClick={() => navigate(`/contrato/${a.id}`)}>
                          <Printer className="h-4 w-4" />
                        </Button>

                        {a.statusCalculado !== 'finalizado' && a.statusCalculado !== 'cancelado' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={async () => {
                              if (confirm("Deseja realmente CANCELAR este aluguel?")) {
                                await cancelarAluguel(a.id);
                              }
                            }}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Seção de detalhes... (mantida igual) */}
      {aluguelDetalhe && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-primary">Itens do Contrato {aluguelDetalhe.numero_contrato}</h3>
              <Button variant="outline" size="sm" onClick={() => setDetalhes(null)}>Fechar</Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Diária</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(aluguelDetalhe.itens || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{getProduto(item.produto_id)?.nome ?? '-'}</TableCell>
                    <TableCell className="text-center">{item.quantidade}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(item.valor_diaria)}</TableCell>
                    <TableCell className="text-right">{formatarMoeda(item.subtotal_previsto)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}