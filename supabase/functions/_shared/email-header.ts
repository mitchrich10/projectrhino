// Shared email header used across ALL Resend-using edge functions so branding
// stays identical everywhere. Treatment: Navy (#173660) background, white
// "RHINO" wordmark, "PARTNER PORTAL" eyebrow below.
//
// Inline styles only — most email clients (Gmail, Outlook) strip <style> blocks.
//
// `eyebrow` defaults to "Partner Portal" but can be overridden for context
// (e.g. internal admin notifications) while keeping the same visual treatment.
export const emailHeader = (eyebrow = "Partner Portal"): string => `
  <div style="background: #173660; padding: 24px 32px; font-family: Arial, Helvetica, sans-serif;">
    <h1 style="color: #ffffff; font-size: 22px; font-weight: bold; letter-spacing: -1px; line-height: 1.2; margin: 0; text-transform: uppercase; font-family: Arial, Helvetica, sans-serif;">RHINO</h1>
    <p style="color: #aaaaaa; font-size: 10px; font-weight: bold; letter-spacing: 3px; line-height: 1.4; text-transform: uppercase; margin: 2px 0 0; font-family: Arial, Helvetica, sans-serif;">${eyebrow}</p>
  </div>
`;
