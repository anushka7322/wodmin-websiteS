// Centralised WODMIN brand & contact constants. Update these in one place.
export const BRAND = {
  name: "WODMIN",
  tagline: "Modern Furniture for Every Home.",
  description:
    "Affordable, reliable, modern and durable furniture for Indian homes, offices and businesses.",
};

export const CONTACT = {
  phone: "+91 98765 43210",
  phoneLink: "tel:+919876543210",
  whatsapp: "+91 98765 43210",
  whatsappNumber: "919876543210",
  email: "hello@wodmin.in",
  emailLink: "mailto:hello@wodmin.in",
  address: "WODMIN Experience Store, 12 Linking Road, Bandra West, Mumbai 400050",
  hours: "Mon - Sat, 10:00 AM - 8:00 PM",
  mapUrl: "https://www.google.com/maps?q=Linking+Road+Bandra+West+Mumbai&output=embed",
};

export const SOCIAL = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  youtube: "https://youtube.com/",
  linkedin: "https://linkedin.com/",
};

export const STORES = [
  { city: "Mumbai", address: "12 Linking Road, Bandra West, Mumbai 400050", phone: "+91 98765 43210" },
  { city: "Bengaluru", address: "98 100ft Road, Indiranagar, Bengaluru 560038", phone: "+91 98765 43211" },
  { city: "Hyderabad", address: "21 Banjara Hills, Road No 12, Hyderabad 500034", phone: "+91 98765 43212" },
  { city: "Delhi NCR", address: "B-44 Connaught Place, New Delhi 110001", phone: "+91 98765 43213" },
];

export const buildWhatsAppLink = (message) => {
  const text = encodeURIComponent(message || "Hi WODMIN, I'd like to know more about your furniture.");
  return `https://wa.me/${CONTACT.whatsappNumber}?text=${text}`;
};
