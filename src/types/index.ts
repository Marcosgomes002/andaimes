export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  celular: string;
  endereco: string;
  observacoes: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Produto {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  valor_diaria: number;
  quantidade_total: number;
  quantidade_disponivel: number;
  quantidade_alugada: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface ItemAluguel {
  id: string;
  aluguel_id: string;
  produto_id: string;
  quantidade: number;
  valor_diaria: number;
  subtotal_previsto: number;
  subtotal_final: number;
  quantidade_devolvida: number;
  created_at: string;
  updated_at: string;
}

// 🚩 CORREÇÃO AQUI: Adicionado 'cancelado'
export type StatusAluguel = 'ativo' | 'proximo_vencimento' | 'vencido' | 'finalizado' | 'cancelado';

export interface Aluguel {
  id: string;
  numero_contrato: string;
  cliente_id: string;
  data_inicio: string;
  dias_contratados: number;
  data_prevista_devolucao: string;
  data_devolucao_real: string | null;
  pagamento_antecipado: boolean;
  valor_antecipado: number;
  status: StatusAluguel;
  valor_previsto: number;
  valor_adicional_atraso: number;
  valor_total_final: number;
  valor_avaria: number;
  observacoes_avaria: string;
  observacoes: string;
  taxa_entrega: number;
  observacoes_entrega: string;
  itens: ItemAluguel[];
  created_at: string;
  updated_at: string;
}

export type TipoDiaNaoCobrado = 'feriado_nacional' | 'feriado_local' | 'dia_nao_cobrado';

export interface DiaNaoCobrado {
  id: string;
  nome: string;
  data: string;
  tipo: TipoDiaNaoCobrado;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export type TipoMovimentacao = 'saida' | 'entrada' | 'ajuste';

export interface MovimentacaoProduto {
  id: string;
  produto_id: string;
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number;
  referencia: string;
  observacoes: string;
  created_at: string;
}

export interface DadosEmpresa {
  nome: string;
  cnpj: string;
  endereco: string;
  telefone: string;
  whatsapp: string;
  email: string;
  responsavel: string;
}