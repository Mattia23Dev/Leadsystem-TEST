import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AuthRoute from "./components/routes/AuthRoute";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Account from "./pages/Account";
import Impostazioni from "./pages/BottomSidebar/Impostazioni";
import Faq from "./pages/BottomSidebar/Faq";
import Assistenza from "./pages/BottomSidebar/Assistenza";
import Boost from "./pages/Boost";
import Orientatori from "./pages/Orientatori";
import Dashboard from "./pages/dashboard";
import LeadWA from "./pages/LeadWA";
import StripeSuccessBoost from "./pages/stripe-success-boost";
import LoginSuperAdmin from "./pages/LoginSuperAdmin";
import SuperAdminRoute from "./components/routes/SuperAdminRoute";
import HomeSuper from "./pages/superAdmin/HomeSuper";
import DashboardMarketing from "./pages/superAdmin/DashboardMarketing";
import TermsCond from "./pages/TermsCond";
import ExportCsv from "./pages/superAdmin/ExportCsv";

function App() {

  return (
    <Router>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
        }}
      />
      <Switch>
        <Route exact path="/register" component={Register} />
        <Route exact path="/super-admin" component={LoginSuperAdmin} />
        <Route exact path="/login" component={Login} />    
        <AuthRoute exact path="/" component={Home} />
        <AuthRoute exact path="/dashboard" component={Dashboard} />
        <AuthRoute exact path="/termini-condizioni" component={TermsCond} />
        <AuthRoute exact path="/leadwhatsapp" component={LeadWA} />
        <AuthRoute exact path="/stripe/success/boost" component={StripeSuccessBoost} />
        {/*
        <AuthRoute exact path="/stripe/cancel" component={StripeCancel} />
        <AuthRoute exact path="/stripe/success" component={StripeSuccess} />
        */}
        <AuthRoute exact path="/account" component={Account} />
        <AuthRoute exact path="/impostazioni" component={Impostazioni} />
        <AuthRoute exact path="/faq" component={Faq} />
        <AuthRoute exact path="/orientatori" component={Orientatori} />
        <AuthRoute exact path="/assistenza" component={Assistenza} />
        <AuthRoute exact path="/boost" component={Boost} />
        {/*
        Eliminato le seguenti pagine che non servivano, tutta la cartella admin

        <AdminRoute exact path="/admin/lead-general" component={HomeAdmin} />
        <AdminRoute exact path="/admin/ecp" component={EcpAdmin} />
        <AdminRoute exact path="/admin/impostazioni" component={ImpostazioniAdmin} />
        <AdminRoute exact path="/admin/dashboard" component={DashboardAdmin} />
        <Route exact path="/admin/login" component={LoginAdmin} />
        */}
        <SuperAdminRoute exact path="/super-admin/home" component={HomeSuper} />
        <SuperAdminRoute exact path="/super-admin/dash-marketing" component={DashboardMarketing} />
        <SuperAdminRoute exact path="/super-admin/export" component={ExportCsv} />
      </Switch>
    </Router>
  );
}

export default App;
