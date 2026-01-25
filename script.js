// =========================================================================
//         TEST: NO KEYS (JUST VISUAL)
// =========================================================================

window.addEventListener('load', () => {
    alert("SCRIPT IS LOADING..."); // POPUP TEST
    
    const ui = document.createElement('div');
    ui.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:red; z-index:99999; font-size:50px; color:white;';
    ui.innerText = "IF YOU SEE THIS, SCRIPT.JS IS WORKING!";
    
    document.body.appendChild(ui);
});
