
export interface FileData {
  base64: string;
  mimeType: string;
  name?: string;
}

export interface Suspect {
  id: string;
  name: string;
  details: string;
  addedAt: number;
}

export interface PredefinedLaw {
  id: string;
  name: string;
  category: 'Act' | 'Precedent' | 'Statute';
  content: string; // The text content or a reference to it
}

export interface Loophole {
  title: string;
  section: string;
  description: string;
  legitimacy: 'High' | 'Medium' | 'Low';
  strategy: string;
  tags: string[];
  counselInstructions: string;
  potentialChallenges: {
    prosecution: string;
    counter: string;
  };
}

export interface GroundingLink {
  uri: string;
  title: string;
}

export interface AnalysisResult {
  summary: string;
  suspectInfo: {
    name: string;
    charges: string[];
  };
  loopholes: Loophole[];
  defenseScore: number;
  prosecutionGaps: string[];
  groundingLinks?: GroundingLink[];
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundingLinks?: GroundingLink[];
}

export interface UserProfile {
  email: string;
  name?: string;
  avatar?: string;
  googleId?: string;
  notificationsEnabled: boolean;
  isLoggedIn: boolean;
}

export interface CreditState {
  balance: number;
  isLawyerVerified: boolean;
  userProfile?: UserProfile;
}

export interface PaymentGatewayConfig {
  provider: string;
  merchantId: string;
  apiKey: string;
  enabled: boolean;
  type: 'fiat' | 'upi' | 'crypto';
  walletAddress?: string; // For crypto
}

export interface AdminConfig {
  isAuthenticated: boolean;
  gateways: PaymentGatewayConfig[];
  totalRevenue: number;
}

export interface Transaction {
  id: string;
  amount: number;
  coins: number;
  method: string;
  timestamp: number;
  status: 'completed' | 'pending';
}
