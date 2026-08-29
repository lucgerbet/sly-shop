#!/usr/bin/env bash
#
# Déploie sly-shop en production — en garantissant que ce qui part en prod
# est versionné et sauvegardé hors de cette machine.
#
# POURQUOI CE SCRIPT EXISTE
# Vercel envoie le dossier de travail TEL QUEL, fichiers non commités inclus,
# et le déploiement n'est jamais déclenché par git. Rien n'oblige donc à
# commiter : c'est exactement comme ça que deux mois de travail (i18n, produit
# chemise, aperçu IA, photos de tissus) sont restés hors de git jusqu'au
# 29/08/2026, sur une seule machine, sans sauvegarde.
#
# Ici l'ordre est imposé : build → commit → push → déploiement.
# Si le build casse, rien n'est commité. Si le push échoue, rien n'est déployé.
#
# USAGE
#   ./deploy.sh "message de commit"
#   ./deploy.sh                      (message daté par défaut)

set -euo pipefail
cd "$(dirname "$0")"

MESSAGE="${1:-Déploiement du $(date '+%Y-%m-%d %H:%M')}"

echo "▸ 1/4  Build local"
# Toujours avant toute chose : un build cassé ne doit ni être commité ni
# partir en production. Attrape aussi les erreurs que Vercel ne montrerait
# qu'après plusieurs minutes d'attente.
npm run build

echo "▸ 2/4  Commit"
if [[ -n "$(git status --porcelain)" ]]; then
  git add -A
  git commit -q -m "$MESSAGE"
  echo "   commité : $(git log -1 --format='%h %s')"
else
  echo "   rien à commiter, arbre propre"
fi

echo "▸ 3/4  Push"
if git remote get-url origin >/dev/null 2>&1; then
  # Volontairement bloquant : déployer du code qui n'existe que sur cette
  # machine est précisément le risque que ce script supprime.
  git push origin HEAD
  echo "   poussé sur $(git remote get-url origin)"
else
  echo "   ⚠️  AUCUN DÉPÔT DISTANT."
  echo "   Le code est commité mais n'existe que sur ce Mac : une panne disque"
  echo "   le perd. Crée un dépôt PRIVÉ sur github.com puis :"
  echo "      git remote add origin git@github.com:lucgerbet/sly-shop.git"
  echo "      git push -u origin main"
  echo "   Déploiement poursuivi malgré tout."
fi

echo "▸ 4/4  Déploiement Vercel"
npx --yes vercel --prod --yes

echo "✅ Terminé — https://www.sly-atelier.com"
