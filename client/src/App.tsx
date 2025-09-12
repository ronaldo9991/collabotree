import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";

// Pages
import Landing from "@/pages/Landing";
import Marketplace from "@/pages/Marketplace";
import ServiceDetail from "@/pages/ServiceDetail";
import HowItWorks from "@/pages/HowItWorks";
import About from "@/pages/About";
import StudentDashboard from "@/pages/student/Dashboard";
import ServiceCreate from "@/pages/student/ServiceCreate";
import ServiceEdit from "@/pages/student/ServiceEdit";
import BuyerDashboard from "@/pages/buyer/Dashboard";
import AdminDashboard from "@/pages/admin/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/service/:id" component={ServiceDetail} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/about" component={About} />

      {/* Dashboard routes - now publicly accessible */}
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/student/services/new" component={ServiceCreate} />
      <Route path="/dashboard/student/services/:id/edit" component={ServiceEdit} />
      <Route path="/dashboard/buyer" component={BuyerDashboard} />
      <Route path="/admin" component={AdminDashboard} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="collabotree-theme">
      <TooltipProvider>
        <Layout>
          <Toaster />
          <Router />
        </Layout>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default App;