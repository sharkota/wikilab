#!/bin/bash
echo "Beware, this will replace your .env with the defaults."
# Do you want to continue?
read -p "Do you want to continue? (y/n): " choice
if [[ "$choice" != "y" && "$choice" != "Y" ]]; then
  echo "Aborting setup."
  exit 1
fi
echo "Setting up the environment..."
npm i
cp default.env .env
echo "Environment setup complete."
echo "You can now run the application with 'npm start'."