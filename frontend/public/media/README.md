# Media Library

This directory contains all constant/static media assets used throughout the application.

## Structure

```
media/
├── admin/           # Admin panel assets
│   └── login-bg.jpg # Admin login page background image
├── frontend/        # Frontend assets (create as needed)
├── products/        # Product images (create as needed)
└── branding/        # Logos, icons, etc. (create as needed)
```

## Usage

All images in this directory are accessible via `/media/` path in the application.

Example:
- Admin login background: `/media/admin/login-bg.jpg`

## Guidelines

1. Keep all constant/static images in this directory structure
2. Organize by feature/section (admin, frontend, products, etc.)
3. Use descriptive filenames
4. Optimize images before adding them to reduce bundle size