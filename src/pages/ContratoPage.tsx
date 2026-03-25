import { useApp } from '@/contexts/AppContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { formatarMoeda, formatarData } from '@/utils/rentalCalculations';
import { Printer, ArrowLeft } from 'lucide-react';

export default function ContratoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAluguel, getCliente, getProduto, dadosEmpresa } = useApp();

  const aluguel = getAluguel(id || '');

  if (!aluguel) {
    return (
      <div className="p-6">
        <p>Contrato não encontrado.</p>
      </div>
    );
  }

  const cliente = getCliente(aluguel.cliente_id);

  const subtotalItens = aluguel.itens.reduce(
    (soma, item) => soma + (item.subtotal_previsto || 0),
    0
  );

  const taxaEntrega = aluguel.taxa_entrega || 0;
  const valorTotalContrato = subtotalItens + taxaEntrega;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="no-print flex gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Button onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      <div className="print-contract mx-auto w-full rounded-lg border bg-white px-8 py-6 text-black print:border-0 print:px-2 print:py-1 print:shadow-none">
        <div className="mb-4 text-center">
          <h1 className="text-4xl font-bold leading-none print:text-[20px]">
            {dadosEmpresa.nome}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground print:text-[11px]">
            {dadosEmpresa.endereco}
          </p>
          <p className="text-sm text-muted-foreground print:text-[11px]">
            Tel: {dadosEmpresa.telefone} | WhatsApp: {dadosEmpresa.whatsapp} | {dadosEmpresa.email}
          </p>
          <p className="text-sm text-muted-foreground print:text-[11px]">
            CNPJ: {dadosEmpresa.cnpj}
          </p>
          <div className="mt-3 border-b" />
        </div>

        <div className="mb-6 text-center print:mb-4">
          <h2 className="text-[42px] font-bold leading-tight print:text-[24px]">
            CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS
          </h2>
          <p className="font-mono-contract mt-2 text-2xl font-bold print:mt-1 print:text-[16px]">
            {aluguel.numero_contrato}
          </p>
        </div>

        <div className="mb-5 text-[15px] print:mb-3 print:text-[12px]">
          <h3 className="mb-2 text-2xl font-bold print:mb-1 print:text-[15px]">
            LOCATÁRIO
          </h3>
          <p><strong>Nome:</strong> {cliente?.nome || ''}</p>
          <p><strong>CPF:</strong> {cliente?.cpf || ''}</p>
          <p><strong>Telefone:</strong> {cliente?.celular || ''}</p>
          <p><strong>Endereço:</strong> {cliente?.endereco || ''}</p>
        </div>

        <div className="mb-5 text-[15px] print:mb-3 print:text-[12px]">
          <h3 className="mb-2 text-2xl font-bold print:mb-1 print:text-[15px]">
            DADOS DA LOCAÇÃO
          </h3>
          <p><strong>Data do Aluguel:</strong> {formatarData(aluguel.data_inicio)}</p>
          <p><strong>Prazo Contratado:</strong> {aluguel.dias_contratados} dias cobráveis</p>
          <p><strong>Data Prevista de Devolução:</strong> {formatarData(aluguel.data_prevista_devolucao)}</p>
        </div>

        <div className="mb-5 text-[15px] print:mb-3 print:text-[12px]">
          <h3 className="mb-2 text-2xl font-bold print:mb-1 print:text-[15px]">
            ITENS LOCADOS
          </h3>

          <table className="w-full text-[15px] print:text-[12px]">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2 text-left">Item</th>
                <th className="py-2 text-center">Qtd</th>
                <th className="py-2 text-right">Diária</th>
                <th className="py-2 text-right">Subtotal</th>
              </tr>
            </thead>

            <tbody>
              {aluguel.itens.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-2">{getProduto(item.produto_id)?.nome || ''}</td>
                  <td className="py-2 text-center">{item.quantidade}</td>
                  <td className="py-2 text-right">{formatarMoeda(item.valor_diaria || 0)}</td>
                  <td className="py-2 text-right">{formatarMoeda(item.subtotal_previsto || 0)}</td>
                </tr>
              ))}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 text-right font-semibold">
                  Subtotal dos Itens:
                </td>
                <td className="pt-3 text-right font-semibold">
                  {formatarMoeda(subtotalItens)}
                </td>
              </tr>

              {taxaEntrega > 0 && (
                <tr>
                  <td colSpan={3} className="pt-2 text-right font-semibold">
                    Taxa de Entrega:
                  </td>
                  <td className="pt-2 text-right font-semibold">
                    {formatarMoeda(taxaEntrega)}
                  </td>
                </tr>
              )}

              <tr className="border-t-2 border-black">
                <td colSpan={3} className="pt-2 text-right text-lg font-bold print:text-[13px]">
                  VALOR TOTAL DO CONTRATO:
                </td>
                <td className="pt-2 text-right text-lg font-bold print:text-[13px]">
                  {formatarMoeda(valorTotalContrato)}
                </td>
              </tr>
            </tfoot>
          </table>

          {taxaEntrega > 0 && aluguel.observacoes_entrega && (
            <p className="mt-3">
              <strong>Observação da Entrega:</strong> {aluguel.observacoes_entrega}
            </p>
          )}

          {aluguel.pagamento_antecipado && (
            <p className="mt-3">
              <strong>Pagamento Antecipado:</strong> {formatarMoeda(aluguel.valor_antecipado || 0)}
            </p>
          )}
        </div>

        {aluguel.observacoes && (
          <div className="mb-5 text-[15px] print:mb-3 print:text-[12px]">
            <h3 className="mb-2 text-2xl font-bold print:mb-1 print:text-[15px]">
              OBSERVAÇÕES
            </h3>
            <p>{aluguel.observacoes}</p>
          </div>
        )}

        <div className="mb-5 text-[13px] leading-7 text-muted-foreground print:mb-3 print:text-[11px] print:leading-5">
          <h3 className="mb-2 text-2xl font-bold text-black print:mb-1 print:text-[15px]">
            CLÁUSULAS
          </h3>
          <p>1. O LOCATÁRIO se compromete a devolver os equipamentos no prazo estipulado e em boas condições de uso.</p>
          <p>2. Em caso de atraso na devolução, será cobrada diária adicional pelos dias excedentes.</p>
          <p>3. Domingos e feriados cadastrados não são cobrados.</p>
          <p>4. Danos, avarias ou perdas dos equipamentos serão cobrados à parte, conforme avaliação.</p>
          <p>5. O LOCATÁRIO é responsável pela guarda e conservação dos equipamentos durante o período de locação.</p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-10 text-center text-[14px] print:mt-8 print:text-[11px]">
          <div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">{dadosEmpresa.nome}</p>
              <p className="text-muted-foreground">LOCADOR</p>
            </div>
          </div>

          <div>
            <div className="border-t border-black pt-2">
              <p className="font-bold">{cliente?.nome || ''}</p>
              <p className="text-muted-foreground">LOCATÁRIO</p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[11px] text-muted-foreground print:mt-4 print:text-[10px]">
          <p>
            Data: {formatarData(aluguel.data_inicio)} | {dadosEmpresa.nome} | {dadosEmpresa.telefone}
          </p>
        </div>
      </div>
    </div>
  );
}