import { User, Org } from "@shared/schema";

export interface AuthState {
  user: User | null;
  org: Org | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLearner: boolean;
}

export function hasRole(user: User | null, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'admin') || hasRole(user, 'owner');
}

export function isLearner(user: User | null): boolean {
  return hasRole(user, 'learner');
}
