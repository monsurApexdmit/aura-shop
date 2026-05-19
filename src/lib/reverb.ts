import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { COMPANY_ID, USE_SUBDOMAIN } from "@/lib/api";
import type { SupportMessage, SupportTicket, TicketStatus } from "@/services/supportApi";

const REVERB_ENABLED = (import.meta.env.VITE_REVERB_ENABLED as string) === "true";
const REVERB_KEY = (import.meta.env.VITE_REVERB_APP_KEY as string) || "local-app-key";
const REVERB_SCHEME = ((import.meta.env.VITE_REVERB_SCHEME as string) || "http") as "http" | "https";
const REVERB_HOST = (import.meta.env.VITE_REVERB_HOST as string) || window.location.hostname;
const REVERB_PORT = Number(import.meta.env.VITE_REVERB_PORT || (REVERB_SCHEME === "https" ? 443 : 8080));

let echo: any = null;

declare global {
  interface Window {
    Pusher: typeof Pusher;
  }
}

type TicketHandlers = {
  onMessageSent?: (ticketId: number, message: SupportMessage) => void;
  onStatusUpdated?: (ticketId: number, status: TicketStatus) => void;
  onPriorityUpdated?: (ticketId: number, priority: SupportTicket["priority"]) => void;
};

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("customer_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

type EchoOptions = {
  guestToken?: string;
};

export function getSupportEcho(options?: EchoOptions) {
  if (typeof window === "undefined") return null;
  if (!REVERB_ENABLED) return null;

  const authParams: Record<string, string> = {
    ...(!USE_SUBDOMAIN && COMPANY_ID ? { company_id: COMPANY_ID } : {}),
  };

  if (options?.guestToken) {
    authParams.guest_token = options.guestToken;
  }

  if (!echo) {
    window.Pusher = Pusher;

    echo = new Echo({
      broadcaster: "reverb",
      key: REVERB_KEY,
      wsHost: REVERB_HOST,
      wsPort: REVERB_PORT,
      wssPort: REVERB_PORT,
      forceTLS: REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: "/api/store/realtime/auth",
      auth: {
        headers: getAuthHeaders(),
        params: authParams,
      },
    });
  } else {
    echo.connector.options.auth = {
      headers: getAuthHeaders(),
      params: authParams,
    };
  }

  return echo;
}

export function subscribeToSupportTicket(ticketId: number, handlers: TicketHandlers): () => void {
  const client = getSupportEcho();
  if (!client) return () => {};

  const channel = client.private(`support.ticket.${ticketId}`);

  if (handlers.onMessageSent) {
    channel.listen(".support.ticket.message.sent", (event: { ticketId: number; message: SupportMessage }) => {
      handlers.onMessageSent?.(event.ticketId, event.message);
    });
  }

  if (handlers.onStatusUpdated) {
    channel.listen(".support.ticket.status.updated", (event: { ticketId: number; status: TicketStatus }) => {
      handlers.onStatusUpdated?.(event.ticketId, event.status);
    });
  }

  if (handlers.onPriorityUpdated) {
    channel.listen(".support.ticket.priority.updated", (event: { ticketId: number; priority: SupportTicket["priority"] }) => {
      handlers.onPriorityUpdated?.(event.ticketId, event.priority);
    });
  }

  return () => {
    client.leave(`support.ticket.${ticketId}`);
  };
}

export function subscribeToGuestSupportTicket(ticketId: number, guestToken: string, handlers: TicketHandlers): () => void {
  const client = getSupportEcho({ guestToken });
  if (!client) return () => {};

  const channel = client.private(`support.ticket.${ticketId}`);

  if (handlers.onMessageSent) {
    channel.listen(".support.ticket.message.sent", (event: { ticketId: number; message: SupportMessage }) => {
      handlers.onMessageSent?.(event.ticketId, event.message);
    });
  }

  if (handlers.onStatusUpdated) {
    channel.listen(".support.ticket.status.updated", (event: { ticketId: number; status: TicketStatus }) => {
      handlers.onStatusUpdated?.(event.ticketId, event.status);
    });
  }

  if (handlers.onPriorityUpdated) {
    channel.listen(".support.ticket.priority.updated", (event: { ticketId: number; priority: SupportTicket["priority"] }) => {
      handlers.onPriorityUpdated?.(event.ticketId, event.priority);
    });
  }

  return () => {
    client.leave(`support.ticket.${ticketId}`);
  };
}
