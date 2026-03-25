import { useState, useMemo, useEffect } from 'react';
import { useApp } from '../contexts/AppContext'; // Ajustado para a pasta certa
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
  const { produtos, diasNaoCobrados, atualizarAluguel, getAluguel, getProduto } = useApp();
  const navigate = useNavigate();
  
  const aluguelOriginal = useMemo(() => getAluguel(id || ''), [id, getAluguel]);

  const [dataInicio, setDataInicio] = useState('');
  const [dataPrevista, setDataPrevista] = useState('');
  const [valorAntecipado, setValorAntecipado] = useState('');
  const [itens, setItens] = useState<ItemForm[]>([]);
  const [calculado, setCalculado] = useState(false);
  const [taxaEntrega, setTaxaEntrega] = useState('');

  useEffect(() => {
    if (aluguelOriginal) {
      setDataInicio(aluguelOriginal.data_inicio);
      setDataPrevista(aluguelOriginal.data_prevista_devolucao);
      setValorAntecipado(aluguelOriginal.valor_antecipado?.toString() || '0');
      setTaxaEntrega(aluguelOriginal.taxa_entrega?.toString() || '0');
      
      const itensFormatados = aluguelOriginal.itens.map((it: any) => ({
        produto_id: it.produto_id,
        quantidade: it.quantidade.toString(),
      }));
      setItens(itensFormatados);
    }
  }, [aluguelOriginal]);

  useEffect(() => {
    setCalculado(false);
  }, [dataInicio, dataPrevista, itens, taxaEntrega]);

  const diasCobrados = useMemo(() => {
    if (!dataInicio || !dataPrevista) return 0;
    return calcularDiasCobrados(dataInicio, dataPrevista, diasNaoCobrados);
  }, [dataInicio, dataPrevista, diasNaoCobrados]);

  const resumoItens = useMemo(() => {
    return itens.map((item) => {
      const produto = getProduto(item.produto_id);
      return {
        ...item,
        nome: produto?.nome || 'Produto s/ nome', // Garante que o nome apareça aqui
        valor_diaria: produto?.valor_diaria || 0,
        subtotal: (produto?.valor_diaria || 0) * (parseInt(item.quantidade) || 0) * diasCobrados
      };
    });
  }, [itens, diasCobrados, getProduto]);

  const totalPrevisto = resumoItens.reduce((acc, i) => acc + i.subtotal, 0) + (parseFloat(taxaEntrega) || 0);

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
        itens: resumoItens.map(it => ({
          produto_id: it.produto_id,
          quantidade: parseInt(it.quantidade),
          valor_diaria: it.valor_diaria
        }))
      });
      toast.success("Aluguel atualizado!");
      navigate('/alugueis');
    } catch (error) {
      toast.error("Erro ao salvar.");
    }
  };

  if (!aluguelOriginal) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/alugueis')}><ArrowLeft className="h-4 w-4" /></Button>
        <h2 className="text-2xl font-bold">Editar Contrato: {aluguelOriginal.numero_contrato}</h2>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>Início</Label><Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} /></div>
            <div><Label>Previsão</Label><Input type="date" value={dataPrevista} onChange={(e) => setDataPrevista(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm uppercase">Produtos</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setItens([...itens, { produto_id: '', quantidade: '1' }])}><Plus className="h-4 w-4 mr-1" /> Adicionar</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {itens.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end border-b pb-4">
              <div className="flex-1">
                <Label className="text-xs">Produto</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={item.produto_id}
                  onChange={(e) => setItens(itens.map((it, i) => i === idx ? { ...it, produto_id: e.target.value } : it))}
                >
                  <option value="">Selecione</option>
                  {produtos.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} -- (Disp: {p.quantidade_disponivel})
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-24">
                <Label className="text-xs">Qtd</Label>
                <Input type="number" value={item.quantidade} onChange={(e) => setItens(itens.map((it, i) => i === idx ? { ...it, quantidade: e.target.value } : it))} />
              </div>
              <Button variant="ghost" size="icon" onClick={() => setItens(itens.filter((_, i) => i !== idx))}><Trash2 className="h-4 w-4 text-red-500" /></Button>
            </div>
          ))}
          <Button variant="secondary" className="w-full mt-2" onClick={() => setCalculado(true)}>
            <Calculator className="h-4 w-4 mr-2" /> Recalcular Total
          </Button>
        </CardContent>
      </Card>

      {calculado && (
        <Card className="border-primary border-2 bg-primary/5">
          <CardContent className="pt-6 flex justify-between items-center font-bold">
            <span>Novo Total:</span>
            <span className="text-xl text-primary">{formatarMoeda(totalPrevisto)}</span>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate('/alugueis')}>Cancelar</Button>
        <Button className="flex-1" onClick={handleSalvar} disabled={!calculado}><Save className="h-4 w-4 mr-2" /> Salvar</Button>
      </div>
    </div>
  );
}