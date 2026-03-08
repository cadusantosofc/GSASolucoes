
import React from 'react';
import { 
  LayoutDashboard, 
  Search, 
  Database, 
  Settings, 
  History, 
  Plus, 
  Trash2, 
  CreditCard,
  User,
  Building2,
  FileText,
  Smartphone,
  ShieldCheck,
  Car,
  Scale,
  MoreHorizontal,
  ChevronRight,
  LogOut,
  AlertCircle
} from 'lucide-react';

export const ICONS = {
  LayoutDashboard: <LayoutDashboard className="w-5 h-5" />,
  Search: <Search className="w-5 h-5" />,
  Database: <Database className="w-5 h-5" />,
  Settings: <Settings className="w-5 h-5" />,
  History: <History className="w-5 h-5" />,
  Plus: <Plus className="w-5 h-5" />,
  Trash2: <Trash2 className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  User: <User className="w-5 h-5" />,
  Building2: <Building2 className="w-5 h-5" />,
  FileText: <FileText className="w-5 h-5" />,
  Smartphone: <Smartphone className="w-5 h-5" />,
  ShieldCheck: <ShieldCheck className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Scale: <Scale className="w-5 h-5" />,
  MoreHorizontal: <MoreHorizontal className="w-5 h-5" />,
  ChevronRight: <ChevronRight className="w-5 h-5" />,
  LogOut: <LogOut className="w-5 h-5" />,
  AlertCircle: <AlertCircle className="w-5 h-5" />
};

export const AVAILABLE_ICONS = [
  { id: 'User', icon: <User /> },
  { id: 'Building2', icon: <Building2 /> },
  { id: 'FileText', icon: <FileText /> },
  { id: 'Smartphone', icon: <Smartphone /> },
  { id: 'ShieldCheck', icon: <ShieldCheck /> },
  { id: 'Car', icon: <Car /> },
  { id: 'Scale', icon: <Scale /> },
  { id: 'AlertCircle', icon: <AlertCircle /> },
  { id: 'MoreHorizontal', icon: <MoreHorizontal /> }
];
