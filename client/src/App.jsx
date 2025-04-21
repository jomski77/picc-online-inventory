import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import Header from './components/Header';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import CreateItem from './pages/CreateItem';
import UpdateItem from './pages/UpdateItem';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AddStock from './pages/AddStock';
import UseStock from './pages/UseStock';
import StockHistory from './pages/StockHistory';
import UsageHistory from './pages/UsageHistory';
import ActivityHistory from './pages/ActivityHistory';
import ItemList from './pages/ItemList';
import EditStock from './pages/EditStock';
import EditUsage from './pages/EditUsage';
import EditUser from './pages/EditUser';
import ActivityChart from './pages/ActivityChart';
import { initializeStorage } from './utils/supabaseStorage';
import ApiConfigTest from './utils/ApiConfigTest';

export default function App() {
  useEffect(() => {
    // Initialize Supabase storage when app loads
    const initStorage = async () => {
      try {
        await initializeStorage();
      } catch (error) {
        console.error('Failed to initialize storage:', error);
      }
    };
    
    initStorage();
  }, []);

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow pt-16 md:pt-20">
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/sign-in' element={<SignIn />} />
            <Route path='/sign-up' element={<SignUp />} />
            <Route element={<PrivateRoute />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/profile' element={<Profile />} />
              <Route path='/add-stock' element={<AddStock />} />
              <Route path='/use-stock' element={<UseStock />} />
              <Route path='/stock-history' element={<StockHistory />} />
              <Route path='/usage-history' element={<UsageHistory />} />
              <Route path='/activity-history' element={<ActivityHistory />} />
              <Route path='/activity-chart' element={<ActivityChart />} />
              <Route path='/items' element={<ItemList />} />
            </Route>
            <Route element={<AdminRoute />}>
              <Route path='/manage-users' element={<ManageUsers />} />
              <Route path='/edit-user/:id' element={<EditUser />} />
              <Route path='/create-item' element={<CreateItem />} />
              <Route path='/update-item/:id' element={<UpdateItem />} />
              <Route path='/edit-stock/:stockId' element={<EditStock />} />
              <Route path='/edit-usage/:usageId' element={<EditUsage />} />
            </Route>
            <Route path='*' element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        {/* API Configuration Test component (only shown in development) */}
        {import.meta.env.DEV && <ApiConfigTest />}
      </div>
    </BrowserRouter>
  );
} 