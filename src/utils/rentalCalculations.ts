import { DiaNaoCobrado } from '@/types';
import { addDays, differenceInCalendarDays, format, isSunday, parseISO } from 'date-fns';

/**
 * Calcula dias cobrados entre duas datas...
 */
export function calcularDiasCobrados(
  dataInicio: string,
  dataFim: string,
  diasNaoCobrados: DiaNaoCobrado[]
): number {
  if (!dataInicio || !dataFim) return 0; // 🚩 Proteção contra datas vazias
  const inicio = parseISO(dataInicio);
  const fim = parseISO(dataFim);

  const totalDias = differenceInCalendarDays(fim, inicio) + 1;
  if (totalDias <= 0) return 0;

  const datasNaoCobradas = new Set(
    (diasNaoCobrados || []).filter((d) => d.ativo).map((d) => d.data)
  );

  let diasCobrados = 0;

  for (let i = 0; i < totalDias; i++) {
    const dia = addDays(inicio, i);
    const diaStr = format(dia, 'yyyy-MM-dd');

    if (isSunday(dia)) continue;
    if (datasNaoCobradas.has(diaStr)) continue;

    diasCobrados++;
  }

  return diasCobrados;
}

export function calcularDataFim(
  dataInicio: string,
  diasCobrados: number,
  diasNaoCobrados: DiaNaoCobrado[]
): string {
  if (!dataInicio) return format(new Date(), 'yyyy-MM-dd');
  const inicio = parseISO(dataInicio);

  const datasNaoCobradas = new Set(
    (diasNaoCobrados || []).filter((d) => d.ativo).map((d) => d.data)
  );

  let contagem = 0;
  let diaAtual = inicio;

  while (contagem < diasCobrados) {
    const diaStr = format(diaAtual, 'yyyy-MM-dd');

    if (!isSunday(diaAtual) && !datasNaoCobradas.has(diaStr)) {
      contagem++;
    }

    if (contagem < diasCobrados) {
      diaAtual = addDays(diaAtual, 1);
    }
  }

  return format(diaAtual, 'yyyy-MM-dd');
}

/**
 * Status visual do aluguel (Adicionado 'cancelado' e 'finalizado')
 */
export function calcularStatusAluguel(
  dataPrevista: string,
  dataHoje: Date = new Date()
): 'ativo' | 'proximo_vencimento' | 'vencido' | 'finalizado' | 'cancelado' {
  if (!dataPrevista) return 'ativo';
  const prevista = parseISO(dataPrevista);
  const diffDias = differenceInCalendarDays(prevista, dataHoje);

  if (diffDias < 0) return 'vencido';
  if (diffDias <= 2) return 'proximo_vencimento';
  return 'ativo';
}

export function calcularValorDevolucao(
  dataInicio: string,
  dataDevolucaoReal: string,
  dataPrevista: string,
  valorDiarioTotal: number,
  pagouAntecipado: boolean,
  valorAntecipado: number,
  diasNaoCobrados: DiaNaoCobrado[],
  valorAvaria: number = 0
) {
  const diasCobradosTotal = calcularDiasCobrados(dataInicio, dataDevolucaoReal, diasNaoCobrados);
  const diasCobradosPrevistos = calcularDiasCobrados(dataInicio, dataPrevista, diasNaoCobrados);

  const diasAtraso = Math.max(0, diasCobradosTotal - diasCobradosPrevistos);
  const valorBase = diasCobradosTotal * valorDiarioTotal;
  const valorAdicional = diasAtraso * valorDiarioTotal;
  const valorJaPago = pagouAntecipado ? (valorAntecipado || 0) : 0;

  const valorTotalCalculado = valorBase + valorAdicional + (valorAvaria || 0);
  const saldoRestante = Math.max(0, valorTotalCalculado - valorJaPago);

  return {
    diasCobrados: diasCobradosTotal,
    diasAtraso,
    valorBase,
    valorAdicional,
    valorJaPago,
    valorTotalCalculado,
    saldoRestante,
  };
}

// 🚩 FORMATAR MOEDA COM PROTEÇÃO (Corrige o erro de null)
export function formatarMoeda(valor: number | null | undefined): string {
  const v = valor || 0; 
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

// 🚩 FORMATAR DATA COM PROTEÇÃO
export function formatarData(data: string | null | undefined): string {
  if (!data) return '-';
  try {
    const d = parseISO(data);
    return format(d, 'dd/MM/yyyy');
  } catch (e) {
    return '-';
  }
}

export function gerarNumeroContrato(ultimoNumero: number): string {
  const ano = new Date().getFullYear();
  const num = (ultimoNumero + 1).toString().padStart(4, '0');
  return `LC-${ano}-${num}`;
}

export function gerarId(): string {
  return Math.random().toString(36).substring(2, 11);
}