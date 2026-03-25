import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from 'react';
import {
  Cliente,
  Produto,
  Aluguel,
  DiaNaoCobrado,
  MovimentacaoProduto,
  DadosEmpresa,
} from '@/types';
import {
  dadosEmpresaInicial
} from '@/data/mockData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AppState {
  clientes: Cliente[];
  produtos: Produto[];
  alugueis: Aluguel[];
  diasNaoCobrados: DiaNaoCobrado[];
  movimentacoes: MovimentacaoProduto[];
  dadosEmpresa: DadosEmpresa;
  adicionarCliente: (c: any) => Promise<void>;
  atualizarCliente: (c: Cliente) => Promise<void>;
  adicionarProduto: (p: any) => Promise<void>;
  atualizarProduto: (p: Produto) => Promise<void>;
  removerProduto: (id: string) => Promise<{ success: boolean; message: string }>;
  produtoTemAluguelAtivo: (id: string) => boolean;
  adicionarDiaNaoCobrado: (d: any) => void;
  atualizarDiaNaoCobrado: (d: DiaNaoCobrado) => void;
  removerDiaNaoCobrado: (id: string) => void;
  criarAluguel: (params: any) => Promise<any>;
  atualizarAluguel: (id: string, params: any) => Promise<void>; // ADICIONADO NA INTERFACE
  registrarDevolucao: (params: any) => Promise<void>;
  cancelarAluguel: (id: string) => Promise<void>;
  atualizarDadosEmpresa: (d: DadosEmpresa) => Promise<void>;
  getCliente: (id: string) => Cliente | undefined;
  getProduto: (id: string) => Produto | undefined;
  getAluguel: (id: string) => Aluguel | undefined;
  getMovimentacoesProduto: (produtoId: string) => MovimentacaoProduto[];
  getAlugueisCliente: (clienteId: string) => Aluguel[];
}

const AppContext = createContext<AppState | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp deve estar dentro de AppProvider');
  return ctx;
}

function mapCustomerToCliente(c: any): Cliente {
  return {
    id: c.id, nome: c.nome ?? '', cpf: c.cpf ?? '', celular: c.celular ?? '',
    endereco: c.endereco ?? '', observacoes: c.observacoes ?? '', ativo: c.ativo ?? true,
    created_at: c.created_at ?? '', updated_at: c.updated_at ?? '',
  };
}

