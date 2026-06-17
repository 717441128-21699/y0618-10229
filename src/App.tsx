import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./pages/Dashboard";
import { TrendsView } from "./pages/TrendsView";
import { MapView } from "./pages/MapView";
import { CorrelationView } from "./pages/CorrelationView";
import { ExtremeWeatherView } from "./pages/ExtremeWeatherView";
import { ScenariosView } from "./pages/ScenariosView";
import { ExportCenter } from "./pages/ExportCenter";

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/trends" element={<TrendsView />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/correlation" element={<CorrelationView />} />
          <Route path="/extreme-weather" element={<ExtremeWeatherView />} />
          <Route path="/scenarios" element={<ScenariosView />} />
          <Route path="/export" element={<ExportCenter />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}
