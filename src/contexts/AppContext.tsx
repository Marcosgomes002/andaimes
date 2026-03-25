import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext'; 
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { calcularDiasCobrados, formatarMoeda } from '../utils/rentalCalculations';
import { Save, Plus, Trash2, Calculator, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface ItemForm {
  produto_id: string;
  quantidade: string;
}

export default function EditarAluguelPage() {
  const { id } = useParams();
  const { produtos, diasNaoCobrados, atualizarAluguel, getAluguel } = useApp();
  const navigate = useNavigate();
  
  const aluguelOriginal = useMemo(() => getAluguel(id || ''), [id, getAluguel]);

  const [dataInicio, setDataInicio] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [valorAntecipado, setValorAntecipado] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [calculado, setCalculado] = useState(false);
  const [taxaEntrega, setTaxaEntrega] = useState('');
  const [obsEntrega, setObsEntrega] = useState('');

  // Carrega os dados do aluguel ao abrir a página
  useEffect(() => {
    if (aluguelOriginal) {
      setDataInicio(aluguelOriginal.data_inicio || '');
      setDataPrevista(aluguelOriginal.data_prevista_devolucao || '');
      setValorAntecipado(aluguelOriginal.valor_antecipado?.toString() || '0');
      setObservacoes(aluguelOriginal.observacoes || '');
      setTaxaEntrega(aluguelOriginal.taxa_entrega?.toString() || '0');
      setObsEntrega(aluguelOriginal.observacoes_entrega || '');
      
      const itensFormatados = aluguelOriginal.itens.map((it: any) => ({
        produto_id: it.produto_id,
        quantidade: it.quantidade.toString(),
      }));
      setItens(itensFormatados);
    }
  }, [aluguelOriginal]);

  // Reseta o cálculo se mudar qualquer dado
  useEffect(() => {
    setCalculado(false);
  }, [dataInicio, dataPrevista, itens, taxaEntrega]);

  const diasCobrados = useMemo(() => {
    if (!dataInicio || !dataPrevista) return 0;
    return calcularDiasCobrados(dataInicio, dataPrevista, diasNaoCobrados);
  }, [dataInicio, dataPrevista, diasNaoCobrados]);

  // Gera o resumo dos itens garantindo que o nome do produto seja encontrado
  const resumoItens = useMemo(() => {
    return itens.map((item) => {
      const produto = produtos.find(p => p.id === item.produto_id);
      const qtd = parseInt(item.quantidade) || 0;
      const valorDiaria = produto?.valor_diaria || 0;
      return {
        ...item,
        nome: produto?.nome || 'Produto não encontrado',
        subtotal: qtd * valorDiaria * diasCobrados,
        valor_diaria: valorDiaria
      };
    }).filter(i => i.produto_id);
  }, [itens, diasCobrados, produtos]); // Adicionado produtos como dependência

  const totalPrevisto = resumoItens.reduce((acc, i) => acc + i.subtotal, 0) + (parseFloat(taxaEntrega) || 0);

  const addItem = () => setItens([...itens, { produto_id: '', quantidade: '1' }]);
  const removeItem = (idx: number) => setItens(itens.filter((_, i) => i !== idx));

  const handleSalvar = async () => {
    if (!calculado) {
      toast.error("Clique em Recalcular antes de salvar.");
      return;
    }

    try {
      await atualizarAluguel(id!, {
        data_inicio: dataInicio,
        dias_contratados: diasCobrados,
        data_prevista_devolucao: dataPrevista,
        valor_antecipado: parseFloat(valorAntecipado) || 0,
        taxa_entrega: parseFloat(taxaEntrega) || 0,
        observacoes_entrega: obsEntrega,
        observacoes: observacoes,
        itens: resumoItens.map(it => ({
          produto_id: it.produto_id,
          quantidade: parseInt(it.quantidade),
          valor_diaria: it.valor_diaria
        }))
      });
      toast.success("Aluguel atualizado com sucesso!");
      navigate('/alugueis');
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar as alterações.");
    }
  };

  if (!aluguelOriginal) return <div className="p-10 text-center font-bold">Carregando dados do aluguel...</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/alugueis')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold text-primary">Editar Contrato: {aluguelOriginal.numero_contrato}</h2>
      </div>

      <Card className="shadow-md">
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Previsão de Devolução</Label>
              <Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Taxa de Entrega (R$)</Label>
              <Input type="number" value={taxaEntrega} onChange={(e) => setTaxaEntrega(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor Adiantado (R$)</Label>
              <Input type="number" value={valorAntecipado} onChange={(e) => setValorAntecipado(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-row items-center justify-between bg-muted/50">
          <CardTitle className="text-sm uppercase tracking-wider font-bold">Produtos e Quantidades</CardTitle>
          <Button variant="outline" size="sm" onClick={addItem} className="bg-background">
            <Plus className="h-4 w-4 mr-1" /> Adicionar Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          {itens.map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end border-b pb-4 sm:border-0">
              <div className="flex-1 w-full">
                <Label className="text-xs">Produto</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                  value={item.produto_id}
                  onChange={(e) => setItens(itens.map((it, i) => i === idx ? { ...it, produto_id: e.target.value } : it))}
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Disp: {p.quantidade_disponivel})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full sm:w-28">
                <Label className="text-xs">Quantidade</Label>
                <Input 
                  type="number" 
                  value={item.quantidade} 
                  onChange={(e) => setItens(itens.map((it, i) => i === idx ? { ...it, quantidade: e.target.value } : it))} 
                />
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:bg-red-50" 
                onClick={() => removeItem(idx)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <Button variant="secondary" className="w-full mt-2 font-bold" onClick={() => setCalculado(true)}>
            <Calculator className="h-4 w-4 mr-2" /> Recalcular Total para Salvar
          </Button>
        </CardContent>
      </Card>

      {calculado && (
        <Card className="border-primary border-2 bg-primary/5 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center font-bold">
              <span className="text-lg">Novo Total:</span>
              <span className="text-3xl text-primary">{formatarMoeda(totalPrevisto)}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4 pt-4">
        <Button variant="outline" className="flex-1 h-12" onClick={() => navigate('/alugueis')}>
          Cancelar
        </Button>
        <Button 
          className="flex-1 h-12 shadow-lg" 
          onClick={handleSalvar} 
          disabled={!calculado}
        >
          <Save className="h-5 w-5 mr-2" /> Salvar Alterações
        </Button>
      </div>
    </div>
  );
}