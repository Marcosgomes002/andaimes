import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
// import { Toaster } from "@/components/ui/toaster";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { AppLayout } from "@/components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProdutosPage from "./pages/ProdutosPage";
import ClientesPage from "./pages/ClientesPage";
import DiasNaoCobradosPage from "./pages/DiasNaoCobradosPage";
import NovoAluguelPage from "./pages/NovoAluguelPage";
import AlugueisPage from "./pages/AlugueisPage";
import DevolucaoPage from "./pages/DevolucaoPage";
import FinanceiroPage from "./pages/FinanceiroPage";
import RelatoriosPage from "./pages/RelatoriosPage";
import BackupPage from "./pages/BackupPage";
import ConfiguracoesPage from "./pages/ConfiguracoesPage";
import ContratoPage from "./pages/ContratoPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <BrowserRouter>
          <Sonner />
          <AppLayout>
            <Routes>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/produtos" element={<ProdutosPage />} />
              <Route path="/clientes" element={<ClientesPage />} />
              <Route path="/dias-nao-cobrados" element={<DiasNaoCobradosPage />} />
              <Route path="/alugueis/novo" element={<NovoAluguelPage />} />
              <Route path="/alugueis" element={<AlugueisPage />} />
              <Route path="/devolucao" element={<DevolucaoPage />} />
              <Route path="/financeiro" element={<FinanceiroPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/backup" element={<BackupPage />} />
              <Route path="/configuracoes" element={<ConfiguracoesPage />} />
              <Route path="/contrato/:id" element={<ContratoPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AppProvider>
    </QueryClientProvider>
  );
};

export default App;