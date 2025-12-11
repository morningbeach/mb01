const GOOGLE_ADS_CONTACT_CONVERSION = "AW-16682749587/-3lVCNr8zs8bEJOd-pI-";
const GOOGLE_ADS_EXTERNAL_CONVERSION = "AW-16682749587/QTWHCLb1kcobEJOd-pI-";
const META_PIXEL_CONTACT_EVENT = "Contact";

export function fireContactConversion(sendTo: string = GOOGLE_ADS_CONTACT_CONVERSION) {
  if (typeof window === "undefined") return;
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", "conversion", { send_to: sendTo });
  }
}

export function reportExternalConversion(url?: string, value = 1, currency = "TWD") {
  if (typeof window === "undefined") return false;
  const callback = () => {
    if (url) window.location.href = url;
  };
  const gtag = (window as any).gtag;
  if (typeof gtag === "function") {
    gtag("event", "conversion", {
      send_to: GOOGLE_ADS_EXTERNAL_CONVERSION,
      value,
      currency,
      event_callback: callback,
    });
    return false;
  }
  callback();
  return true;
}

export function fireMetaContactEvent(eventName: string = META_PIXEL_CONTACT_EVENT) {
  if (typeof window === "undefined") return;
  const fbq = (window as any).fbq;
  if (typeof fbq === "function") {
    fbq("track", eventName);
  }
}

export function fireGTMEvent(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === "undefined") return;
  const dataLayer = (window as any).dataLayer || [];
  dataLayer.push({
    event: eventName,
    ...params,
  });
}

export {
  GOOGLE_ADS_CONTACT_CONVERSION,
  GOOGLE_ADS_EXTERNAL_CONVERSION,
  META_PIXEL_CONTACT_EVENT,
};
