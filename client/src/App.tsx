import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Layout } from "@/components/Layout";
import { AuthProvider } from "@/contexts/AuthContext";

// Pages
import Landing from "@/pages/Landing";
import Marketplace from "@/pages/Marketplace";
import Services from "@/pages/Services";
import ServiceDetail from "@/pages/ServiceDetail";
import ProjectDetail from "@/pages/ProjectDetail";
import HowItWorks from "@/pages/HowItWorks";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import SignIn from "@/pages/SignIn";
import Dashboard from "@/pages/Dashboard";
import StudentDashboard from "@/pages/student/Dashboard";
import ServiceCreate from "@/pages/student/ServiceCreate";
import ServiceEdit from "@/pages/student/ServiceEdit";
import StudentSettings from "@/pages/student/Settings";
import BuyerDashboard from "@/pages/buyer/Dashboard";
import BuyerOrders from "@/pages/buyer/Orders";
import Chat from "@/pages/Chat";
// import TestChat from "@/pages/TestChat";
import BuyerSettings from "@/pages/buyer/Settings";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminUsers from "@/pages/admin/Users";
import AdminMessages from "@/pages/admin/Messages";
import AdminSettings from "@/pages/admin/Settings";
import AdminSignIn from "@/pages/AdminSignIn";
import TestLogin from "@/pages/TestLogin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/services" component={Services} />
      <Route path="/service/:id" component={ProjectDetail} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/signin" component={SignIn} />
      <Route path="/admin/signin" component={AdminSignIn} />
      <Route path="/test-login" component={TestLogin} />

      {/* Protected routes */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/student" component={StudentDashboard} />
      <Route path="/dashboard/student/services/new" component={ServiceCreate} />
      <Route path="/dashboard/student/services/:id/edit" component={ServiceEdit} />
      <Route path="/dashboard/student/settings" component={StudentSettings} />
      <Route path="/dashboard/buyer" component={BuyerDashboard} />
        <Route path="/dashboard/buyer/orders" component={BuyerOrders} />
        <Route path="/chat/:hireId" component={Chat} />
        {/* <Route path="/test-chat" component={TestChat} /> */}
      <Route path="/dashboard/buyer/settings" component={BuyerSettings} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/admin/users" component={AdminUsers} />
      <Route path="/dashboard/admin/messages" component={AdminMessages} />
      <Route path="/dashboard/admin/settings" component={AdminSettings} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="collabotree-theme">
      <AuthProvider>
        <TooltipProvider>
          <Layout>
            <Toaster />
            <Router />
          </Layout>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;