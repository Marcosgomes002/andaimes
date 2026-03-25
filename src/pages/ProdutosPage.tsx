import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatarMoeda } from '@/utils/rentalCalculations';
import { Plus, Package, Trash2 } from 'lucide-react';
import { Produto } from '@/types';
import { toast } from 'sonner';

const categorias = ['Andaimes', 'Escoras', 'Equipamentos', 'Escadas', 'Ferramentas', 'Outros'];

export default function ProdutosPage() {
  const {
    produtos,
    adicionarProduto,
    atualizarProduto,
    removerProduto,
    produtoTemAluguelAtivo,
  } = useApp();

  const [busca, setBusca] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [editando, setEditando] = useState<Produto | null>(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    categoria: 'Andaimes',
    descricao: '',
    valor_diaria: '',
    quantidade_total: '',
    ativo: true,
  });

  const resetForm = () => {
    setForm({
      nome: '',
      categoria: 'Andaimes',
      descricao: '',
      valor_diaria: '',
      quantidade_total: '',
      ativo: true,
    });
    setEditando(null);
    setMostrarFormulario(false);
  };

  const abrirNovo = () => {
    resetForm();
    setMostrarFormulario(true);
  };

  const abrirEditar = (p: Produto) => {
    setEditando(p);
    setForm({
      nome: p.nome ?? '',
      categoria: p.categoria ?? 'Andaimes',
      descricao: p.descricao ?? '',
      valor_diaria: String(p.valor_diaria ?? ''),
      quantidade_total: String(p.quantidade_total ?? ''),
      ativo: !!p.ativo,
    });
    setMostrarFormulario(true);
  };

  const salvar = async () => {
    const valDiaria = parseFloat(form.valor_diaria) || 0;
    const qtdTotal = parseInt(form.quantidade_total) || 0;

    if (!form.nome.trim()) {
      toast.error('Informe o nome do produto');
      return;
    }

    if (valDiaria <= 0) {
      toast.error('Informe um valor de diária válido');
      return;
    }

    if (qtdTotal <= 0) {
      toast.error('Informe uma quantidade válida');
      return;
    }

    try {
      setSalvando(true);

      if (editando) {
        const diffQtd = qtdTotal - (editando.quantidade_total ?? 0);
        const novaDisponivel = (editando.quantidade_disponivel ?? 0) + diffQtd;

        if (novaDisponivel < 0) {
          toast.error('A quantidade total não pode ser menor que a quantidade já alugada');
          return;
        }

        await atualizarProduto({
          ...editando,
          nome: form.nome,
          categoria: form.categoria,
          descricao: form.descricao,
          valor_diaria: valDiaria,
          quantidade_total: qtdTotal,
          quantidade_disponivel: novaDisponivel,
          quantidade_alugada: editando.quantidade_alugada ?? 0,
          ativo: form.ativo,
        });

        toast.success('Produto atualizado com sucesso');
      } else {
        await adicionarProduto({
          nome: form.nome,
          categoria: form.categoria,
          descricao: form.descricao,
          valor_diaria: valDiaria,
          quantidade_total: qtdTotal,
          quantidade_disponivel: qtdTotal,
          quantidade_alugada: 0,
          ativo: form.ativo,
        });

        toast.success('Produto cadastrado com sucesso');
      }

      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar produto');
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (p: Produto) => {
    if (produtoTemAluguelAtivo(p.id)) {
      const desativar = window.confirm(
        `O produto "${p.nome}" está em aluguel ativo. Deseja apenas desativar?`
      );

      if (!desativar) return;

      try {
        await atualizarProduto({ ...p, ativo: false });
        toast.success(`${p.nome} foi desativado.`);
      } catch (error) {
        console.error(error);
        toast.error('Erro ao desativar produto');
      }
      return;
    }

    const confirmar = window.confirm(`Tem certeza que deseja excluir o produto "${p.nome}"?`);
    if (!confirmar) return;

    try {
      const result = await removerProduto(p.id);

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao excluir produto');
    }
  };

  const filtrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return produtos.filter((p) => {
      const nome = (p.nome ?? '').toLowerCase();
      const categoria = p.categoria ?? '';

      if (termo && !nome.includes(termo)) return false;
      if (filtroCategoria !== 'todas' && categoria !== filtroCategoria) return false;

      return true;
    });
  }, [produtos, busca, filtroCategoria]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Package className="h-6 w-6" /> Produtos
        </h2>

        <Button type="button" onClick={abrirNovo}>
          <Plus className="mr-1 h-4 w-4" /> Novo Produto
        </Button>
      </div>

      {mostrarFormulario && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <h3 className="text-lg font-semibold">
              {editando ? 'Editar Produto' : 'Novo Produto'}
            </h3>

            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                placeholder="Nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <select
                value={form.categoria}
                onChange={(e) => setForm((f) => ({ ...f, categoria: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {categorias.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descrição"
                value={form.descricao}
                onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Valor da diária</Label>
                <Input
                  type="number"
                  placeholder="Valor diária"
                  value={form.valor_diaria}
                  onChange={(e) => setForm((f) => ({ ...f, valor_diaria: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Quantidade total</Label>
                <Input
                  type="number"
                  placeholder="Quantidade"
                  value={form.quantidade_total}
                  onChange={(e) => setForm((f) => ({ ...f, quantidade_total: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={form.ativo}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, ativo: checked }))}
              />
              <Label>Ativo</Label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>

              <Button type="button" variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="Buscar..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />

            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm sm:w-[220px]"
            >
              <option value="todas">Todas</option>
              {categorias.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Diária</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Disponível</TableHead>
                  <TableHead>Alugada</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtrados.length > 0 ? (
                  filtrados.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>{p.nome}</TableCell>
                      <TableCell>{p.categoria}</TableCell>
                      <TableCell>{formatarMoeda(p.valor_diaria ?? 0)}</TableCell>
                      <TableCell>{p.quantidade_total ?? 0}</TableCell>
                      <TableCell>{p.quantidade_disponivel ?? 0}</TableCell>
                      <TableCell>{p.quantidade_alugada ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={p.ativo ? 'default' : 'secondary'}>
                          {p.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button type="button" size="sm" variant="outline" onClick={() => abrirEditar(p)}>
                            Editar
                          </Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => handleExcluir(p)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground">
                      Nenhum produto encontrado.
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