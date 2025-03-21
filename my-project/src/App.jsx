import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Patient from "./pages/Patient";
import Doctor from "./pages/Doctor";
import PatientDashboardPage from "./pages/PatientDashboardPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import Bill from "./components/Bill";
import PatientProfile from "./components/PatientProfile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/patient" element={<Patient />} />
        <Route path="/doctor" element={<Doctor />} />
        
        {/* Patient routes */}
        <Route path="/patient/dashboard" element={<PatientDashboardPage />} />
        <Route path="/patient/profile/edit" element={<PatientProfile />} />
        <Route path="/patient/bill/:appointmentId" element={<Bill />} />
        
        {/* Doctor routes */}
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
      </Routes>
    </Router>
  );
}

export default App;