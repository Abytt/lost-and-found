import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./Components/Navbar";
import Home from "./Components/Home";
import ReportLost from "./Components/ReportLost";
import ReportFound from "./Components/ReportFound";
import Search from "./Components/Search";
import About from "./Components/About";
import Contact from "./Components/Contact";
import LostFound from "./Components/LostFound";
import BloodDonor from "./Components/BloodDonor";
import MatchLostAndFound from "./Components/MatchLostAndFound"; // AI Matching Component

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
          <Route path="/blood-donor" element={<BloodDonor />} />
          <Route path="/match-lost-found" element={<MatchLostAndFound />} /> {/* AI Matching Route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
