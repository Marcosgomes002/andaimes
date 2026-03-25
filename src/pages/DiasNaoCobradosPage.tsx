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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { formatarData } from '@/utils/rentalCalculations';
import { Plus, CalendarOff, Trash2 } from 'lucide-react';
import { TipoDiaNaoCobrado } from '@/types';

const tipoLabels: Record<TipoDiaNaoCobrado, string> = {
  feriado_nacional: 'Feriado Nacional',
  feriado_local: 'Feriado Local',
  dia_nao_cobrado: 'Dia Não Cobrado',
};

export default function DiasNaoCobradosPage() {
  const { diasNaoCobrados, adicionarDiaNaoCobrado, atualizarDiaNaoCobrado, removerDiaNaoCobrado } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    data: '',
    tipo: 'feriado_nacional' as TipoDiaNaoCobrado,
    ativo: true,
  });

  const salvar = () => {
    if (!form.nome || !form.data) return;
    adicionarDiaNaoCobrado(form);
    setDialogOpen(false);
    setForm({ nome: '', data: '', tipo: 'feriado_nacional', ativo: true });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <CalendarOff className="h-6 w-6" /> Dias Não Cobrados
        </h2>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" /> Novo Dia
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar Dia Não Cobrado</DialogTitle>
              <DialogDescription>
                Cadastre feriados e dias extras que não devem entrar na cobrança.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Nome / Motivo</Label>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                />
              </div>

              <div>
                <Label>Data</Label>
                <Input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm((f) => ({ ...f, data: e.target.value }))}
                />
              </div>

              <div>
                <Label>Tipo</Label>
                <Select
                  value={form.tipo}
                  onValueChange={(v) => setForm((f) => ({ ...f, tipo: v as TipoDiaNaoCobrado }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(tipoLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={form.ativo}
                  onCheckedChange={(c) => setForm((f) => ({ ...f, ativo: c }))}
                />
                <Label>Ativo</Label>
              </div>

              <Button onClick={salvar} className="w-full">
                Salvar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-l-4 border-l-status-warning">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            ⚠️ Domingos são automaticamente excluídos da cobrança. Cadastre aqui apenas feriados e dias extras.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {diasNaoCobrados.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium">{d.nome}</TableCell>
                  <TableCell>{formatarData(d.data)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{tipoLabels[d.tipo]}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.ativo ? 'default' : 'secondary'}>
                      {d.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => atualizarDiaNaoCobrado({ ...d, ativo: !d.ativo })}
                      >
                        {d.ativo ? 'Desativar' : 'Ativar'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removerDiaNaoCobrado(d.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}