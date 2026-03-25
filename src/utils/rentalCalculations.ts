import { DiaNaoCobrado } from '@/types';
import { addDays, differenceInCalendarDays, format, isSunday, parseISO } from 'date-fns';

/**
 * Calcula dias cobrados entre duas datas (Exclui Domingos e Datas Isentas)
 */
export function calcularDiasCobrados(
  dataInicio: string,
  dataFim: string,
  diasNaoCobrados: DiaNaoCobrado[]
): number {
  if (!dataInicio || !dataFim) return 0;
  
  const inicio = parseISO(dataInicio);
  const fim = parseISO(dataFim);

  // 🚩 CORREÇÃO: Usamos apenas a diferença de dias (intervalos).
  // Se for do dia 25 ao 31, a diferença é 6 (o que você quer).
  let totalDias = differenceInCalendarDays(fim, inicio);
  
  // 🚩 REGRA DE OURO: Se alugou e devolveu no mesmo dia (25 ao 25), 
  // a diferença é 0, mas cobramos o valor de 1 diária.
  if (totalDias === 0) return 1;

  const datasNaoCobradas = new Set(
    (diasNaoCobrados || []).filter((d) => d.ativo).map((d) => d.data)
  );

  let diasCobrados = 0;

  // O loop agora percorre a quantidade exata de intervalos de diárias
  for (let i = 0; i < totalDias; i++) {
    const dia = addDays(inicio, i);
    const diaStr = format(dia, 'yyyy-MM-dd');

    // Pula domingos e datas isentas cadastradas
    if (isSunday(dia)) continue;
    if (datasNaoCobradas.has(diaStr)) continue;

    diasCobrados++;
  }

  // Garantia final: se sobrar 0 após os descontos, retorna 1 diária mínima
  return diasCobrados === 0 ? 1 : diasCobrados;
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
 * Status visual do aluguel
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
  const valorJaPago = pagouAntecipado ? (Number(valorAntecipado) || 0) : 0;

  const valorTotalCalculado = valorBase + (valorAvaria || 0);
  const saldoRestante = valorTotalCalculado - valorJaPago;

  return {
    diasCobrados: diasCobradosTotal,
    diasAtraso,
    valorBase,
    valorJaPago,
    valorTotalCalculado,
    saldoRestante,
  };
}

export function formatarMoeda(valor: number | null | undefined): string {
  const v = Number(valor) || 0; 
  return v.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

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