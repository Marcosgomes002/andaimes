import { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calcularDiasCobrados, formatarMoeda } from '@/utils/rentalCalculations';
import { FilePlus, Plus, Trash2, Calculator, AlertTriangle, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { differenceInCalendarDays, parseISO } from 'date-fns';

interface ItemForm {
  produto_id: string;
  quantidade: string;
}

export default function NovoAluguelPage() {
  const { clientes, produtos, diasNaoCobrados, criarAluguel, getProduto } = useApp();
  const navigate = useNavigate();

  const [clienteId, setClienteId] = useState('');
  const [dataInicio, setDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [dataPrevista, setDataPrevista] = useState('');
  const [pagAntecipado, setPagAntecipado] = useState(false);
  const [valorAntecipado, setValorAntecipado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([{ produto_id: '', quantidade: '1' }]);
  const [calculado, setCalculado] = useState(false);

  const [cobrarEntrega, setCobrarEntrega] = useState(false);
  const [taxaEntrega, setTaxaEntrega] = useState('');
  const [obsEntrega, setObsEntrega] = useState('');

  useEffect(() => {
    setCalculado(false);
  }, [dataInicio, dataPrevista, itens, cobrarEntrega, taxaEntrega]);

  const diasTotais = useMemo(() => {
    if (!dataInicio || !dataPrevista) return 0;
    return differenceInCalendarDays(parseISO(dataPrevista), parseISO(dataInicio)) + 1;
  }, [dataInicio, dataPrevista]);

  const diasCobrados = useMemo(() => {
    if (!dataInicio || !dataPrevista) return 0;
    return calcularDiasCobrados(dataInicio, dataPrevista, diasNaoCobrados);
  }, [dataInicio, dataPrevista, diasNaoCobrados]);

  const diasNaoCobradosCount = Math.max(0, diasTotais - diasCobrados);

  const podeCalcular =
    dataPrevista &&
    dataInicio &&
    diasTotais > 0 &&
    itens.some((i) => i.produto_id && parseInt(i.quantidade) > 0);

  const resumoItens = useMemo(() => {
    return itens
      .map((item) => {
        const produto = getProduto(item.produto_id);
        const qtd = parseInt(item.quantidade) || 0;
        const valorDiaria = produto?.valor_diaria || 0;

        return {
          ...item,
          nome: produto?.nome || '',
          valorDiaria,
          disponivel: produto?.quantidade_disponivel || 0,
          subtotal: qtd * valorDiaria * diasCobrados,
        };
      })
      .filter((i) => i.produto_id);
  }, [itens, diasCobrados, getProduto]);

  const subtotalItens = resumoItens.reduce((s, i) => s + i.subtotal, 0);
  const valorEntrega = cobrarEntrega ? parseFloat(taxaEntrega) || 0 : 0;
  const totalPrevisto = subtotalItens + valorEntrega;

  const addItem = () => setItens((prev) => [...prev, { produto_id: '', quantidade: '1' }]);
  const removeItem = (i: number) => setItens((prev) => prev.filter((_, idx) => idx !== i));

  const handleCalcular = () => {
    if (diasTotais <= 0) {
      toast.error('A data prevista deve ser igual ou posterior à data de início');
      return;
    }
    setCalculado(true);
    toast.success('Cálculo realizado!');
  };

  const validar = (): string | null => {
    if (!clienteId) return 'Selecione um cliente';
    if (!calculado) return 'Clique em Calcular antes de confirmar';
    return null;
  };

  const confirmar = async () => {
    const erro = validar();
    if (erro) {
      toast.error(erro);
      return;
    }

    try {
      // AJUSTE: Enviando subtotal_previsto e valor_previsto
      const resultado = await criarAluguel({
        cliente_id: clienteId,
        data_inicio: dataInicio,
        dias_contratados: diasCobrados,
        data_prevista_devolucao: dataPrevista,
        pagamento_antecipado: pagAntecipado,
        valor_antecipado: pagAntecipado ? parseFloat(valorAntecipado) || 0 : 0,
        valor_previsto: totalPrevisto, 
        observacoes,
        taxa_entrega: valorEntrega,
        observacoes_entrega: cobrarEntrega ? obsEntrega : '',
        itens: itens
          .filter((i) => i.produto_id)
          .map((i) => {
            const produto = getProduto(i.produto_id);
            const qtd = parseInt(i.quantidade) || 0;
            const vDiaria = produto?.valor_diaria || 0;
            return {
              produto_id: i.produto_id,
              quantidade: qtd,
              valor_diaria: vDiaria,
              subtotal_previsto: qtd * vDiaria * diasCobrados // CALCULO INDIVIDUAL
            };
          }),
      });

      toast.success(`Aluguel criado com sucesso!`);
      navigate('/alugueis');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar no banco de dados.');
    }
  };

  const clientesAtivos = clientes.filter((c) => c.ativo);
  const produtosAtivos = produtos.filter((p) => p.ativo && p.quantidade_disponivel > 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FilePlus className="h-6 w-6" /> Novo Aluguel
      </h2>

      <Card>
        <CardHeader><CardTitle>Dados do Aluguel</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione o cliente</option>
              {clientesAtivos.map((c) => (
                <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Data de Início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label>Data Prevista de Devolução</Label>
              <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={pagAntecipado} onCheckedChange={setPagAntecipado} />
              <Label>Pagamento Antecipado</Label>
            </div>
            {pagAntecipado && (
              <div className="flex-1 max-w-xs">
                <Label>Valor Pago (R$)</Label>
                <Input type="number" value={valorAntecipado} onChange={(e) => setValorAntecipado(e.target.value)} />
              </div>
            )}
          </div>

          <div className="border-t pt-4 space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={cobrarEntrega} onCheckedChange={setCobrarEntrega} />
              <Label className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Cobrar taxa de entrega?</Label>
            </div>
            {cobrarEntrega && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                <div>
                  <Label>Valor da Taxa (R$)</Label>
                  <Input type="number" value={taxaEntrega} onChange={(e) => setTaxaEntrega(e.target.value)} />
                </div>
                <div>
                  <Label>Observação da Entrega</Label>
                  <Input value={obsEntrega} onChange={(e) => setObsEntrega(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          <div>
            <Label>Observações</Label>
            <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Itens do Aluguel</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Adicionar Item</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {itens.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                {idx === 0 && <Label>Produto</Label>}
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={item.produto_id}
                  onChange={(e) => setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, produto_id: e.target.value } : it)))}
                >
                  <option value="">Selecione</option>
                  {produtosAtivos.map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} (disp: {p.quantidade_disponivel})</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                {idx === 0 && <Label>Qtd</Label>}
                <Input type="number" min="1" value={item.quantidade} onChange={(e) => setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, quantidade: e.target.value } : it)))} />
              </div>
              {itens.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {podeCalcular && !calculado && (
        <Button onClick={handleCalcular} size="lg" className="w-full sm:w-auto"><Calculator className="h-5 w-5 mr-2" /> Calcular Aluguel</Button>
      )}

      {calculado && (
        <Card className="border-primary border-2">
          <CardHeader><CardTitle>Resumo do Aluguel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-muted p-3 rounded-lg"><p className="text-sm">Dias Totais</p><p className="text-2xl font-bold">{diasTotais}</p></div>
              <div className="bg-muted p-3 rounded-lg"><p className="text-sm">Dias Cobráveis</p><p className="text-2xl font-bold text-primary">{diasCobrados}</p></div>
              <div className="bg-muted p-3 rounded-lg"><p className="text-sm">Isenções</p><p className="text-2xl font-bold">{diasNaoCobradosCount}</p></div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-center">Qtd</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resumoItens.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{item.nome}</TableCell>
                    <TableCell className="text-center">{item.quantidade}</TableCell>
                    <TableCell className="text-right font-semibold">{formatarMoeda(item.subtotal)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between text-lg pt-4 border-t font-bold">
              <span>Total Previsto:</span>
              <span className="text-2xl text-primary">{formatarMoeda(totalPrevisto)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={() => navigate('/alugueis')}>Cancelar</Button>
        <Button onClick={confirmar} className="flex-1" disabled={!calculado}>Confirmar Aluguel</Button>
      </div>
    </div>
  );
}