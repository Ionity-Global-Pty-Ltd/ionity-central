# ==============================================================================
# IONITY CENTRAL - DOCKERFILE FOR GOOGLE CLOUD RUN / GKE / VM
# ==============================================================================
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static web app assets
COPY . /usr/share/nginx/html

# Expose standard web port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
