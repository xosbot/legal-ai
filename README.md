<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1EGHaUWbk_4zEdlss8nF1GpzJp3gwRClz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Vercel custom domain troubleshooting (site not loading)

If your domain was added in Vercel but the site still does not open, verify all of the following:

1. **Domain records exactly match Vercel UI**
   - In **Vercel → Project → Domains**, open each domain and copy the exact record values shown.
   - Typical values are:
     - Apex (`@`) → `A` record to `76.76.21.21`
     - `www` → `CNAME` to `cname.vercel-dns.com`

2. **No conflicting DNS records in Namecheap**
   - In **Namecheap → Advanced DNS**, remove old/duplicate `A` or `CNAME` records for the same host (`@` or `www`).
   - Keep only the records required by Vercel for each host.

3. **Wait for DNS propagation**
   - Changes can take a few minutes to several hours.
   - Retry Vercel domain validation until it shows **Valid Configuration**.

4. **Confirm DNS resolution from terminal**
   - `dig +short A yourdomain.com`
   - `dig +short CNAME www.yourdomain.com`

5. **Ensure the domain is assigned to this project**
   - In Vercel Domains page, confirm the domain is attached to the intended project/environment.

6. **Force HTTPS / clear cache**
   - Try `https://yourdomain.com` directly.
   - Use an incognito window or clear DNS/browser cache.

If DNS is valid in Vercel but the page is still blank/erroring, check **Vercel Deployments → latest deployment logs** for runtime/build issues unrelated to DNS.
