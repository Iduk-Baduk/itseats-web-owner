import { useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Layout from "./layouts/Layout";
import Pos from "./pages/pos/Pos";
import Sales from "./pages/sales/Sales";
import Settlements from "./pages/settlements/Settlements";
import Stores from "./pages/stores/Stores";
import Accounts from "./pages/accounts/Accounts";
import Menus from "./pages/menus/Menus";
import Reviews from "./pages/reviews/Reviews";


function App() {
  return <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/sale-manage" replace />} />
        <Route path="/pos" element={<Pos />} />
        <Route path="/sales" element={<Sales />} />
        <Route path="/settlements" element={<Settlements />} />
        <Route path="/stores" element={<Stores />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/menus" element={<Menus />} />
        <Route path="/reviews" element={<Reviews />} />
      </Route>
    </Routes>
  </BrowserRouter>;
}

export default App;
