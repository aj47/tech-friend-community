# asciicinema Recording Guide for Agent Battler

This guide explains how to record and submit terminal session recordings when working on issues with AI coding agents.

## What is asciicinema?

**asciicinema** is a lightweight terminal session recorder that captures your terminal output in a text-based format (not video). It's perfect for:

- 📹 Showing how your AI agent worked on the issue
- 🎓 Helping others learn from your approach
- ✅ Building trust with issue creators
- 🔍 Providing transparency in the development process

## Why Record Your Sessions?

When you submit a PR with an asciicinema recording, you:

1. **Stand out** - PRs with recordings are more engaging and trustworthy
2. **Help others learn** - Show how you used your AI coding agent effectively
3. **Build credibility** - Demonstrate your actual work process
4. **Enable comparison** - Help the community see how different agents approach problems

## Quick Start

### 1. Install asciinema

**macOS (Homebrew):**
```bash
brew install asciinema
```

**Ubuntu/Debian:**
```bash
sudo apt-get install asciinema
```

**Fedora:**
```bash
sudo dnf install asciinema
```

**From source (any platform):**
```bash
cargo install --locked --git https://github.com/asciinema/asciinema
```

### 2. Record Your Session

Start recording before you begin working on the issue:

```bash
asciinema rec my-session.cast
```

This will:
- Start recording your terminal
- Capture all commands and output
- Save to `my-session.cast` when you're done

**To stop recording:** Type `exit` or press `Ctrl+D`

### 3. Review Your Recording

Play it back locally to make sure it looks good:

```bash
asciinema play my-session.cast
```

### 4. Upload to asciinema.org

Upload your recording to get a shareable URL:

```bash
asciinema upload my-session.cast
```

You'll get a URL like: `https://asciinema.org/a/abc123`

### 5. Submit with Your PR

When submitting your PR on Agent Battler:
1. Paste your GitHub PR URL
2. Select your AI coding agent
3. **Paste the asciinema URL** in the "Terminal Session Recording" field
4. Submit!

## Best Practices

### What to Record

✅ **DO record:**
- Your agent generating code
- Running tests
- Debugging issues
- The complete workflow from start to finish

❌ **DON'T record:**
- Sensitive information (API keys, passwords, etc.)
- Personal data
- Unrelated work

### Recording Tips

1. **Clean your terminal** before starting:
   ```bash
   clear
   ```

2. **Add markers** for important moments:
   ```bash
   # Press Ctrl+\ to add a marker during recording
   ```

3. **Keep it focused** - Record just the relevant work, not hours of idle time

4. **Use idle time limiting** to skip long pauses:
   ```bash
   asciinema rec -i 2 my-session.cast  # Max 2 seconds idle time
   ```

5. **Add a title** to your recording:
   ```bash
   asciinema rec -t "Fixing bug #123 with Augment" my-session.cast
   ```

## Advanced Usage

### Recording with Metadata

Include useful metadata in your recording:

```bash
asciinema rec \
  --title "Implementing feature X with Cursor" \
  --idle-time-limit 2 \
  --command "/bin/bash" \
  my-session.cast
```

### Self-Hosting (Optional)

If you prefer not to use asciinema.org, you can:

1. **Host the .cast file yourself** (GitHub Gist, your own server, etc.)
2. **Use the raw file URL** in the submission form

Example with GitHub Gist:
1. Create a new Gist
2. Upload your `.cast` file
3. Click "Raw" to get the direct file URL
4. Use that URL in Agent Battler

### Live Streaming (Advanced)

For real-time collaboration, you can stream your session:

```bash
# Stream locally (viewers on same network)
asciinema stream -l

# Stream via asciinema.org relay
asciinema stream -r
```

## Example Workflow

Here's a complete example of recording a session while working on an issue:

```bash
# 1. Navigate to your project
cd ~/projects/my-repo

# 2. Start recording with a descriptive title
asciinema rec -t "Fixing issue #42 with GitHub Copilot" -i 2 issue-42.cast

# 3. Work on the issue (this is all recorded)
git checkout -b fix-issue-42
# ... use your AI coding agent ...
# ... write code, run tests, etc. ...
git add .
git commit -m "Fix issue #42"
git push origin fix-issue-42

# 4. Stop recording
exit

# 5. Review the recording
asciinema play issue-42.cast

# 6. Upload to asciinema.org
asciinema upload issue-42.cast
# Output: https://asciinema.org/a/xyz789

# 7. Create PR on GitHub
# 8. Submit PR on Agent Battler with the asciinema URL
```

## Troubleshooting

### Recording is too large
- Use idle time limiting: `asciinema rec -i 2 session.cast`
- Compress the file: `gzip session.cast` (asciinema.org accepts .gz files)

### Terminal colors look wrong
- asciinema automatically captures your terminal theme
- If colors are off, check your `$TERM` environment variable

### Can't install asciinema
- Use the Docker image: `docker run --rm -it -v $PWD:/data asciinema/asciinema rec /data/session.cast`
- Or build from source (requires Rust)

### Upload failed
- Check your internet connection
- Try uploading manually at https://asciinema.org/
- Or host the file yourself and use the raw URL

## Privacy & Security

⚠️ **Important:** asciicinema recordings capture everything in your terminal, including:
- Commands you type
- Output from programs
- Environment variables that are printed
- File contents that are displayed

**Before uploading:**
1. Review your recording with `asciinema play`
2. Make sure no sensitive data is visible
3. Consider editing the `.cast` file if needed (it's just JSON)

## File Format

asciicinema recordings are stored in a simple text-based format (`.cast` files):

```json
{"version": 3, "term": {"cols": 80, "rows": 24}, "timestamp": 1234567890}
[0.5, "o", "$ echo 'Hello World'\r\n"]
[0.1, "o", "Hello World\r\n"]
```

This makes them:
- **Lightweight** - Much smaller than video files
- **Compressible** - Can be gzipped to ~15% of original size
- **Searchable** - Text-based, so you can grep through them
- **Editable** - Can be manually edited if needed

## Resources

- **Official Documentation:** https://docs.asciinema.org/
- **asciinema.org:** https://asciinema.org/
- **GitHub Repository:** https://github.com/asciinema/asciinema
- **Community Forum:** https://discourse.asciinema.org/

## FAQ

**Q: Is asciicinema free?**  
A: Yes! Both the CLI tool and asciinema.org hosting are free and open source.

**Q: Can I edit my recording after uploading?**  
A: You can delete and re-upload. The `.cast` file is editable (it's JSON).

**Q: Do I have to use asciinema.org?**  
A: No, you can host the `.cast` file anywhere and paste the URL.

**Q: Can I record multiple sessions for one PR?**  
A: Currently, Agent Battler supports one recording per PR. Choose your best session!

**Q: What if my recording is very long?**  
A: Use idle time limiting (`-i` flag) to skip long pauses. Aim for 5-15 minutes of active work.

**Q: Can I add narration or annotations?**  
A: You can add markers during recording (Ctrl+\). For more advanced editing, check out the asciinema player's marker feature.

## Support

If you have questions about recording or submitting sessions:
- Check the [asciinema documentation](https://docs.asciinema.org/)
- Ask in the [asciinema forum](https://discourse.asciinema.org/)
- Open an issue on Agent Battler's GitHub repository

---

Happy recording! 🎬 Show the world how you and your AI coding agent tackle challenges together!

