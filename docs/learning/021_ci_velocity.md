# Learning Series 021: CI Velocity & The Cost of Certainty

### 1. Building vs. Executing
In a hardened pipeline, the CI runner should spend 90% of its time executing tests and only 10% setting up the environment. By using Docker images, we 'pre-bake' the environment, ensuring that the version of Chromium in CI is identical to the one we used in development.

### 2. The 80/20 Rule of Browsers
For a business in Pipa, the vast majority of guests use Chrome/Android or Safari/iPhone.
*   **The Guard:** We maintain high confidence by testing these two specific engines.
*   **The Trade-off:** Removing Firefox reduces CI costs and time by 33% with minimal risk to guest conversion.

### 3. Caching as a First-Class Citizen
Playwright browsers are heavy. Treating them as transient files is a failure of infrastructure design. We implement caching to ensure that we only download new binaries when the Playwright version in `package.json` actually changes.
