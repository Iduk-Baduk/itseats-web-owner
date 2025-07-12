import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import PosLayout from "./layouts/PosLayout";
import Pos from "./pages/pos/POS";
import { PosOrders } from "./pages/pos/PosOrders";
import Sales from "./pages/sales/Sales";
import Settlements from "./pages/settlements/Settlements";
import Stores from "./pages/stores/Stores";
import Accounts from "./pages/accounts/Accounts";
import Menus from "./pages/menus/Menus";
import MenusAdd from "./pages/menus/MenusAdd";
import Reviews from "./pages/reviews/Reviews";
import Login from "./pages/users/Login";
import RegisterContainer from "./pages/users/register/RegisterContainer";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { ToastProvider } from './contexts/ToastContext';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/login" replace />} />
              <Route
                path="/sales"
                element={
                  <ProtectedRoute>
                    <Sales />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settlements"
                element={
                  <ProtectedRoute>
                    <Settlements />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stores"
                element={
                  <ProtectedRoute>
                    <Stores />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/accounts"
                element={
                  <ProtectedRoute>
                    <Accounts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/menus"
                element={
                  <ProtectedRoute>
                    <Menus />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/menus/add"
                element={
                  <ProtectedRoute>
                    <MenusAdd />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/menus/edit/:id"
                element={
                  <ProtectedRoute>
                    <MenusAdd />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/reviews"
                element={
                  <ProtectedRoute>
                    <Reviews />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/" element={<PosLayout />}>
              <Route
                path="/pos"
                element={
                  <ProtectedRoute>
                    <Pos />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pos/orders"
                element={
                  <ProtectedRoute>
                    <PosOrders />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<RegisterContainer />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
