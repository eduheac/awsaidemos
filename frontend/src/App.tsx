import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DemoList from './pages/DemoList';
import DemoDetail from './pages/DemoDetail';
import DemoForm from './pages/DemoForm';

function LoginPage() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-white items-center justify-center p-12">
        <img src="/logo.png" alt="AI PoC & Demo Registry" className="w-[480px] max-w-full" />
      </div>
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-gray-50">
        <img src="/logo.png" alt="AI PoC & Demo Registry" className="w-64 mb-8 lg:hidden" />
        <Authenticator />
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const { user, signOut } = useAuthenticator();
  return (
    <BrowserRouter>
      <Layout user={user} signOut={signOut}>
        <Routes>
          <Route path="/" element={<DemoList />} />
          <Route path="/demos/new" element={<DemoForm />} />
          <Route path="/demos/:demoId" element={<DemoDetail />} />
          <Route path="/demos/:demoId/edit" element={<DemoForm />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <Authenticator.Provider>
      <AuthContent />
    </Authenticator.Provider>
  );
}

function AuthContent() {
  const { authStatus } = useAuthenticator((ctx) => [ctx.authStatus]);
  if (authStatus === 'authenticated') {
    return <AuthenticatedApp />;
  }
  return <LoginPage />;
}
