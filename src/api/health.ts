import { API_BASE_URL } from '../config/env';

export type ApiHealthStatus = {
  ok: boolean;
  baseUrl: string;
  message: string;
};

/** Quick reachability check — matches API GET /healthz */
export async function checkApiHealth(): Promise<ApiHealthStatus> {
  const baseUrl = API_BASE_URL;
  const url = `${baseUrl}/healthz`;

  try {
    const res = await fetch(url, { method: 'GET' });
    const text = (await res.text()).trim();
    if (res.ok && (text === 'ok' || text.startsWith('api'))) {
      return { ok: true, baseUrl, message: 'API is online' };
    }
    return {
      ok: false,
      baseUrl,
      message: `API returned ${res.status}${text ? `: ${text.slice(0, 80)}` : ''}`,
    };
  } catch (e) {
    const detail = e instanceof Error ? e.message : 'Network error';
    return {
      ok: false,
      baseUrl,
      message: `Cannot reach API — ${detail}`,
    };
  }
}
