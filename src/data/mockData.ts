import { Cliente, Produto, Aluguel, DiaNaoCobrado, MovimentacaoProduto, DadosEmpresa } from '@/types';

export const dadosEmpresaInicial: DadosEmpresa = {
  nome: 'LocaFácil Andaimes',
  cnpj: '00.000.000/0001-00',
  endereco: 'Rua Exemplo, 123 - Centro - Cidade/UF',
  telefone: '(00) 0000-0000',
  whatsapp: '(00) 00000-0000',
  email: 'contato@locafacil.com.br',
  responsavel: 'Responsável da Empresa',
};

export const clientesIniciais: Cliente[] = [
  {
    id: 'c1', nome: 'João da Silva', cpf: '123.456.789-00', celular: '(11) 99999-0001',
    endereco: 'Rua A, 100 - Bairro Centro - São Paulo/SP', observacoes: 'Cliente fiel',
    ativo: true, created_at: '2025-01-10', updated_at: '2025-01-10',
  },
  {
    id: 'c2', nome: 'Maria Oliveira', cpf: '987.654.321-00', celular: '(11) 99999-0002',
    endereco: 'Av B, 200 - Bairro Norte - São Paulo/SP', observacoes: '',
    ativo: true, created_at: '2025-02-05', updated_at: '2025-02-05',
  },
  {
    id: 'c3', nome: 'Carlos Santos', cpf: '111.222.333-44', celular: '(11) 99999-0003',
    endereco: 'Rua C, 300 - Bairro Sul - São Paulo/SP', observacoes: 'Obra grande',
    ativo: true, created_at: '2025-03-01', updated_at: '2025-03-01',
  },
];

