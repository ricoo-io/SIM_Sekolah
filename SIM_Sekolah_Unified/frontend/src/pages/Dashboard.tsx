import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardAdmin } from './dashboard/DashboardAdmin';
import { DashboardGuru } from './dashboard/DashboardGuru';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <DashboardAdmin />;
  }

  return <DashboardGuru />;
};

export default Dashboard;
