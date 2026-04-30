import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useLayoutEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  login,
  register,
  logoutRemote,
  type AppUser,
} from "../services/amanpayApi";
import { setApiAuthGetters, clearApiAuthGetters } from "../services/apiClient";

const USER_KEY = "@user";
const ACCESS_KEY = "@accessToken";
const REFRESH_KEY = "@refreshToken";
const PROFILE_OVERRIDES_PREFIX = "@profile_overrides_";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  accessToken: string | null;
  signIn: (credentials: { identifier: string; password: string }) => Promise<void>;
  signUp: (data: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

function sanitizeAvatar(u: AppUser): AppUser {
  if (u.avatar?.includes("pravatar")) return { ...u, avatar: "" };
  return u;
}

async function applyProfileOverrides(u: AppUser): Promise<AppUser> {
  const raw = await AsyncStorage.getItem(PROFILE_OVERRIDES_PREFIX + u.id);
  if (!raw) return u;
  try {
    const parsed = JSON.parse(raw) as Partial<AppUser>;
    return sanitizeAvatar({ ...u, ...parsed });
  } catch {
    return u;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    setApiAuthGetters({
      getAccessToken: () => accessToken,
      getUserId: () => user?.dbUserId ?? null,
    });
  }, [user, accessToken]);

  useEffect(() => {
    return () => clearApiAuthGetters();
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // App re-open should always require a fresh login.
        await AsyncStorage.multiRemove([USER_KEY, ACCESS_KEY, REFRESH_KEY]);
        setUser(null);
        setAccessToken(null);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = async (credentials: { identifier: string; password: string }) => {
    setIsLoading(true);
    try {
      const { user: next, accessToken: at, refreshToken: rt } = await login(credentials);
      const u = await applyProfileOverrides(sanitizeAvatar(next));
      setUser(u);
      setAccessToken(at);
      await AsyncStorage.setItem(REFRESH_KEY, rt);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: { name: string; email: string; phone?: string; password: string }) => {
    setIsLoading(true);
    try {
      const { user: next, accessToken: at, refreshToken: rt } = await register(data);
      const u = await applyProfileOverrides(sanitizeAvatar(next));
      setUser(u);
      setAccessToken(at);
      await AsyncStorage.setItem(REFRESH_KEY, rt);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) return;
    const updatedUser = sanitizeAvatar({ ...user, ...data });
    setUser(updatedUser);
    await AsyncStorage.setItem(PROFILE_OVERRIDES_PREFIX + user.id, JSON.stringify(data));
  };

  const signOut = async () => {
    const refresh = await AsyncStorage.getItem(REFRESH_KEY);
    setUser(null);
    setAccessToken(null);
    clearApiAuthGetters();
    await AsyncStorage.multiRemove([USER_KEY, ACCESS_KEY, REFRESH_KEY]);
    if (refresh) {
      try {
        await logoutRemote(refresh);
      } catch {
        /* ignore */
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        accessToken,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