export const produtosIniciais: Produto[] = [
  { id: 'p1', nome: 'Andaime Tubular', categoria: 'Andaimes', descricao: 'Andaime tubular 1,5m', valor_diaria: 15, quantidade_total: 100, quantidade_disponivel: 80, quantidade_alugada: 20, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'p2', nome: 'Prancha Metálica', categoria: 'Andaimes', descricao: 'Prancha metálica para andaime', valor_diaria: 8, quantidade_total: 200, quantidade_disponivel: 170, quantidade_alugada: 30, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'p3', nome: 'Roda para Andaime', categoria: 'Andaimes', descricao: 'Roda com trava', valor_diaria: 5, quantidade_total: 50, quantidade_disponivel: 45, quantidade_alugada: 5, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'p4', nome: 'Escora Metálica 3m', categoria: 'Escoras', descricao: 'Escora metálica regulável 3m', valor_diaria: 3, quantidade_total: 300, quantidade_disponivel: 250, quantidade_alugada: 50, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'p5', nome: 'Betoneira 400L', categoria: 'Equipamentos', descricao: 'Betoneira elétrica 400 litros', valor_diaria: 80, quantidade_total: 5, quantidade_disponivel: 3, quantidade_alugada: 2, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'p6', nome: 'Compactador de Solo', categoria: 'Equipamentos', descricao: 'Compactador tipo sapo', valor_diaria: 120, quantidade_total: 3, quantidade_disponivel: 2, quantidade_alugada: 1, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'p7', nome: 'Escada 7m', categoria: 'Escadas', descricao: 'Escada extensível alumínio 7m', valor_diaria: 25, quantidade_total: 10, quantidade_disponivel: 8, quantidade_alugada: 2, ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
];

export const alugueisIniciais: Aluguel[] = [
  {
    id: 'a1', numero_contrato: 'LC-2025-0001', cliente_id: 'c1',
    data_inicio: '2025-03-10', dias_contratados: 15, data_prevista_devolucao: '2025-03-28',
    data_devolucao_real: null, pagamento_antecipado: true, valor_antecipado: 3375,
    status: 'ativo', valor_previsto: 3375, valor_adicional_atraso: 0, valor_total_final: 0,
    valor_avaria: 0, observacoes_avaria: '', observacoes: 'Obra residencial', taxa_entrega: 0, observacoes_entrega: '',
    itens: [
      { id: 'i1', aluguel_id: 'a1', produto_id: 'p1', quantidade: 10, valor_diaria: 15, subtotal_previsto: 2250, subtotal_final: 0, quantidade_devolvida: 0, created_at: '2025-03-10', updated_at: '2025-03-10' },
      { id: 'i2', aluguel_id: 'a1', produto_id: 'p2', quantidade: 15, valor_diaria: 8, subtotal_previsto: 1800, subtotal_final: 0, quantidade_devolvida: 0, created_at: '2025-03-10', updated_at: '2025-03-10' },
    ],
    created_at: '2025-03-10', updated_at: '2025-03-10',
  },
  {
    id: 'a2', numero_contrato: 'LC-2025-0002', cliente_id: 'c2',
    data_inicio: '2025-03-14', dias_contratados: 10, data_prevista_devolucao: '2025-03-26',
    data_devolucao_real: null, pagamento_antecipado: false, valor_antecipado: 0,
    status: 'ativo', valor_previsto: 2400, valor_adicional_atraso: 0, valor_total_final: 0,
    valor_avaria: 0, observacoes_avaria: '', observacoes: '', taxa_entrega: 150, observacoes_entrega: 'Entrega na obra centro',
    itens: [
      { id: 'i3', aluguel_id: 'a2', produto_id: 'p5', quantidade: 2, valor_diaria: 80, subtotal_previsto: 1600, subtotal_final: 0, quantidade_devolvida: 0, created_at: '2025-03-14', updated_at: '2025-03-14' },
      { id: 'i4', aluguel_id: 'a2', produto_id: 'p4', quantidade: 50, valor_diaria: 3, subtotal_previsto: 1500, subtotal_final: 0, quantidade_devolvida: 0, created_at: '2025-03-14', updated_at: '2025-03-14' },
    ],
    created_at: '2025-03-14', updated_at: '2025-03-14',
  },
  {
    id: 'a3', numero_contrato: 'LC-2025-0003', cliente_id: 'c3',
    data_inicio: '2025-02-01', dias_contratados: 20, data_prevista_devolucao: '2025-02-27',
    data_devolucao_real: '2025-02-27', pagamento_antecipado: false, valor_antecipado: 0,
    status: 'finalizado', valor_previsto: 5000, valor_adicional_atraso: 0, valor_total_final: 5000,
    valor_avaria: 0, observacoes_avaria: '', observacoes: 'Obra comercial concluída', taxa_entrega: 0, observacoes_entrega: '',
    itens: [
      { id: 'i5', aluguel_id: 'a3', produto_id: 'p1', quantidade: 10, valor_diaria: 15, subtotal_previsto: 3000, subtotal_final: 3000, quantidade_devolvida: 10, created_at: '2025-02-01', updated_at: '2025-02-27' },
      { id: 'i6', aluguel_id: 'a3', produto_id: 'p7', quantidade: 2, valor_diaria: 25, subtotal_previsto: 1000, subtotal_final: 1000, quantidade_devolvida: 2, created_at: '2025-02-01', updated_at: '2025-02-27' },
    ],
    created_at: '2025-02-01', updated_at: '2025-02-27',
  },
];

export const diasNaoCobradosIniciais: DiaNaoCobrado[] = [
  { id: 'd1', nome: 'Ano Novo', data: '2025-01-01', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd2', nome: 'Carnaval', data: '2025-03-03', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd3', nome: 'Carnaval', data: '2025-03-04', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd4', nome: 'Sexta-feira Santa', data: '2025-04-18', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd5', nome: 'Tiradentes', data: '2025-04-21', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd6', nome: 'Dia do Trabalho', data: '2025-05-01', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd7', nome: 'Independência', data: '2025-09-07', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd8', nome: 'Nossa Sra. Aparecida', data: '2025-10-12', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd9', nome: 'Finados', data: '2025-11-02', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd10', nome: 'Proclamação da República', data: '2025-11-15', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
  { id: 'd11', nome: 'Natal', data: '2025-12-25', tipo: 'feriado_nacional', ativo: true, created_at: '2025-01-01', updated_at: '2025-01-01' },
];

export const movimentacoesIniciais: MovimentacaoProduto[] = [
  { id: 'm1', produto_id: 'p1', tipo_movimentacao: 'saida', quantidade: 10, referencia: 'LC-2025-0001', observacoes: 'Aluguel João da Silva', created_at: '2025-03-10' },
  { id: 'm2', produto_id: 'p2', tipo_movimentacao: 'saida', quantidade: 15, referencia: 'LC-2025-0001', observacoes: 'Aluguel João da Silva', created_at: '2025-03-10' },
  { id: 'm3', produto_id: 'p5', tipo_movimentacao: 'saida', quantidade: 2, referencia: 'LC-2025-0002', observacoes: 'Aluguel Maria Oliveira', created_at: '2025-03-14' },
  { id: 'm4', produto_id: 'p4', tipo_movimentacao: 'saida', quantidade: 50, referencia: 'LC-2025-0002', observacoes: 'Aluguel Maria Oliveira', created_at: '2025-03-14' },
  { id: 'm5', produto_id: 'p1', tipo_movimentacao: 'entrada', quantidade: 10, referencia: 'LC-2025-0003', observacoes: 'Devolução Carlos Santos', created_at: '2025-02-27' },
  { id: 'm6', produto_id: 'p7', tipo_movimentacao: 'entrada', quantidade: 2, referencia: 'LC-2025-0003', observacoes: 'Devolução Carlos Santos', created_at: '2025-02-27' },
];
