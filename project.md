# Project Overview
I am building a web application called "Disability Report Platform" (無障礙設施檢舉平台). The goal of this platform is to allow users to crowdsource and report poorly designed or inaccessible public facilities (e.g., blocked wheelchair ramps). Users can upload photos, attach geolocation data, and describe the issues. The data will be visualized on a web GIS interface.

# Tech Stack
* **Framework:** Vue 3 (Composition API with `<script setup>`)
* **Build Tool:** Vite
* **Language:** TypeScript
* **UI Library:** Vuetify 3 (Material Design, mobile-first, a11y focused)
* **Routing:** Vue Router 4
* **State Management:** Pinia
* **Icons:** Material Design Icons (MDI)

# Global Layout Architecture
The application uses a standard Vuetify layout structure designed for mobile and desktop responsiveness.
* **Top Bar:** `v-app-bar` containing the platform title.
* **Side Navigation:** `v-navigation-drawer` (collapsible) containing navigation links.
* **Main Content Area:** `v-main` wrapping a `<router-view>` to dynamically render pages.

# Core Pages (Routes)
1.  **Map View (`/map`) - Web GIS Dashboard:**
    * The main content area is entirely filled with a Google Maps interface.
    * It renders map markers based on reported locations.
    * Clicking a marker opens a popup displaying the uploaded photo and the issue description.
2.  **Report View (`/report`) - Issue Submission Form:**
    * A single-column, mobile-friendly form.
    * **Image Upload:** Component to capture from the camera or select from the gallery.
    * **Geolocation:** A button utilizing the HTML5 Geolocation API to automatically fetch and populate latitude and longitude coordinates.
    * **Location Description:** A single-line text input (e.g., "Taipei Main Station Exit M4").
    * **Issue Description:** A multi-line text area to detail the specific accessibility barrier.

# File Directory Structure
Please follow this exact directory structure for generating components and views:

```text
src/
├── assets/                 
├── components/             
│   ├── layout/
│   │   ├── Sidebar.vue     
│   │   └── Topbar.vue      
│   └── report/
│       └── ImageUpload.vue 
├── views/                  
│   ├── MapView.vue         
│   └── ReportView.vue      
├── router/
│   └── index.ts            
├── stores/
│   └── reportStore.ts      
├── App.vue                 
└── main.ts