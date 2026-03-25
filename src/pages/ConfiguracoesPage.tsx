import { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function ConfiguracoesPage() {
  const { dadosEmpresa, atualizarDadosEmpresa } = useApp();
  const [form, setForm] = useState(dadosEmpresa);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    setForm(dadosEmpresa);
  }, [dadosEmpresa]);

  const salvar = async () => {
    try {
      setSalvando(true);
      await atualizarDadosEmpresa(form);
      toast.success('Dados da empresa atualizados com sucesso!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao salvar dados da empresa no banco.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <Settings className="h-6 w-6" /> Configurações
      </h2>

      <Card>
        <CardHeader>
          <CardTitle>Dados da Empresa</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label>Nome da Empresa</Label>
            <Input
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>

          <div>
            <Label>CNPJ</Label>
            <Input
              value={form.cnpj}
              onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
            />
          </div>

          <div>
            <Label>Endereço</Label>
            <Input
              value={form.endereco}
              onChange={(e) => setForm((f) => ({ ...f, endereco: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefone</Label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm((f) => ({ ...f, telefone: e.target.value }))}
              />
            </div>

            <div>
              <Label>WhatsApp</Label>
              <Input
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label>E-mail</Label>
            <Input
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>

          <div>
            <Label>Responsável</Label>
            <Input
              value={form.responsavel}
              onChange={(e) => setForm((f) => ({ ...f, responsavel: e.target.value }))}
            />
          </div>

          <Button type="button" onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Configurações'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regras de Cobrança</CardTitle>
        </CardHeader>

        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>Domingos</strong> são automaticamente excluídos da cobrança.</p>
          <p>• <strong>Feriados</strong> e dias cadastrados em "Dias Não Cobrados" são descontados.</p>
          <p>• <strong>Alerta amarelo</strong>: aluguéis com até 2 dias para vencer.</p>
          <p>• <strong>Contratos</strong>: modelo simples com campos para assinatura.</p>
          <p>• <strong>Avaria/Perda</strong>: campo disponível na devolução para registro de valor.</p>
        </CardContent>
      </Card>
    </div>
  );
}