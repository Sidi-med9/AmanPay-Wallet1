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
import { BIOMETRIC_LOGIN_IDENTIFIER_KEY, BIOMETRIC_LOGIN_PASSWORD_KEY } from "../constants/storageKeys";

const USER_KEY = "@user";
const ACCESS_KEY = "@accessToken";
const REFRESH_KEY = "@refreshToken";
const PROFILE_OVERRIDES_PREFIX = "@profile_overrides_";

interface AuthContextType {
  user: AppUser | null;
  isLoading: boolean;
  accessToken: string | null;
  canBiometricLogin: boolean;
  signIn: (credentials: { identifier: string; password: string }) => Promise<void>;
  signInWithBiometric: () => Promise<void>;
  signUp: (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    accountType?: "user" | "merchant";
    merchantCategory?: string;
  }) => Promise<void>;
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
  const [canBiometricLogin, setCanBiometricLogin] = useState(false);

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
        const [[, userRaw], [, accessRaw], [, bioIdentifier], [, bioPassword]] = await AsyncStorage.multiGet([
          USER_KEY,
          ACCESS_KEY,
          BIOMETRIC_LOGIN_IDENTIFIER_KEY,
          BIOMETRIC_LOGIN_PASSWORD_KEY,
        ]);
        setCanBiometricLogin(Boolean(bioIdentifier && bioPassword));
        if (userRaw && accessRaw) {
          const parsed = JSON.parse(userRaw) as AppUser;
          const hydrated = await applyProfileOverrides(sanitizeAvatar(parsed));
          setUser(hydrated);
          setAccessToken(accessRaw);
        } else {
          setUser(null);
          setAccessToken(null);
        }
      } catch (e) {
        console.error(e);
        setUser(null);
        setAccessToken(null);
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
      await AsyncStorage.multiSet([
        [USER_KEY, JSON.stringify(u)],
        [ACCESS_KEY, at],
        [REFRESH_KEY, rt],
        [BIOMETRIC_LOGIN_IDENTIFIER_KEY, credentials.identifier.trim()],
        [BIOMETRIC_LOGIN_PASSWORD_KEY, credentials.password],
      ]);
      setCanBiometricLogin(true);
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithBiometric = async () => {
    setIsLoading(true);
    try {
      const localAuth = require("expo-local-authentication") as {
        hasHardwareAsync: () => Promise<boolean>;
        isEnrolledAsync: () => Promise<boolean>;
        authenticateAsync: (options: {
          promptMessage: string;
          cancelLabel?: string;
          fallbackLabel?: string;
        }) => Promise<{ success: boolean }>;
      };
      const [[, identifier], [, password]] = await AsyncStorage.multiGet([
        BIOMETRIC_LOGIN_IDENTIFIER_KEY,
        BIOMETRIC_LOGIN_PASSWORD_KEY,
      ]);
      const [hasHardware, enrolled] = await Promise.all([localAuth.hasHardwareAsync(), localAuth.isEnrolledAsync()]);
      if (!identifier || !password || !hasHardware || !enrolled) {
        throw new Error("BIOMETRIC_LOGIN_NOT_READY");
      }
      const result = await localAuth.authenticateAsync({
        promptMessage: "Sign in with biometrics",
        cancelLabel: "Cancel",
        fallbackLabel: "Use password",
      });
      if (!result.success) {
        throw new Error("BIOMETRIC_CANCELLED");
      }
      await signIn({ identifier, password });
    } catch (e) {
      setIsLoading(false);
      throw e;
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    accountType?: "user" | "merchant";
    merchantCategory?: string;
  }) => {
    setIsLoading(true);
    try {
      const { user: next, accessToken: at, refreshToken: rt } = await register(data);
      const u = await applyProfileOverrides(sanitizeAvatar(next));
      setUser(u);
      setAccessToken(at);
      await AsyncStorage.multiSet([
        [USER_KEY, JSON.stringify(u)],
        [ACCESS_KEY, at],
        [REFRESH_KEY, rt],
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AppUser>) => {
    if (!user) return;
    const updatedUser = sanitizeAvatar({ ...user, ...data });
    setUser(updatedUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
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
        canBiometricLogin,
        signIn,
        signInWithBiometric,
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
