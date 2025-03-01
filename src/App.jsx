import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import ReportLost from "./Components/ReportLost";
import ReportFound from "./Components/ReportFound";
import Search from "./Components/Search";
import About from "./Components/About";
import Contact from "./components/Contact";
import LostFound from "./Components/LostFound";
import BloodDonor from "./Components/BloodDonor"; // Correct the import path

function App() {
  return (
    <Router>
      <Navbar />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report-lost" element={<ReportLost />} />
          <Route path="/report-found" element={<ReportFound />} />
          <Route path="/search" element={<Search />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lost-found" element={<LostFound />} />
          <Route path="/blood-donor" element={<BloodDonor />} /> {/* Add the route for Blood Donor Helper */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
