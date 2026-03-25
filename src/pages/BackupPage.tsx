import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { toast } from 'sonner';

function downloadFile(data: string, filename: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}

function escapeCSV(value: unknown) {
  const text = String(value ?? '');
  if (text.includes(';') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCSV(headers: string[], rows: string[][]): string {
  return [
    headers.map(escapeCSV).join(';'),
    ...rows.map((r) => r.map(escapeCSV).join(';')),
  ].join('\n');
}

export default function BackupPage() {
  const { clientes, produtos, alugueis, diasNaoCobrados, movimentacoes } = useApp();

  const exportarJSON = (data: unknown, nome: string) => {
    downloadFile(
      JSON.stringify(data, null, 2),
      `${nome}.json`,
      'application/json;charset=utf-8'
    );
    toast.success(`${nome}.json exportado!`);
  };

  const exportarClientesCSV = () => {
    const csv = toCSV(
      ['Nome', 'CPF', 'Celular', 'Endereço', 'Status'],
      clientes.map((c) => [
        c.nome ?? '',
        c.cpf ?? '',
        c.celular ?? '',
        c.endereco ?? '',
        c.ativo ? 'Ativo' : 'Inativo',
      ])
    );

    downloadFile(csv, 'clientes.csv', 'text/csv;charset=utf-8');
    toast.success('clientes.csv exportado!');
  };

  const exportarProdutosCSV = () => {
    const csv = toCSV(
      ['Nome', 'Categoria', 'Diária', 'Total', 'Disponível', 'Alugada'],
      produtos.map((p) => [
        p.nome ?? '',
        p.categoria ?? '',
        String(p.valor_diaria ?? 0),
        String(p.quantidade_total ?? 0),
        String(p.quantidade_disponivel ?? 0),
        String(p.quantidade_alugada ?? 0),
      ])
    );

    downloadFile(csv, 'produtos.csv', 'text/csv;charset=utf-8');
    toast.success('produtos.csv exportado!');
  };

  const exportarAlugueisCSV = () => {
    const csv = toCSV(
      ['Contrato', 'Cliente ID', 'Início', 'Previsão', 'Status', 'Valor Previsto', 'Valor Final'],
      alugueis.map((a) => [
        a.numero_contrato ?? '',
        a.cliente_id ?? '',
        a.data_inicio ?? '',
        a.data_prevista_devolucao ?? '',
        a.status ?? '',
        String(a.valor_previsto ?? 0),
        String(a.valor_total_final ?? 0),
      ])
    );

    downloadFile(csv, 'alugueis.csv', 'text/csv;charset=utf-8');
    toast.success('alugueis.csv exportado!');
  };

  const backupCompleto = () => {
    const data = {
      clientes,
      produtos,
      alugueis,
      diasNaoCobrados,
      movimentacoes,
      exportadoEm: new Date().toISOString(),
    };

    exportarJSON(data, 'backup_completo_locafacil');
  };

  return (
    <div className="space-y-6">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <Download className="h-6 w-6" /> Backup e Exportação
      </h2>

      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <Button type="button" onClick={backupCompleto} size="lg" className="w-full sm:w-auto">
            <Download className="mr-2 h-5 w-5" />
            Fazer Backup Completo (JSON)
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Clientes</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={exportarClientesCSV}>
              CSV
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportarJSON(clientes, 'clientes')}>
              JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Produtos</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={exportarProdutosCSV}>
              CSV
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportarJSON(produtos, 'produtos')}>
              JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aluguéis</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={exportarAlugueisCSV}>
              CSV
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => exportarJSON(alugueis, 'alugueis')}>
              JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dias Não Cobrados</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportarJSON(diasNaoCobrados, 'dias_nao_cobrados')}
            >
              JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Movimentações</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportarJSON(movimentacoes, 'movimentacoes')}
            >
              JSON
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financeiro</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const fin = alugueis.map((a) => ({
                  contrato: a.numero_contrato,
                  previsto: a.valor_previsto,
                  antecipado: a.valor_antecipado,
                  atraso: a.valor_adicional_atraso,
                  avaria: a.valor_avaria,
                  final: a.valor_total_final,
                  status: a.status,
                }));

                exportarJSON(fin, 'financeiro');
              }}
            >
              JSON
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}