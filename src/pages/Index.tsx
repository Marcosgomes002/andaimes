import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Package, Users, FileText } from 'lucide-react';

export default function Index() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Home className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Sistema de Aluguel</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">
            Bem-vindo ao sistema. Use os atalhos abaixo para acessar as principais áreas.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/clientes">
                <Users className="mr-2 h-4 w-4" />
                Clientes
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/produtos">
                <Package className="mr-2 h-4 w-4" />
                Produtos
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link to="/alugueis">
                <FileText className="mr-2 h-4 w-4" />
                Aluguéis
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}