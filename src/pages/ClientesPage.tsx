import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { formatarData, formatarMoeda, calcularStatusAluguel } from '@/utils/rentalCalculations';
import { Plus, Search, Users } from 'lucide-react';
import { Cliente } from '@/types';
import { toast } from 'sonner';

export default function ClientesPage() {
  const { clientes, adicionarCliente, atualizarCliente, getAlugueisCliente } = useApp();

  const [busca, setBusca] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [histDialog, setHistDialog] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    celular: '',
    endereco: '',
    observacoes: '',
    ativo: true
  });

  const resetForm = () => {
    setForm({
      nome: '',
      cpf: '',
      celular: '',
      endereco: '',
      observacoes: '',
      ativo: true
    });
    setEditando(null);
  };

  const abrirEditar = (c: Cliente) => {
    setEditando(c);
    setForm({
      nome: c.nome,
      cpf: c.cpf,
      celular: c.celular,
      endereco: c.endereco,
      observacoes: c.observacoes,
      ativo: c.ativo
    });
    setDialogOpen(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.cpf.trim()) {
      toast.error('Preencha pelo menos nome e CPF');
      return;
    }

    const cpfExiste = clientes.some(
      (c) => c.cpf === form.cpf && c.id !== editando?.id
    );

    if (cpfExiste) {
      toast.error('CPF já cadastrado');
      return;
    }

    try {
      setSalvando(true);

      if (editando) {
        await atualizarCliente({
          ...editando,
          ...form
        });
        toast.success('Cliente atualizado com sucesso');
      } else {
        await adicionarCliente(form);
        toast.success('Cliente cadastrado com sucesso');
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar cliente');
    } finally {
      setSalvando(false);
    }
  };

  const filtrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    return (
      !busca ||
      (c.nome ?? '').toLowerCase().includes(termo) ||
      (c.cpf ?? '').includes(termo)
    );
  });

  const hoje = new Date();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-6 w-6" /> Clientes
        </h2>

        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editando ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente e salve o cadastro.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nome Completo</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>CPF</Label>
                  <Input
                    value={form.cpf}
                    onChange={(e) => setForm((f) => ({ ...f, cpf: e.target.value }))}
                    placeholder="000.000.000-00"
                  />
                </div>

                <div>
                  <Label>Celular</Label>
                  <Input
                    value={form.celular}
                    onChange={(e) => setForm((f) => ({ ...f, celular: e.target.value }))}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div>
                <Label>Endereço</Label>
                <Input
                  value={form.endereco}
                  onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
                />
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={form.observacoes}
                  onChange={(e) => setForm((f) => ({ ...f, observacoes: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, ativo: c }))}
                />
                <Label>Ativo</Label>
              </div>

              <Button onClick={salvar} className="w-full" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative mb-4 max-w-md">
            <Search className="text-muted-foreground absolute left-3 top-3 h-4 w-4" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Celular</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtrados.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.nome}</TableCell>
                    <TableCell className="font-mono text-sm">{c.cpf}</TableCell>
                    <TableCell>{c.celular}</TableCell>
                    <TableCell className="max-w-48 truncate">{c.endereco}</TableCell>
                    <TableCell>
                      <Badge variant={c.ativo ? 'default' : 'secondary'}>
                        {c.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => abrirEditar(c)}>
                          Editar
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setHistDialog(c.id)}>
                          Histórico
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {filtrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      Nenhum cliente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!histDialog}
        onOpenChange={(open) => {
          if (!open) setHistDialog(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Histórico de Aluguéis</DialogTitle>
            <DialogDescription>
              Veja os contratos e valores já registrados para este cliente.
            </DialogDescription>
          </DialogHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Início</TableHead>
                <TableHead>Previsão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {histDialog &&
                getAlugueisCliente(histDialog).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="font-mono text-sm">{a.numero_contrato}</TableCell>
                    <TableCell>{formatarData(a.data_inicio)}</TableCell>
                    <TableCell>{formatarData(a.data_prevista_devolucao)}</TableCell>
                    <TableCell>{formatarMoeda(a.valor_previsto)}</TableCell>
                    <TableCell>
                      <StatusBadge
                        status={
                          a.status === 'finalizado'
                            ? 'finalizado'
                            : calcularStatusAluguel(a.data_prevista_devolucao, hoje)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}

              {histDialog && getAlugueisCliente(histDialog).length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Este cliente ainda não possui aluguéis.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  );
}