import { Router } from 'express';
import {
  getTdxToken,
  TDX_API_BASE,
  TRTC_LINE_NAMES,
  type TdxLine,
  type TdxStationInfo,
} from '../tdx.js';

const router = Router();

let cache: { data: unknown; expiresAt: number } | null = null;

router.get('/', async (_req, res) => {
  try {
    if (cache && Date.now() < cache.expiresAt) {
      res.json(cache.data);
      return;
    }
    const token = await getTdxToken();

    const [solRes, stationRes] = await Promise.all([
      fetch(`${TDX_API_BASE}/v2/Rail/Metro/StationOfLine/TRTC?$format=JSON`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${TDX_API_BASE}/v2/Rail/Metro/Station/TRTC?$format=JSON`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    if (!solRes.ok) throw new Error(`TDX StationOfLine failed: ${solRes.status}`);
    if (!stationRes.ok) throw new Error(`TDX Station failed: ${stationRes.status}`);

    const [rawLines, rawStations] = await Promise.all([
      solRes.json() as Promise<TdxLine[]>,
      stationRes.json() as Promise<TdxStationInfo[]>,
    ]);

    const posMap = new Map<string, { lat: number; lng: number }>();
    for (const s of rawStations) {
      if (s.StationPosition) {
        posMap.set(s.StationID, {
          lat: s.StationPosition.PositionLat,
          lng: s.StationPosition.PositionLon,
        });
      }
    }

    const lines = rawLines.map((line) => ({
      id: line.LineID,
      name: TRTC_LINE_NAMES[line.LineID] ?? line.LineID,
      stations: line.Stations.map((s) => {
        const pos = posMap.get(s.StationID);
        return { name: s.StationName.Zh_tw, lat: pos?.lat ?? 0, lng: pos?.lng ?? 0 };
      }),
    }));

    cache = { data: lines, expiresAt: Date.now() + 24 * 60 * 60 * 1000 };
    res.json(lines);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Failed to fetch MRT lines:', message);
    res.status(500).json({ error: 'Failed to fetch MRT lines', detail: message });
  }
});

export default router;
