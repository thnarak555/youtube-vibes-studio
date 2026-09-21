import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  userId: number | string;
  nickname: string;
  avatarUrl: string;
  vipType: number;
  signature: string;
  level: number;
  follows: number;
  followeds: number;
  playlistCount: number;
}

interface AuthState {
  isLoggedIn: boolean;
  userProfile: UserProfile | null;
  cookie: string;
  isLoading: boolean;
  qrCodeImg: string | null;
  qrKey: string | null;
  qrStatus: number | null; // 800: expired, 801: waiting scan, 802: authorized, 803: success
  qrStatusMessage: string;

  checkLoginStatus: () => Promise<boolean>;
  generateQrCode: () => Promise<string | null>;
  checkQrCodeStatus: () => Promise<{ code: number; message: string; cookie?: string }>;
  loginWithCookie: (cookie: string) => Promise<boolean>;
  importYesPlayMusicCookie: () => Promise<boolean>;
  logout: () => Promise<void>;
  resetQr: () => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      userProfile: null,
      cookie: '',
      isLoading: false,
      qrCodeImg: null,
      qrKey: null,
      qrStatus: null,
      qrStatusMessage: '',

      setUserProfile: (profile) => {
        set({
          userProfile: profile,
          isLoggedIn: Boolean(profile)
        });
      },

      checkLoginStatus: async () => {
        if (typeof window === 'undefined' || !(window as any).electronAPI?.neteaseGetLoginStatus) {
          return false;
        }
        set({ isLoading: true });
        try {
          const res = await (window as any).electronAPI.neteaseGetLoginStatus();
          if (res && res.isLoggedIn && res.profile) {
            set({
              isLoggedIn: true,
              userProfile: res.profile,
              cookie: res.cookie || get().cookie,
              isLoading: false
            });
            return true;
          } else {
            set({ isLoggedIn: false, userProfile: null, isLoading: false });
            return false;
          }
        } catch (err) {
          set({ isLoggedIn: false, userProfile: null, isLoading: false });
          return false;
        }
      },

      generateQrCode: async () => {
        if (typeof window === 'undefined' || !(window as any).electronAPI?.neteaseLoginQrKey) {
          return null;
        }
        set({ isLoading: true, qrStatus: 801, qrStatusMessage: 'กำลังรอการสแกน QR Code' });
        try {
          const key = await (window as any).electronAPI.neteaseLoginQrKey();
          if (!key) throw new Error('Failed to obtain QR key');
          const qrImg = await (window as any).electronAPI.neteaseLoginQrCreate({ key });
          set({
            qrKey: key,
            qrCodeImg: qrImg,
            isLoading: false,
            qrStatus: 801,
            qrStatusMessage: 'เปิดแอป NetEase Cloud Music เพื่อสแกน'
          });
          return qrImg;
        } catch (err) {
          set({ isLoading: false, qrStatus: 500, qrStatusMessage: 'ไม่สามารถสร้าง QR Code ได้' });
          return null;
        }
      },

      checkQrCodeStatus: async () => {
        const { qrKey } = get();
        if (!qrKey || typeof window === 'undefined' || !(window as any).electronAPI?.neteaseLoginQrCheck) {
          return { code: 500, message: 'No QR key' };
        }
        try {
          const res = await (window as any).electronAPI.neteaseLoginQrCheck({ key: qrKey });
          if (res.code === 800) {
            set({ qrStatus: 800, qrStatusMessage: 'QR Code หมดอายุแล้ว กรุณากดสร้างใหม่' });
          } else if (res.code === 801) {
            set({ qrStatus: 801, qrStatusMessage: 'กำลังรอการสแกนผ่านแอป' });
          } else if (res.code === 802) {
            set({ qrStatus: 802, qrStatusMessage: 'สแกนสำเร็จแล้ว กรุณากดยืนยันในมือถือ' });
          } else if (res.code === 803) {
            set({ qrStatus: 803, qrStatusMessage: 'เข้าสู่ระบบสำเร็จ!', cookie: res.cookie || '' });
            await get().checkLoginStatus();
          }
          return res;
        } catch (err: any) {
          return { code: 500, message: err.message };
        }
      },

      loginWithCookie: async (cookie: string) => {
        if (typeof window === 'undefined' || !(window as any).electronAPI?.neteaseSetCookie) {
          return false;
        }
        set({ isLoading: true });
        try {
          await (window as any).electronAPI.neteaseSetCookie(cookie.trim());
          const success = await get().checkLoginStatus();
          set({ isLoading: false });
          return success;
        } catch (err) {
          set({ isLoading: false });
          return false;
        }
      },

      importYesPlayMusicCookie: async () => {
        if (typeof window === 'undefined' || !(window as any).electronAPI?.neteaseImportYesPlayMusicCookie) {
          return false;
        }
        set({ isLoading: true });
        try {
          const res = await (window as any).electronAPI.neteaseImportYesPlayMusicCookie();
          if (res && res.success) {
            const success = await get().checkLoginStatus();
            set({ isLoading: false });
            return success;
          }
          set({ isLoading: false });
          return false;
        } catch (err) {
          set({ isLoading: false });
          return false;
        }
      },

      logout: async () => {
        if (typeof window !== 'undefined' && (window as any).electronAPI?.neteaseLogout) {
          await (window as any).electronAPI.neteaseLogout();
        }
        set({
          isLoggedIn: false,
          userProfile: null,
          cookie: '',
          qrCodeImg: null,
          qrKey: null,
          qrStatus: null,
          qrStatusMessage: ''
        });
      },

      resetQr: () => {
        set({
          qrCodeImg: null,
          qrKey: null,
          qrStatus: null,
          qrStatusMessage: ''
        });
      }
    }),
    {
      name: 'lyric_studio_auth_v1',
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        userProfile: state.userProfile,
        cookie: state.cookie
      })
    }
  )
);
