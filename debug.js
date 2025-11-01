console.log('========== STARTING DEBUG SESSION ==========');
console.log('🔷 [DEBUG] Checking global scope for IMAGE_ASSETS...');
console.log('🔷 [DEBUG] window:', typeof window);
console.log('🔷 [DEBUG] window.IMAGE_ASSETS:', typeof window.IMAGE_ASSETS);

if (window.IMAGE_ASSETS) {
    console.log('🟢 [DEBUG] ✓ IMAGE_ASSETS is in global scope');
    console.log('🔷 [DEBUG] IMAGE_ASSETS type:', typeof window.IMAGE_ASSETS);
    console.log('🔷 [DEBUG] IMAGE_ASSETS keys:', Object.keys(window.IMAGE_ASSETS));
    console.log('🔷 [DEBUG] IMAGE_ASSETS.shipImage exists?', 'shipImage' in window.IMAGE_ASSETS);
    
    if (window.IMAGE_ASSETS.shipImage) {
        console.log('🟢 [DEBUG] ✓ shipImage is available');
        console.log('🔷 [DEBUG] shipImage type:', typeof window.IMAGE_ASSETS.shipImage);
        console.log('🔷 [DEBUG] shipImage length:', window.IMAGE_ASSETS.shipImage.length, 'characters');
        console.log('🔷 [DEBUG] shipImage starts with:', window.IMAGE_ASSETS.shipImage.substring(0, 50));
        console.log('🔷 [DEBUG] Is valid base64 URI?', window.IMAGE_ASSETS.shipImage.startsWith('data:image'));
    } else {
        console.error('❌ [DEBUG] shipImage is NOT available!');
    }
} else {
    console.error('❌ [DEBUG] ✗ IMAGE_ASSETS is NOT in global scope!');
    console.error('❌ [DEBUG] This will cause SailingScene to fail!');
}

console.log('========== DEBUG SESSION COMPLETE ==========');

// Additional check: Listen for when Phaser initializes
window.addEventListener('load', function() {
    console.log('📍 [DEBUG] Page load event fired');
    setTimeout(function() {
        console.log('📍 [DEBUG] Post-load check - window.IMAGE_ASSETS:', typeof window.IMAGE_ASSETS);
    }, 500);
});
