# Deploying PseudoLab to GitHub Pages with your own domain

This guide publishes the site to **GitHub Pages** (free, HTTPS) and points your **apex domain**
(e.g. `pseudolab.tech`) at it. Total time ≈ 15 minutes + DNS propagation.

Throughout, replace:
- `mikezzx2009` → your GitHub username
- `pseudolab.tech` → your real domain

---

## 0. Before you start

You need: a [GitHub account](https://github.com), `git` installed, and a domain you own.

Edit these placeholders in the project first:
- **`CNAME`** — change `example.com` to `pseudolab.tech`
- **`README.md`** — replace `mikezzx2009` and `pseudolab.tech`
- **`package.json`** — replace `mikezzx2009`
- **`LICENSE`** — put your name (optional)

> Tip: this repo includes `node_modules/` only if you ran the optional UI test. It is already in
> `.gitignore`, so it will **not** be pushed — you can also just delete that folder.

---

## 1. Create an empty repository on GitHub

Go to **https://github.com/new** and create a repo named `pseudolab`
(Public, **do not** add a README/license/.gitignore — this project already has them).

---

## 2. Push the code

From the project folder:

```bash
git init
git add .
git commit -m "PseudoLab: initial release"
git branch -M main
git remote add origin https://github.com/mikezzx2009/pseudolab.git
git push -u origin main
```

---

## 3. Turn on GitHub Pages (via Actions)

1. On GitHub, open your repo → **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it — the included workflow (`.github/workflows/deploy.yml`) runs on every push to `main`:
it builds `index.html` from `src/`, runs the tests, and deploys. Watch progress in the **Actions** tab.
When it's green your site is live at `https://mikezzx2009.github.io/pseudolab/`.

---

## 4. Attach your apex domain

1. Repo → **Settings → Pages → Custom domain** → enter `pseudolab.tech` → **Save**.
   (GitHub will run a DNS check — it stays "unverified" until step 5 propagates. That's normal.)
2. Make sure the repo's **`CNAME`** file contains exactly `pseudolab.tech` (you edited it in step 0).
   Both must match.

---

## 5. Configure DNS at your registrar

In your domain registrar's DNS settings, add these records.

**Apex domain → A records (required):**

| Type | Host / Name | Value           |
|------|-------------|-----------------|
| A    | `@`         | `185.199.108.153` |
| A    | `@`         | `185.199.109.153` |
| A    | `@`         | `185.199.110.153` |
| A    | `@`         | `185.199.111.153` |

**IPv6 → AAAA records (recommended):**

| Type | Host / Name | Value                  |
|------|-------------|------------------------|
| AAAA | `@`         | `2606:50c0:8000::153` |
| AAAA | `@`         | `2606:50c0:8001::153` |
| AAAA | `@`         | `2606:50c0:8002::153` |
| AAAA | `@`         | `2606:50c0:8003::153` |

**`www` redirect → CNAME (recommended):**

| Type  | Host / Name | Value                 |
|-------|-------------|-----------------------|
| CNAME | `www`       | `mikezzx2009.github.io.` |

Notes:
- `@` means the root/apex of your domain. Some registrars label it differently (blank, or `pseudolab.tech`).
- If your registrar doesn't allow A records on the apex, use an **ALIAS** / **ANAME** record pointing to `mikezzx2009.github.io` instead.
- Remove any old/parking A or AAAA records on `@` first, or the verification will fail.
- DNS can take from a few minutes up to **24 hours** to propagate.

With both apex and `www` configured, GitHub automatically redirects between them.

---

## 6. Force HTTPS

Once the custom domain shows a green check in **Settings → Pages**, tick **Enforce HTTPS**.
GitHub provisions a free TLS certificate automatically (can take up to an hour after DNS resolves).

Visit `https://pseudolab.tech` — you should see PseudoLab. 🎉

---

## 7. Updating the site later

Just edit `src/…`, then:

```bash
node build.js          # rebuild index.html (optional locally; CI also does it)
git add -A && git commit -m "Update lessons" && git push
```

The push triggers the workflow and your live site updates in a minute or two.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Pages shows 404 | Make sure **Source = GitHub Actions** and the latest workflow run is green (Actions tab). |
| "Domain's DNS record could not be verified" | DNS hasn't propagated yet, or old A/AAAA records still exist on `@`. Recheck step 5, wait, then click **Save** again. |
| HTTPS box greyed out | Wait until the domain verifies and the certificate is issued (up to ~1 hour), then it becomes tickable. |
| `www` doesn't work | Add the `www` CNAME → `mikezzx2009.github.io.` (note the trailing dot some registrars require). |
| Custom domain "taken" / keeps disappearing | The `CNAME` file in the repo and the **Settings → Pages** custom domain must be identical. |
| Check DNS from terminal | `dig pseudolab.tech +short` should list the four `185.199.x.153` IPs. |

---

## Bonus: tips to gather ⭐

- Add a repo **Description** and the live URL (the small ⚙️ next to "About" on the repo home).
- Add **Topics**: `pseudocode`, `cambridge`, `a-level`, `computer-science`, `education`, `interpreter`.
- Settings → General → **Social preview**: upload an image so links look great when shared.
- Pin the repo to your profile, and share it in A‑Level / CS study communities.
