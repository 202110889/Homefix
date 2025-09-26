import axios from "axios";

// 기본 API 설정
const DEFAULT_BASE_URL = "http://172.30.1.6:8000";

class ApiConfig {
  private baseUrl: string = DEFAULT_BASE_URL;
  private isAutoDetecting: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.loadConfig();
    this.initialize();
  }

  // 설정 로드
  private loadConfig() {
    try {
      const savedConfig = localStorage.getItem("apiConfig");
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        this.baseUrl = config.baseUrl || DEFAULT_BASE_URL;
      }
    } catch (error) {
      console.warn("설정 로드 실패:", error);
      this.baseUrl = DEFAULT_BASE_URL;
    }
  }

  // 설정 저장
  private saveConfig() {
    try {
      const config = {
        baseUrl: this.baseUrl,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem("apiConfig", JSON.stringify(config));
    } catch (error) {
      console.warn("설정 저장 실패:", error);
    }
  }

  // 앱 시작 시 자동 초기화
  private async initialize() {
    if (this.isInitialized) return;

    console.log("🔍 서버 자동 감지 시작...");

    // 백그라운드에서 자동 감지 실행
    setTimeout(async () => {
      try {
        await this.autoDetectServer();
        this.isInitialized = true;
        console.log("✅ 서버 자동 감지 완료:", this.baseUrl);
      } catch (error) {
        console.warn("⚠️ 서버 자동 감지 실패, 기본 설정 사용:", this.baseUrl);
        this.isInitialized = true;
      }
    }, 1000); // 1초 후 실행
  }

  // 현재 Base URL 반환
  getBaseUrl(): string {
    return this.baseUrl;
  }

  // Base URL 설정
  setBaseUrl(url: string) {
    this.baseUrl = url;
    this.saveConfig();
  }

  // 서버 IP 자동 감지
  async autoDetectServer(): Promise<string | null> {
    if (this.isAutoDetecting) {
      return null;
    }

    this.isAutoDetecting = true;

    try {
      // 먼저 현재 설정된 IP로 연결 시도
      const currentConnected = await this.checkConnection();
      if (currentConnected) {
        this.isAutoDetecting = false;
        return this.baseUrl;
      }

      // 여러 가능한 IP 주소 시도 (더 많은 범위 포함)
      const possibleIPs = [
        "172.30.1.6", // 기존 IP
        "172.16.203.17", // 현재 IP
        "192.168.1.100",
        "192.168.1.101",
        "192.168.1.102",
        "192.168.0.100",
        "192.168.0.101",
        "192.168.0.102",
        "10.0.0.100",
        "10.0.0.101",
        "10.0.0.102",
        "172.16.0.100",
        "172.16.0.101",
        "172.16.0.102",
        "192.168.1.1",
        "192.168.0.1",
        "10.0.0.1",
      ];

      console.log("🔍 서버 IP 자동 감지 중...");

      for (const ip of possibleIPs) {
        try {
          const testUrl = `http://${ip}:8000/server-info/`;
          const response = await axios.get(testUrl, { timeout: 1500 });

          if (response.status === 200) {
            const serverInfo = response.data;
            this.setBaseUrl(serverInfo.base_url);
            this.isAutoDetecting = false;
            console.log("✅ 서버 발견:", serverInfo.base_url);
            return serverInfo.base_url;
          }
        } catch (error) {
          // 이 IP는 사용할 수 없음, 다음 IP 시도
          continue;
        }
      }

      // 모든 IP 시도 실패
      this.isAutoDetecting = false;
      console.warn("⚠️ 사용 가능한 서버를 찾을 수 없습니다.");
      return null;
    } catch (error) {
      this.isAutoDetecting = false;
      console.error("서버 자동 감지 실패:", error);
      return null;
    }
  }

  // 네트워크 상태 확인
  async checkConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/server-info/`, {
        timeout: 3000,
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  // 연결 상태에 따른 자동 재연결
  async ensureConnection(): Promise<boolean> {
    const isConnected = await this.checkConnection();

    if (!isConnected) {
      console.log("🔌 서버 연결 실패, 자동 재연결 시도...");
      const newUrl = await this.autoDetectServer();
      if (newUrl) {
        console.log("✅ 자동 재연결 성공:", newUrl);
        return true;
      } else {
        console.warn("❌ 자동 재연결 실패");
        return false;
      }
    }

    return true;
  }

  // 백그라운드에서 주기적으로 연결 상태 확인
  startBackgroundMonitoring() {
    // 30초마다 연결 상태 확인
    setInterval(async () => {
      if (!this.isAutoDetecting) {
        await this.ensureConnection();
      }
    }, 30000);
  }
}

// 싱글톤 인스턴스
export const apiConfig = new ApiConfig();

// 백그라운드 모니터링 시작
apiConfig.startBackgroundMonitoring();

// API 요청을 위한 axios 인스턴스 생성
export const createApiClient = () => {
  return axios.create({
    baseURL: apiConfig.getBaseUrl(),
    timeout: 10000,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// 동적 API 클라이언트 (IP 변경 시 자동 업데이트)
export const getApiClient = async () => {
  await apiConfig.ensureConnection();
  return createApiClient();
};
