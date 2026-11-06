/* IRIS Biopsy: site settings
   This is the only file you need to edit to connect the form and analytics.
   See README.md, "Connect the early access form to HubSpot". */
window.IRIS_CONFIG = {
  // Shown to visitors as the fallback if the form can't send.
  contactEmail: "info@irisbiopsy.com",

  // HubSpot (IRIS account). Copy these three values from the form's embed code in HubSpot.
  hubspot: {
    portalId: "247298430",
    formId: "65da0723-fbec-42aa-a518-0623ba41b214", // "Contact Us" form, IRIS account
    region: "na2",  // "na1", "na2" or "eu1", as shown in the embed code
    trackingCode: true, // also load HubSpot's tracking script (page views, lead source)
    // The HubSpot form has First name, Last name, Email, Phone number, Company,
    // Job title and Message. Role goes into Job title. If you ever remove Job title from
    // the HubSpot form, set this to false and role will be written into Message instead.
    sendJobTitle: true
  },

  // Carried over from the previous site.
  googleAnalyticsId: "G-VTQXTF7QM9",
  linkedInPartnerId: "8024780",
  linkedInConversionId: "" // optional: LinkedIn Campaign Manager conversion ID
};
