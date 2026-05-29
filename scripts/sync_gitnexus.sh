echo ""
rm -rf .gitnexus
echo "Installing @gitnexus..."
npx -y gitnexus analyze
# rm CLAUDE.md
# rm -rf .agents/skills/gitnexus
# mv .claude/skills/gitnexus .agents/skills/gitnexus
# rm -rf .claude
# sed -i '' 's/claude/agents/g' AGENTS.md
perl -0pi -e 's/\n<!-- gitnexus:start -->.*?<!-- gitnexus:end -->\n?/\n/s' AGENTS.md
perl -0pi -e 's/\n<!-- gitnexus:start -->.*?<!-- gitnexus:end -->\n?/\n/s' CLAUDE.md