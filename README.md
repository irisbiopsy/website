# irisbiopsy.com

The marketing site for IRIS, the single-use, skin-mounted needle guide for CT-guided procedures.
It is a plain static site (HTML, CSS and a little JavaScript) with no build step, hosted on Vercel.

```
index.html              The page
404.html                "Page not found" page (Vercel serves it automatically)
css/styles.css          All styles; colors and fonts are the variables at the top
js/config.js            Settings: HubSpot IDs, contact email, analytics IDs (edit this one)
js/main.js              Menu, scroll effects, early access form (sends to HubSpot)
js/analytics.js         Google Analytics, LinkedIn Insight Tag, HubSpot tracking code
assets/fonts/           DM Serif Display + Inter, self-hosted
assets/img/             Logos (SVG), favicons, hero animation, team photos, step diagrams, share image
scripts/                One-time helper to copy files from the old site
vercel.json             Clean URLs, redirects, security and cache headers
robots.txt, sitemap.xml, site.webmanifest
```

## Before you go live (checklist)

1. **Keep the IR survey page (optional).** If you still want `irisbiopsy.com/survey.html`
   to work after the move, run this from the repo folder while the old site is still up:

   ```bash
   bash scripts/fetch-legacy-assets.sh
   ```

   It saves `survey.html` into the repo. Open it in a browser before you publish it: if
   it loads files from the old site, copy those too.

2. **Finish the HubSpot form settings** (next section). The site is already connected to
   the IRIS HubSpot form; three settings on the HubSpot side remain.

3. **Deploy to Vercel and test the `*.vercel.app` link** on a phone and a laptop.

4. **Point the domain at Vercel** (GoDaddy steps below).

## Connect the early access form to HubSpot

The site keeps its own form design and sends each submission to a form in the IRIS
HubSpot account. Every request becomes (or updates) a HubSpot contact, and HubSpot can
email you when one arrives.

**Status:** connected. The site sends to the IRIS account's "Contact Us" form (portal
`247298430`, region `na2`). HubSpot accepted a test request from irisbiopsy.com on
November 6, 2026; that test left out the email on purpose, so it created no contact.

**1. The HubSpot form's fields.**
The HubSpot form must keep these seven contact fields:

| HubSpot field | Filled from the site's   |
|---------------|--------------------------|
| First name    | First name               |
| Last name     | Last name                |
| Email         | Work email               |
| Phone number  | Phone (optional)         |
| Company name  | Institution or practice  |
| Job title     | Role                     |
| Message       | Everything else          |

The site only sends fields that exist on the HubSpot form; HubSpot can reject a
submission that includes a field its form doesn't have. Monthly volume, interests, the
visitor's note and the campaign source are written into **Message**, so nothing is lost.
The site already requires first name, last name, email, institution and role, so it
doesn't matter which fields are marked required in HubSpot.

If you ever remove **Job title** from the HubSpot form, set `sendJobTitle: false` in
`js/config.js` and role will be written into Message instead.

**2. Check two settings on that form.**
- **CAPTCHA off.** HubSpot rejects outside-site submissions when it's on. The site has
  its own spam trap.
- Under notifications, **send submission emails to info@irisbiopsy.com** (and anyone
  else who should know).

**3. If you switch to a different HubSpot form,** open its **Share** or **Embed** code and
copy `data-portal-id`, `data-form-id` and `data-region` into `js/config.js`.

**4. Avoid duplicate contacts.** In HubSpot settings, go to **Marketing → Forms →
Non-HubSpot forms** and turn off **Collect data from website forms**. Otherwise HubSpot's
tracking code may record each submission a second time.

**5. Test.** Open the Vercel test link, submit the form with your own email, and check
that the contact appears in HubSpot with role in **Job title** and the rest in **Message**. If
anything goes wrong, visitors see a message offering an email link to info@, and the
browser console shows HubSpot's exact error.

**Track campaigns.** Add UTM tags to links in outreach emails, for example
`https://www.irisbiopsy.com/?utm_source=email&utm_campaign=ir-outreach`. The campaign is
added to the Message field, and HubSpot's tracking code records the original source on
the contact.

