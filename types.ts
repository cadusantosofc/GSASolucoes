
export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  slug: string;
}

export interface Base {
  id: string;
  moduleId: string;
  name: string;
  description?: string;
  cost: number;
  status: 'active' | 'inactive';
  baseUrl: string;
  method?: string;
  headers?: any;
  bodyParams?: any;
}

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  phone: string;
  balance: number;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  profileImage?: string;
  phone?: string;
  document?: string; // CPF ou CNPJ
  role: 'admin' | 'user' | 'super' | 'gestor' | 'vendedor' | 'cliente';
  active: boolean; // Status da conta
  isAtivo: boolean; // Cliente Ativo vs Consulta
  region?: string;
  companyId?: string; 
  parentId?: string; // ID do gestor ou vendedor superior
  balance: number; 
}

export interface SearchHistory {
  id: string;
  userId: string;
  userName: string;
  companyName?: string;
  baseName: string;
  doc: string;
  cost: number;
  timestamp: number;
  status: 'success' | 'error';
  resultData?: any;
}

export interface SharedLink {
  id: string;
  historyId: string;
  creatorName: string;
  expiresAt: number;
  createdAt: number;
}
