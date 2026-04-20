echo ""
echo "Installing @gitnexus..."
npx -y gitnexus analyze --skills --embeddings
rm CLAUDE.md
mv .claude/skills/gitnexus .agents/skills/gitnexus
mv .claude/skills/generated .agents/skills/generated
rm -rf .claude