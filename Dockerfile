FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy files to the container
COPY . .    

# Install dependencies
RUN npm ci

# Expose the port the Vite dev server will run on
EXPOSE 5173

# Run the Vite dev server
CMD ["npm", "run", "dev"]
