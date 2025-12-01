const GOOGLE_ADS_CONTACT_CONVERSION = "AW-16682749587/yrKJCKbG6JsaEJOd-pI-";

export function fireContactConversion(sendTo: string = GOOGLE_ADS_CONTACT_CONVERSION) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", "conversion", { send_to: sendTo });
  }
}

export { GOOGLE_ADS_CONTACT_CONVERSION };