function mapProductToProduto(p: any): Produto {
  return {
    id: p.id, nome: p.name ?? '', categoria: p.category ?? '', descricao: p.description ?? '',
    valor_diaria: Number(p.daily_rate ?? 0), quantidade_total: Number(p.total_quantity ?? 0),
    quantidade_disponivel: Number(p.available_quantity ?? 0), quantidade_alugada: Number(p.rented_quantity ?? 0),
    ativo: p.active ?? true, created_at: p.created_at ?? '', updated_at: p.updated_at ?? '',
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [alugueis, setAlugueis] = useState<Aluguel[]>([]);
  const [diasNaoCobrados, setDiasNaoCobrados] = useState<DiaNaoCobrado[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoProduto[]>([]);
  const [dadosEmpresa, setDadosEmpresa] = useState<DadosEmpresa>(dadosEmpresaInicial);

  const carregarTudo = useCallback(async () => {
    const [c, p, a, s] = await Promise.all([
      supabase.from('clientes').select('*').order('nome'),
      supabase.from('products').select('*').order('name'),
      supabase.from('rentals').select('*, itens:rental_items(*)').order('created_at', { ascending: false }),
      supabase.from('company_settings').select('*').maybeSingle()
    ]);
    
    if (c.data) setClientes(c.data.map(mapCustomerToCliente));
    if (p.data) setProdutos(p.data.map(mapProductToProduto));
    if (a.data) setAlugueis(a.data.map((item: any) => ({ ...item, itens: item.itens || [] })));
    
    if (s.data) {
      setDadosEmpresa({
        name: s.data.name, 
        cnpj: s.data.cnpj, 
        address: s.data.address,
        phone: s.data.phone, 
        whatsapp: s.data.whatsapp, 
        email: s.data.email, 
        responsible_name: s.data.responsible_name
      });
    }
  }, []);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  const atualizarDadosEmpresa = useCallback(async (d: DadosEmpresa) => {
    const { error } = await supabase
      .from('company_settings')
      .update({
        name: d.name, cnpj: d.cnpj, address: d.address,
        phone: d.phone, whatsapp: d.whatsapp, email: d.email,
        responsible_name: d.responsible_name
      })
      .eq('id', '00000000-0000-0000-0000-000000000000');

    if (error) throw error;
    setDadosEmpresa(d);
    toast.success("Empresa atualizada!");
  }, []);

  const atualizarProduto = useCallback(async (p: Produto) => {
    const { error } = await supabase.from('products').update({
      name: p.nome, category: p.categoria, description: p.descricao,
      daily_rate: p.valor_diaria, total_quantity: p.quantidade_total,
      available_quantity: p.quantidade_total - p.quantidade_alugada,
      active: p.ativo
    }).eq('id', p.id);
    if (error) throw error;
    await carregarTudo();
  }, [carregarTudo]);

  const criarAluguel = useCallback(async (params: any) => {
    const numero_contrato = `CTR-${Date.now()}`;
    const { error } = await supabase.rpc('criar_aluguel_v3', { // MUDADO PARA v3
      p_aluguel: { ...params, numero_contrato, status: 'ativo' },
      p_itens: params.itens
    });
    if (error) throw error;
    await carregarTudo();
    return { numero_contrato };
  }, [carregarTudo]);

  // --- NOVA FUNÇÃO DE ATUALIZAR ALUGUEL (ADICIONADA) ---
  const atualizarAluguel = useCallback(async (id: string, params: any) => {
    const { error } = await supabase.rpc('editar_aluguel_v3', {
      p_aluguel_id: id,
      p_aluguel: params,
      p_itens: params.itens
    });
    if (error) throw error;
    await carregarTudo();
  }, [carregarTudo]);

  const registrarDevolucao = useCallback(async (params: any) => {
    const { error } = await supabase.rpc('registrar_devolucao_completa', {
      p_aluguel_id: params.aluguel_id,
      p_data_devolucao: params.data_devolucao,
      p_valor_avaria: params.valor_avaria || 0,
      p_observacoes_avaria: params.observacoes_avaria || '',
      p_valor_desconto: params.valor_desconto || 0
    });
    if (error) throw error;
    await carregarTudo();
  }, [carregarTudo]);

  const cancelarAluguel = useCallback(async (id: string) => {
    const { error } = await supabase.rpc('cancelar_aluguel_estorno', {
      p_aluguel_id: id
    });
    if (error) throw error;
    await carregarTudo();
  }, [carregarTudo]);

  const value = useMemo(() => ({
    clientes, produtos, alugueis, diasNaoCobrados, movimentacoes, dadosEmpresa,
    adicionarCliente: async (c: any) => { await supabase.from('clientes').insert([c]); carregarTudo(); },
    atualizarCliente: async (c: Cliente) => { await supabase.from('clientes').update(c).eq('id', c.id); carregarTudo(); },
    adicionarProduto: async (p: any) => { await supabase.from('products').insert([p]); carregarTudo(); },
    atualizarProduto,
    removerProduto: async (id: string) => { 
      const { error } = await supabase.from('products').delete().eq('id', id);
      if(!error) carregarTudo();
      return { success: !error, message: error ? 'Erro ao excluir' : 'Sucesso' };
    },
    produtoTemAluguelAtivo: () => false,
    adicionarDiaNaoCobrado: () => {}, atualizarDiaNaoCobrado: () => {}, removerDiaNaoCobrado: () => {},
    criarAluguel, atualizarAluguel, registrarDevolucao, cancelarAluguel, atualizarDadosEmpresa,
    getCliente: (id: string) => clientes.find(c => c.id === id),
    getProduto: (id: string) => produtos.find(p => p.id === id),
    getAluguel: (id: string) => alugueis.find(a => a.id === id),
    getMovimentacoesProduto: () => [], getAlugueisCliente: (id: string) => alugueis.filter(a => a.cliente_id === id)
  }), [clientes, produtos, alugueis, diasNaoCobrados, movimentacoes, dadosEmpresa, atualizarProduto, criarAluguel, atualizarAluguel, registrarDevolucao, cancelarAluguel, atualizarDadosEmpresa, carregarTudo]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}