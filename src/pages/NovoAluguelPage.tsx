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
import { FilePlus, Plus, Trash2, Calculator, Truck } from 'lucide-react';
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

  const confirmar = async () => {
    if (!clienteId) return toast.error('Selecione um cliente');
    if (!calculado) return toast.error('Clique em Calcular antes de confirmar');

    try {
      // 🚩 AJUSTE IMPORTANTE: Garante que o valor antecipado seja número ou zero
      const adiantamento = pagAntecipado ? parseFloat(valorAntecipado) || 0 : 0;

      await criarAluguel({
        cliente_id: clienteId,
        data_inicio: dataInicio,
        dias_contratados: diasCobrados,
        data_prevista_devolucao: dataPrevista,
        pagamento_antecipado: pagAntecipado,
        valor_antecipado: adiantamento, // Enviando o valor correto
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
              subtotal_previsto: qtd * vDiaria * diasCobrados
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

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
        <FilePlus className="h-6 w-6" /> Novo Aluguel
      </h2>

      <Card className="shadow-md">
        <CardHeader><CardTitle className="text-lg">Dados do Contrato</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Cliente</Label>
            <select
              className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
            >
              <option value="">Selecione o cliente</option>
              {clientes.filter(c => c.ativo).map((c) => (
                <option key={c.id} value={c.id}>{c.nome} - {c.cpf}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><Label>Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
            <div><Label>Previsão</Label><Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} /></div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <Switch checked={pagAntecipado} onCheckedChange={setPagAntecipado} />
              <Label className="font-bold">Pagamento Antecipado?</Label>
            </div>
            {pagAntecipado && (
              <div className="flex-1 max-w-xs">
                <Label>Valor Pago na Entrada (R$)</Label>
                <Input type="number" className="border-primary" value={valorAntecipado} onChange={(e) => setValorAntecipado(e.target.value)} placeholder="0,00" />
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Switch checked={cobrarEntrega} onCheckedChange={setCobrarEntrega} />
              <Label className="flex items-center gap-1.5"><Truck className="h-4 w-4" /> Cobrar taxa de entrega?</Label>
            </div>
            {cobrarEntrega && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-6">
                <Input type="number" placeholder="Valor R$" value={taxaEntrega} onChange={(e) => setTaxaEntrega(e.target.value)} />
                <Input placeholder="Local/Obs de entrega" value={obsEntrega} onChange={(e) => setObsEntrega(e.target.value)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle className="text-lg">Produtos</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4 mr-1" /> Item</Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {itens.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <div className="flex-1">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={item.produto_id}
                  onChange={(e) => setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, produto_id: e.target.value } : it)))}
                >
                  <option value="">Selecione o produto</option>
                  {produtos.filter(p => p.ativo).map((p) => (
                    <option key={p.id} value={p.id}>{p.nome} (Estoque: {p.quantidade_disponivel})</option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <Input type="number" min="1" value={item.quantidade} onChange={(e) => setItens((prev) => prev.map((it, i) => (i === idx ? { ...it, quantidade: e.target.value } : it)))} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} disabled={itens.length === 1}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {podeCalcular && (
            <Button onClick={handleCalcular} className="w-full bg-secondary text-secondary-foreground font-bold hover:bg-secondary/80">
              <Calculator className="h-5 w-5 mr-2" /> Calcular Resumo Financeiro
            </Button>
          )}
        </CardContent>
      </Card>

      {calculado && (
        <Card className="border-primary border-2 bg-primary/5 shadow-lg">
          <CardContent className="pt-6 space-y-4">
            <div className="flex justify-between items-center font-bold border-b pb-2">
              <span className="text-muted-foreground">Valor Bruto do Aluguel ({diasCobrados} dias):</span>
              <span className="text-xl">{formatarMoeda(subtotalItens)}</span>
            </div>
            {cobrarEntrega && (
              <div className="flex justify-between items-center font-bold border-b pb-2 text-blue-600">
                <span>(+) Taxa de Entrega:</span>
                <span>{formatarMoeda(valorEntrega)}</span>
              </div>
            )}
            <div className="flex justify-between items-center font-bold text-2xl pt-2 text-primary">
              <span>TOTAL PREVISTO:</span>
              <span>{formatarMoeda(totalPrevisto)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 h-12" onClick={() => navigate('/alugueis')}>Cancelar</Button>
        <Button onClick={confirmar} className="flex-1 h-12 text-lg shadow-lg" disabled={!calculado}>Confirmar Aluguel</Button>
      </div>
    </div>
  );
}