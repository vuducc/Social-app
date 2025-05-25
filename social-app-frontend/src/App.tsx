import { Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "./components/layout/AuthLayout/AuthLayout";
import { MainLayout } from "./components/layout/MainLayout/MainLayout";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { HomePage } from "./pages/home/HomePage";
import { ProfilePage } from "./pages/profile/ProfilePage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { SearchSidebar } from "./components/layout/SearchSidebar/SearchSidebar";
import { useState } from "react";
import { NetworkProvider } from "./contexts/NetworkContext";
import { OfflineIndicator } from "./components/common/OfflineIndicator/OfflineIndicator";
import { AccountsLayout } from "./components/accounts/AccountsLayout";
import { EditProfilePage } from "./pages/accounts/EditProfilePage";
import { ChangePasswordPage } from "./pages/accounts/ChangePasswordPage";
import { PrivacyPage } from "./pages/accounts/PrivacyPage";
import { HelpPage } from "./pages/accounts/HelpPage";
import { NotificationsSettingPage } from "./pages/accounts/NotificationsPage";
import { NotificationsPage } from "./pages/notifications/NotificationsPage";
import { OTPVerificationPage } from "./pages/auth/OTPVerificationPage";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AdminLayout } from "./components/layout/AdminLayout/AdminLayout";
import { DashboardPage } from "./pages/admin/DashboardPage";
import { AdminNotificationsPage } from "./pages/admin/AdminNotificationsPage";
import { ReportsPage } from "./pages/admin/ReportsPage";
import { UsersPage } from "./pages/admin/UsersPage";

function App() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <NetworkProvider>
      <Provider store={store}>
        <ThemeProvider>
          <AuthProvider>
            <Routes>
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute requireAuth={true}>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<HomePage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile">
                  <Route index element={<Navigate to="/" replace />} />
                  <Route path="me" element={<ProfilePage isOwnProfile />} />
                  <Route path=":userId" element={<ProfilePage />} />
                </Route>

                {/* Thêm routes mới cho accounts */}
                <Route path="accounts" element={<AccountsLayout />}>
                  <Route index element={<Navigate to="edit" replace />} />
                  <Route path="edit" element={<EditProfilePage />} />
                  <Route path="password" element={<ChangePasswordPage />} />
                  <Route
                    path="notifications"
                    element={<NotificationsSettingPage />}
                  />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="help" element={<HelpPage />} />
                </Route>
              </Route>

              {/* Auth routes */}
              <Route
                path="/auth"
                element={
                  <ProtectedRoute requireAuth={false}>
                    <AuthLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/auth/login" replace />} />
                <Route path="login" element={<LoginPage />} />
                <Route path="register" element={<RegisterPage />} />
                <Route path="verify-otp" element={<OTPVerificationPage />} />
              </Route>

              {/* Admin routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route
                  path="notifications"
                  element={<AdminNotificationsPage />}
                />
                <Route path="settings" element={<div>Admin Settings</div>} />
              </Route>

              {/* Redirect all unknown routes to home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  fontSize: "0.875rem",
                },
                success: {
                  iconTheme: {
                    primary: "#10B981",
                    secondary: "#fff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#EF4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
            <SearchSidebar
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
            />
            <OfflineIndicator />
          </AuthProvider>
        </ThemeProvider>
      </Provider>
    </NetworkProvider>
  );
}

export default App;
