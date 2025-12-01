const GOOGLE_ADS_CONTACT_CONVERSION = "AW-16682749587/yrKJCKbG6JsaEJOd-pI-";
const GOOGLE_ADS_EXTERNAL_CONVERSION = "AW-16682749587/QTWHCLb1kcobEJOd-pI-";

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

export { GOOGLE_ADS_CONTACT_CONVERSION, GOOGLE_ADS_EXTERNAL_CONVERSION };
