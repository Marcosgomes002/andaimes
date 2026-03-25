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
  // Inicializa o formulário com os dados que vêm do Contexto
  const [form, setForm] = useState(dadosEmpresa);
  const [salvando, setSalvando] = useState(false);

  // Sincroniza o formulário sempre que os dados da empresa carregarem do banco
  useEffect(() => {
    if (dadosEmpresa) {
      setForm(dadosEmpresa);
    }
  }, [dadosEmpresa]);

  const salvar = async () => {
    try {
      setSalvando(true);
      // Envia os dados atualizados para a função que grava no Supabase
      await atualizarDadosEmpresa(form);
      toast.success('Dados da empresa atualizados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
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
              value={form?.name || ''}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: ConstruMaia Material de Construção"
            />
          </div>

          <div>
            <Label>CNPJ</Label>
            <Input
              value={form?.cnpj || ''}
              onChange={(e) => setForm((f) => ({ ...f, cnpj: e.target.value }))}
              placeholder="00.000.000/0000-00"
            />
          </div>

          <div>
            <Label>Endereço</Label>
            <Input
              value={form?.address || ''}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Rua, Número, Bairro, Cidade"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Telefone</Label>
              <Input
                value={form?.phone || ''}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="(00) 0000-0000"
              />
            </div>

            <div>
              <Label>WhatsApp</Label>
              <Input
                value={form?.whatsapp || ''}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <div>
            <Label>E-mail</Label>
            <Input
              type="email"
              value={form?.email || ''}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="empresa@email.com"
            />
          </div>

          <div>
            <Label>Responsável</Label>
            <Input
              value={form?.responsible_name || ''}
              onChange={(e) => setForm((f) => ({ ...f, responsible_name: e.target.value }))}
              placeholder="Nome do responsável"
            />
          </div>

          <Button 
            type="button" 
            onClick={salvar} 
            disabled={salvando}
            className="w-full md:w-auto"
          >
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