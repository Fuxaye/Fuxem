# GitHub Actions deploy SSH key

One dedicated key for CI deploy only (`github-actions-fuxem-deploy`). Do not commit the private key.

## 1. Install the public key on the VPS

SSH into the server with your normal admin key, then run (replace `DEPLOY_USER` if not `root`):

```bash
DEPLOY_USER=root
mkdir -p "/home/${DEPLOY_USER}/.ssh" 2>/dev/null || mkdir -p "/root/.ssh"
echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAKVab17/2p+hIGSw1Kmx8YeeoWyVskj2s3V5r5+SRdz github-actions-fuxem-deploy' >> "/home/${DEPLOY_USER}/.ssh/authorized_keys" 2>/dev/null || \
  echo 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAKVab17/2p+hIGSw1Kmx8YeeoWyVskj2s3V5r5+SRdz github-actions-fuxem-deploy' >> "/root/.ssh/authorized_keys"
chmod 700 "/home/${DEPLOY_USER}/.ssh" 2>/dev/null || chmod 700 /root/.ssh
chmod 600 "/home/${DEPLOY_USER}/.ssh/authorized_keys" 2>/dev/null || chmod 600 /root/.ssh/authorized_keys
```

Test from your Mac (should get a shell without password):

```bash
ssh -i ~/.ssh/fuxem_github_deploy root@172.233.52.53 'cd /var/www/fuxem && git rev-parse --short HEAD'
```

## 2. Add GitHub Actions secrets

Repo: **Fuxaye/Fuxem** → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Name | Value |
|------|--------|
| `VPS_HOST` | `172.233.52.53` (or `fuxem.com` if DNS resolves on GitHub runners) |
| `VPS_USER` | `root` (or your deploy user) |
| `VPS_SSH_PORT` | `22` |
| `VPS_SSH_KEY` | Entire private key file (see below) |

Private key for `VPS_SSH_KEY` (copy file contents including `BEGIN` / `END` lines):

```bash
cat ~/.ssh/fuxem_github_deploy | pbcopy   # macOS: copies to clipboard
```

Or set via CLI after `gh auth login`:

```bash
gh secret set VPS_HOST --body "172.233.52.53" --repo Fuxaye/Fuxem
gh secret set VPS_USER --body "root" --repo Fuxaye/Fuxem
gh secret set VPS_SSH_PORT --body "22" --repo Fuxaye/Fuxem
gh secret set VPS_SSH_KEY < ~/.ssh/fuxem_github_deploy --repo Fuxaye/Fuxem
```

## 3. Run deploy

**Actions** → **Deploy production** → **Run workflow**

Or push to `main`. The job runs `bash deploy/update.sh` on the server.

## 4. Optional hardening

Restrict the key in `authorized_keys` (on VPS, one line):

```
command="cd /var/www/fuxem && bash deploy/update.sh",no-port-forwarding,no-X11-forwarding,no-agent-forwarding,no-pty ED25519_AAAA... github-actions-fuxem-deploy
```

Use the full public key line from `fuxem_github_deploy.pub` in place of `ED25519_AAAA...`.

With `command=`, GitHub Actions still runs its script over SSH; if deploy fails, test without `command=` first, then re-add restriction.

## Key files on your Mac

- Private (GitHub secret only): `~/.ssh/fuxem_github_deploy`
- Public (VPS `authorized_keys`): `~/.ssh/fuxem_github_deploy.pub`