**Analytics.** Google Analytics (`G-VTQXTF7QM9`) and the LinkedIn Insight Tag carry over
from the old site. Each successful submission is recorded in Google Analytics as a
`generate_lead` event. To count it as a LinkedIn conversion too, create a conversion in
LinkedIn Campaign Manager and paste its ID into `linkedInConversionId` in `js/config.js`.

## Preview locally

Open `index.html` directly in a browser, or run a small local server from this folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy: GitHub, then Vercel

1. Create a new GitHub repository (for example `iris-website`) and push this folder:

   ```bash
   git init
   git add -A
   git commit -m "New IRIS website"
   git branch -M main
   git remote add origin https://github.com/YOUR-ORG/iris-website.git
   git push -u origin main
   ```

2. In Vercel, click **Add New → Project**, import the repository, and keep the defaults:
   Framework Preset **Other**, no build command, output directory = the repo root.
   Click **Deploy**.
3. Every push to `main` now redeploys the site automatically. Pushes to other branches get
   their own preview links, which is handy for reviewing edits before they go live.

## Point irisbiopsy.com at Vercel (GoDaddy DNS)

1. In Vercel, open the project → **Settings → Domains**. Add `www.irisbiopsy.com`, then
   add `irisbiopsy.com` and choose to **redirect it to www.irisbiopsy.com**.
2. Vercel shows the DNS records each domain needs. **Use the values Vercel shows you.**
   They're typically:

   | Type  | Name  | Value                                                        |
   |-------|-------|--------------------------------------------------------------|
   | A     | `@`   | the IP Vercel shows (often `76.76.21.21`)                    |
   | CNAME | `www` | the target Vercel shows (project-specific, ends in `vercel-dns…com`) |

3. In GoDaddy, go to **My Products → irisbiopsy.com → DNS**.
   - Edit the existing **A** record named `@` so it points to Vercel's IP. Delete any
     other A records named `@` (left over from GoDaddy hosting, parking or Website Builder).
   - Edit the **CNAME** named `www` so it points to Vercel's target.
   - If domain **Forwarding** is turned on in GoDaddy, turn it off.
4. **Don't change the nameservers, and leave the MX and TXT records alone.** Those carry
   your @irisbiopsy.com email. Only the two records above need to change.
5. Back in Vercel, wait for both domains to show **Valid Configuration**. This usually takes
   minutes and can take up to a few hours. Vercel issues the SSL certificate automatically.

Old links keep working: `irisbiopsy.com/index.html#top` redirects to the home page.

## Editing content

- **Text:** everything is in `index.html`, one section per block. Look for the
  `<!-- ============ Section name ============ -->` comments.
- **Research numbers:** the 33% and 53% figures appear in the hero, the Evidence section,
  the benefit cards, the comparison table, the page description at the top of `index.html`,
  and `assets/img/og-image.png`. The source note is the `id="fn-1"` paragraph.
- **Colors and fonts:** the variables at the top of `css/styles.css`.
- **Video:** the Vimeo embed is in the Video section. To swap in a new video, copy the
  `src` URL from Vimeo's embed code (keep the `?h=` part; private and unlisted videos
  won't play without it) and replace the existing one. The extra settings after it
  (`badge=0`, `title=0` and so on) hide Vimeo's title bar and can stay.
- **Hero animation:** replace `assets/img/iris-hero.gif` with a file of the same name.
  `assets/img/iris-hero-still.webp` is the still frame shown to visitors who have
  "reduce motion" turned on; swap it too if the animation changes.
- **Team photos:** `assets/img/team-dann-martin.webp` and
  `assets/img/team-jonathan-sadlowe.webp` (square, 400×400). If a photo is missing, the
  card shows initials instead.
- **Step diagrams:** `assets/img/step-1-align.svg`, `step-2-measure.svg`,
  `step-3-advance.svg`. Replace them with renders or photos (any format) and update the
  three `src` attributes.
- **Regulatory disclaimer:** in the footer. Update it whenever the device's regulatory
  status changes.
