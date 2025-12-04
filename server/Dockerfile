# Use the official Node.js 20 LTS image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to install dependencies
# This is done separately to leverage Docker's caching layer
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Expose the port the app runs on (matching the PORT environment variable)
EXPOSE 3000

# Define the command to run the application
CMD [ "npm", "start" ]