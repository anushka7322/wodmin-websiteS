import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/contact";

export default function FloatingWhatsApp() {
  return (
    <a
      data-testid="floating-whatsapp-btn"
      aria-label="Chat on WhatsApp"
      href={buildWhatsAppLink("Hi WODMIN! I'd like to enquire about your furniture.")}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-whatsapp text-white shadow-lg shadow-brand-whatsapp/30 transition-transform hover:scale-110 sm:bottom-8 sm:right-8"
      style={{ marginBottom: "var(--badge-offset, 56px)" }}
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">WhatsApp</span>
    </a>
  );
}
