echo ""
echo "Installing @gitnexus..."
npx -y gitnexus analyze
rm CLAUDE.md
mv .claude/skills/gitnexus .agents/skills/gitnexus
rm -rf .claude