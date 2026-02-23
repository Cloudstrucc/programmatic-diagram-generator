# Generate a 64-character hexadecimal key (256 bits)
SERVICE_KEY=$(openssl rand -hex 32)

# Display the key (save this somewhere secure!)
echo "Generated Service Account Key:"
echo "$SERVICE_KEY"

# Copy to clipboard (macOS)
echo "$SERVICE_KEY" | pbcopy

# Or copy to clipboard (Linux with xclip)
# echo "$SERVICE_KEY" | xclip -selection clipboard

# Save to a secure file for reference
echo "$SERVICE_KEY" > ~/service-account-key.txt
chmod 600 ~/service-account-key.txt
echo "Key saved to ~/service-account-key.txt"