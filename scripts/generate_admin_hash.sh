#!/bin/bash
# Script to generate Argon2 hash for admin password
# Usage: ./scripts/generate_admin_hash.sh

PASSWORD="Admin123!"

echo "Generating Argon2 hash for password: $PASSWORD"
echo ""
echo "To generate the hash, you can:"
echo "1. Use the application's password service"
echo "2. Or run this Rust code in the application:"
echo ""
echo "use infrastructure::security::PasswordService;"
echo "let service = PasswordService::new();"
echo "let hash = service.hash_password(\"$PASSWORD\").unwrap();"
echo "println!(\"{}\", hash);"
echo ""
echo "Then update the migration file with the generated hash."

