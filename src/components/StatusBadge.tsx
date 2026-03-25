import { StatusAluguel } from '@/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusConfig: Record<StatusAluguel | 'cancelado', { label: string; className: string }> = {
  ativo: {
    label: 'Ativo',
    className: 'bg-status-active text-status-active-foreground',
  },
  proximo_vencimento: {
    label: 'Próx. Vencimento',
    className: 'bg-status-warning text-status-warning-foreground',
  },
  vencido: {
    label: 'Vencido',
    className: 'bg-status-danger text-status-danger-foreground',
  },
  finalizado: {
    label: 'Finalizado',
    className: 'bg-status-finished text-status-finished-foreground',
  },
  cancelado: {
    label: 'Cancelado',
    className: 'bg-destructive text-destructive-foreground', // 🚩 Cor de destaque para cancelado
  },
};

export function StatusBadge({ status }: { status: StatusAluguel | 'cancelado' }) {
  const config = statusConfig[status as keyof typeof statusConfig] ?? {
    label: 'Desconhecido',
    className: 'bg-muted text-muted-foreground',
  };

  return (
    <Badge className={cn('border-0 text-xs font-semibold', config.className)}>
      {config.label}
    </Badge>
  );
}