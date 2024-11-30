FROM node:23-slim

RUN apt-get update && apt-get install -y python3 python3-pip build-essential

# Install pnpm globally
#RUN npm install -g pnpm

# Set the working directory in the container
WORKDIR app/

# Copy package.json and pnpm-lock.yaml to the working directory
#COPY package.json pnpm-lock.yaml ./

# Install dependencies using pnpm
#CMD ["pnpm, "install"]

# Copy the rest of the application code
#COPY . .

# Expose the port the app runs on (optional)
EXPOSE 80

#CMD ["pnpm", "build"]
# Command to run the application
#CMD ["pnpm", "start"]
CMD ["npm", "run", "start"]