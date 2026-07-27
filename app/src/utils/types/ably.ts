import type { PresenceMessage } from "ably"

export interface RealtimeUserData {
  username: string;
  userId: string;
  color: string;
}

export type PixelGardenPresenceMessage = Omit<PresenceMessage, 'data'> & {
  data: RealtimeUserData;
}
