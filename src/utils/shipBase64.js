// Ship image as base64 data URL
// This file dynamically loads the base64 encoded ship image

let SHIP_DATA_URL = null;

// Load the base64 data
fetch('assets/images/ship.b64')
    .then(response => response.text())
    .then(base64Data => {
        SHIP_DATA_URL = 'data:image/png;base64,' + base64Data.trim();
        console.log('✅ Ship image loaded as data URL');
    })
    .catch(err => {
        console.warn('Could not load ship image base64:', err);
    });

// Export for use in scenes
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SHIP_DATA_URL };
}
