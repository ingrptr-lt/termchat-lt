// MULTIVERSE OS: SAFE MODE TEST
// This version has no complex logic, just the UI.

console.log("Multiverse OS Safe Mode Loading...");

window.addEventListener('load', () => {
    injectUI();
});

function injectUI() {
    // Remove old UI if exists
    const old = document.getElementById('multi-core');
    if(old) old.remove();

    const ui = document.createElement('div');
    ui.id = 'multi-core';
    ui.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:200px; background:black; border-top:2px solid #00ff41; color:#00ff41; font-family:monospace; z-index:9999; padding:10px; box-sizing:border-box;';
    ui.innerHTML = '<h2>MULTIVERSE CORE: SAFE MODE</h2><p>System is alive.</p><input type="text" placeholder="Type here..." style="width:100%; background:black; color:#fff; border:none; border-bottom:1px solid #00ff41; padding:5px; outline:none;">';
    document.body.appendChild(ui);
}
