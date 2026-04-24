echo ""
rm -rf .gitnexus
echo "Installing @gitnexus..."
npx -y gitnexus analyze
rm CLAUDE.md
rm -rf .agents/skills/gitnexus
mv .claude/skills/gitnexus .agents/skills/gitnexus
rm -rf .claude
sed -i '' 's/claude/agents/g' AGENTS.md