# Use the lightweight and secure alpine Nginx image
FROM nginx:alpine

# Copy all project files to the default Nginx html serving directory
COPY . /usr/share/nginx/html/

# Expose port 8080 since Google Cloud Run listens on port 8080 by default
EXPOSE 8080

# Cloud Run requires the web server to listen to the PORT environment variable.
# This simple command replaces Nginx's default port 80 with 8080 before starting.
CMD sed -i -e 's/listen       80;/listen       8080;/g' /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
