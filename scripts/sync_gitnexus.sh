echo ""
rm -rf .gitnexus
echo "Installing @gitnexus..."
npx -y gitnexus analyze
perl -0pi -e 's/\n<!-- gitnexus:start -->.*?<!-- gitnexus:end -->\n?/\n/s' AGENTS.md
perl -0pi -e 's/\n<!-- gitnexus:start -->.*?<!-- gitnexus:end -->\n?/\n/s' CLAUDE.md