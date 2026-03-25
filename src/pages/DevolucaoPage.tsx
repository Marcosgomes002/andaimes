import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { formatarMoeda, formatarData, calcularDiasCobrados } from '../utils/rentalCalculations';
import { RotateCcw, Calculator, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function DevolucaoPage() {
  const { alugueis, getCliente, getProduto, diasNaoCobrados, registrarDevolucao } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [aluguelId, setAluguelId] = useState(searchParams.get('id') || '');
  const [dataDevolucao, setDataDevolucao] = useState(new Date().toISOString().split('T')[0]);
  const [valorAvaria, setValorAvaria] = useState('');
  const [valorDesconto, setValorDesconto] = useState('');
  const [obsAvaria, setObsAvaria] = useState('');
  const [calculado, setCalculado] = useState(false);

  // 🚩 FILTRO CORRIGIDO: Só mostra o que está 'ativo' ou 'atrasado'
  const alugueisAbertos = useMemo(() => {
    return alugueis.filter((a) => a.status !== 'finalizado' && a.status !== 'cancelado');
  }, [alugueis]);

  const aluguel = useMemo(() => alugueis.find((a) => a.id === aluguelId), [alugueis, aluguelId]);

  const handleAluguelChange = (id: string) => {
    setAluguelId(id);
    setValorAvaria('');
    setValorDesconto('');
    setObsAvaria('');
    setCalculado(false);
  };

  const diasCobradosReal = useMemo(() => {
    if (!aluguel || !dataDevolucao) return 0;
    return calcularDiasCobrados(aluguel.data_inicio, dataDevolucao, diasNaoCobrados);
  }, [aluguel, dataDevolucao, diasNaoCobrados]);

  const valorDiariasPorDia = useMemo(() => {
    if (!aluguel) return 0;
    return aluguel.itens.reduce((soma, item) => soma + (Number(item.valor_diaria) * Number(item.quantidade)), 0);
  }, [aluguel]);

  const valorAvariaNumero = parseFloat(valorAvaria) || 0;
  const valorDescontoNumero = parseFloat(valorDesconto) || 0;
  
  // Cálculo base: (Dias * Valor das diárias) + Taxa de Entrega original
  const valorBaseAluguel = (diasCobradosReal * valorDiariasPorDia) + (Number(aluguel?.taxa_entrega) || 0);
  
  // Valor que o cliente já pagou na abertura do contrato
  const valorJaPago = useMemo(() => {
    return Number(aluguel?.valor_antecipado || 0);
  }, [aluguel]);
  
  // 🚩 CORREÇÃO DE VARIÁVEL: valorTotalComAvarias
  const valorTotalComAvarias = valorBaseAluguel + valorAvariaNumero - valorDescontoNumero;
  const saldoFinal = valorTotalComAvarias - valorJaPago;

  const handleCalcular = () => {
    if (!aluguel) return toast.error('Selecione um aluguel');
    setCalculado(true);
    toast.success('Cálculo realizado!');
  };

  const confirmar = async () => {
    if (!aluguel) return;
    if (!calculado) return toast.error('Clique em Calcular antes!');

    try {
      await registrarDevolucao({
        aluguel_id: aluguel.id,
        data_devolucao: dataDevolucao,
        valor_avaria: valorAvariaNumero,
        valor_desconto: valorDescontoNumero,
        observacoes_avaria: obsAvaria,
      });

      toast.success('Devolução registrada com sucesso!');
      navigate('/alugueis');
    } catch (error) {
      toast.error('Erro ao registrar devolução.');
    }
  };

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/alugueis')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <RotateCcw className="h-6 w-6" /> Registrar Devolução
        </h2>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Selecionar Contrato Ativo</Label>
              <select
                value={aluguelId}
                onChange={(e) => handleAluguelChange(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Selecione um contrato</option>
                {alugueisAbertos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.numero_contrato} - {getCliente(a.cliente_id)?.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Data da Devolução</Label>
              <Input
                type="date"
                value={dataDevolucao}
                onChange={(e) => { setDataDevolucao(e.target.value); setCalculado(false); }}
              />
            </div>
          </div>
          <Button onClick={handleCalcular} className="w-full sm:w-auto">
            <Calculator className="mr-2 h-4 w-4" /> Calcular Valores
          </Button>
        </CardContent>
      </Card>

      {aluguel && (
        <>
          <Card>
            <CardHeader className="bg-muted/30"><CardTitle className="text-sm uppercase font-bold">Avarias e Descontos</CardTitle></CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Valor de Avaria/Perda (R$)</Label>
                  <Input type="number" value={valorAvaria} onChange={(e) => {setValorAvaria(e.target.value); setCalculado(false);}} placeholder="0,00" />
                </div>
                <div>
                  <Label className="text-green-600 font-bold">Conceder Desconto (R$)</Label>
                  <Input type="number" className="border-green-200" value={valorDesconto} onChange={(e) => {setValorDesconto(e.target.value); setCalculado(false);}} placeholder="0,00" />
                </div>
              </div>
              <Textarea value={obsAvaria} onChange={(e) => setObsAvaria(e.target.value)} placeholder="Observações importantes..." />
            </CardContent>
          </Card>

          {calculado && (
            <Card className="border-2 border-primary bg-primary/5 shadow-lg">
              <CardContent className="space-y-3 pt-6">
                <div className="flex justify-between text-sm">
                  <span>Aluguel ({diasCobradosReal} dias) + Entrega:</span>
                  <span>{formatarMoeda(valorBaseAluguel)}</span>
                </div>
                {valorAvariaNumero > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>(+) Avarias/Perdas:</span>
                    <span>{formatarMoeda(valorAvariaNumero)}</span>
                  </div>
                )}
                {valorDescontoNumero > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>(-) Desconto Concedido:</span>
                    <span>{formatarMoeda(valorDescontoNumero)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t pt-2 text-blue-600 font-medium italic">
                  <span>(-) Valor Pago Antecipado:</span>
                  <span>{formatarMoeda(valorJaPago)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold border-t-2 border-primary pt-3 mt-2">
                  <span>SALDO A RECEBER:</span>
                  <span className={saldoFinal >= 0 ? "text-primary" : "text-blue-600"}>
                    {formatarMoeda(saldoFinal)}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/alugueis')}>Cancelar</Button>
            <Button className="flex-1 h-12 shadow-md bg-primary" onClick={confirmar} disabled={!calculado}>Finalizar Devolução</Button>
          </div>
        </>
      )}
    </div>
  );
}