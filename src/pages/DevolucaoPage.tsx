import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatarMoeda, formatarData, calcularDiasCobrados } from '@/utils/rentalCalculations';
import { RotateCcw, Calculator } from 'lucide-react';
import { toast } from 'sonner';

export default function DevolucaoPage() {
  const { alugueis, getCliente, getProduto, diasNaoCobrados, registrarDevolucao } = useApp();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [aluguelId, setAluguelId] = useState(searchParams.get('id') || '');
  const [dataDevolucao, setDataDevolucao] = useState(new Date().toISOString().split('T')[0]);
  const [valorAvaria, setValorAvaria] = useState('');
  const [valorDesconto, setValorDesconto] = useState(''); // 🚩 Estado do Desconto
  const [obsAvaria, setObsAvaria] = useState('');
  const [calculado, setCalculado] = useState(false);

  const alugueisAbertos = alugueis.filter((a) => a.status !== 'finalizado');
  const aluguel = alugueis.find((a) => a.id === aluguelId);

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
  const valorDescontoNumero = parseFloat(valorDesconto) || 0; // 🚩 Valor do Desconto
  const valorBaseAluguel = diasCobradosReal * valorDiariasPorDia;
  const valorJaPago = aluguel?.pagamento_antecipado ? Number(aluguel.valor_antecipado) : 0;
  
  // 🚩 O cálculo agora subtrai o desconto do total
  const valorTotalCalculado = valorBaseAluguel + valorAvariaNumero - valorDescontoNumero;
  const valorFaltaPagar = Math.max(0, valorTotalCalculado - valorJaPago);

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
        valor_desconto: valorDescontoNumero, // 🚩 Enviando o desconto para o AppContext
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
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <RotateCcw className="h-6 w-6" /> Registrar Devolução
      </h2>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Selecionar Aluguel</Label>
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
                onChange={(e) => {
                  setDataDevolucao(e.target.value);
                  setCalculado(false);
                }}
              />
            </div>
          </div>

          <Button onClick={handleCalcular} type="button">
            <Calculator className="mr-2 h-4 w-4" /> Calcular Valores
          </Button>
        </CardContent>
      </Card>

      {aluguel && (
        <>
          <Card>
            <CardHeader><CardTitle>Resumo do Contrato</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div><strong>Cliente:</strong> {getCliente(aluguel.cliente_id)?.nome}</div>
                <div><strong>Início:</strong> {formatarData(aluguel.data_inicio)}</div>
                <div><strong>Previsão:</strong> {formatarData(aluguel.data_prevista_devolucao)}</div>
                <div><strong>Dias Cobrados:</strong> {diasCobradosReal}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Itens Devolvidos</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead className="text-center">Quantidade Alugada</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aluguel.itens.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{getProduto(item.produto_id)?.nome}</TableCell>
                      <TableCell className="text-center">{item.quantidade}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Financeiro e Descontos</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Valor de Avaria/Perda (R$)</Label>
                  <Input
                    type="number"
                    value={valorAvaria}
                    onChange={(e) => { setValorAvaria(e.target.value); setCalculado(false); }}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label className="text-green-600 font-bold">Conceder Desconto (R$)</Label>
                  <Input
                    type="number"
                    className="border-green-300 focus-visible:ring-green-500"
                    value={valorDesconto}
                    onChange={(e) => { setValorDesconto(e.target.value); setCalculado(false); }}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div>
                <Label>Observações da Devolução</Label>
                <Textarea
                  value={obsAvaria}
                  onChange={(e) => setObsAvaria(e.target.value)}
                  placeholder="Ex: Cliente bom pagador, concedido desconto de arredondamento..."
                />
              </div>
            </CardContent>
          </Card>

          {calculado && (
            <Card className="border-2 border-primary bg-primary/5">
              <CardContent className="space-y-2 pt-6">
                <div className="flex justify-between text-sm">
                  <span>Valor do Aluguel ({diasCobradosReal} dias)</span>
                  <span>{formatarMoeda(valorBaseAluguel)}</span>
                </div>
                {valorAvariaNumero > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>(+) Avarias/Perdas</span>
                    <span>{formatarMoeda(valorAvariaNumero)}</span>
                  </div>
                )}
                {valorDescontoNumero > 0 && (
                  <div className="flex justify-between text-sm text-green-600 font-bold">
                    <span>(-) Desconto Concedido</span>
                    <span>{formatarMoeda(valorDescontoNumero)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-b pb-2">
                  <span>Valor já pago (Antecipado)</span>
                  <span className="text-blue-600">-{formatarMoeda(valorJaPago)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Saldo Final a Receber</span>
                  <span className="text-primary">{formatarMoeda(valorFaltaPagar)}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/alugueis')}>Cancelar</Button>
            <Button className="flex-1" onClick={confirmar}>Finalizar e Devolver ao Estoque</Button>
          </div>
        </>
      )}
    </div>
  );
}