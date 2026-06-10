const TDX_AUTH_URL = 'https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token';
export const TDX_API_BASE = 'https://tdx.transportdata.tw/api/basic';

export const TRTC_LINE_NAMES: Record<string, string> = {
  BL: '板南線',
  R: '淡水信義線',
  G: '松山新店線',
  O: '中和新蘆線',
  BR: '文湖線',
};

let tokenCache: { token: string; expiresAt: number } | null = null;

export async function getTdxToken(): Promise<string> {
  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  const clientId = process.env.TDX_CLIENT_ID;
  const clientSecret = process.env.TDX_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('TDX_CLIENT_ID or TDX_CLIENT_SECRET is not set in .env');
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
  });
  const res = await fetch(TDX_AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TDX auth failed (${res.status}): ${text}`);
  }
  const data = await res.json() as { access_token: string; expires_in: number };
  tokenCache = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return tokenCache.token;
}

export interface TdxStation {
  Sequence: number;
  StationID: string;
  StationName: { Zh_tw: string; En: string };
  CumulativeDistance: number;
}

export interface TdxLine {
  LineID: string;
  Stations: TdxStation[];
}

export interface TdxStationInfo {
  StationID: string;
  StationName: { Zh_tw: string; En: string };
  StationPosition?: { PositionLat: number; PositionLon: number };
}
