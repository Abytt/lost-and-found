// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./Components/AuthContext";
import { AdminProvider } from './Components/AdminContext';
import { NotificationProvider } from './Components/NotificationContext';
import PrivateRoute from "./Components/PrivateRoute";

// Navigation & Layout
import Navbar from "./Components/Navbar";

// Pages
import Home from "./Components/Home";
import About from "./Components/About";
import Contact from "./Components/Contact";
import LostFound from "./Components/LostFound";
import ReportLost from "./Components/ReportLost";
import ReportFound from "./Components/ReportFound";
import Search from "./Components/Search";
import BloodDonor from "./Components/BloodDonor";
import MatchLostAndFound from "./Components/MatchLostAndFound";

// Auth Components
import Login from "./Components/Login";
import Signup from "./Components/Signup";
import ForgotPassword from "./Components/ForgotPassword";
import Profile from "./Components/Profile";
import MyReports from "./Components/MyReports";
import AdminDashboard from "./Components/AdminDashboard";

// New Components for User Interaction
import Messages from "./Components/Messages";
import ItemDetail from "./Components/ItemDetails";

// Test Component
const AdminTest = () => (
  <div className="container mt-5">
    <h1>Admin Test Page</h1>
    <p>This is a test to verify routing is working correctly.</p>
  </div>
);

function App() {
  console.log("App rendered");
  return (
    <Router>
      <AuthProvider>
        <AdminProvider>
          <NotificationProvider>
            <Navbar />
            <div className="content">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blood-donor" element={<BloodDonor />} />
                <Route path="/search" element={<Search />} />
                
                {/* Test Routes */}
                <Route path="/admintest" element={<AdminTest />} />
                
                {/* Authentication Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Protected Routes - Regular Users */}
                <Route 
                  path="/lost-found" 
                  element={
                    <PrivateRoute>
                      <LostFound />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/report-lost" 
                  element={
                    <PrivateRoute>
                      <ReportLost />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/report-found" 
                  element={
                    <PrivateRoute>
                      <ReportFound />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/my-reports" 
                  element={
                    <PrivateRoute>
                      <MyReports />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/item/:itemId" 
                  element={
                    <PrivateRoute>
                      <ItemDetail />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/messages" 
                  element={
                    <PrivateRoute>
                      <Messages />
                    </PrivateRoute>
                  } 
                />
                
                {/* Admin-only Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <AdminDashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/match-lost-found" 
                  element={
                    <PrivateRoute requireAdmin={true}>
                      <MatchLostAndFound />
                    </PrivateRoute>
                  } 
                />
              </Routes>
            </div>
          </NotificationProvider>
        </AdminProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;