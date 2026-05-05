const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('hearthDesktop', {
  isDesktop: true,
  setExpanded(expanded) {
    return ipcRenderer.invoke('hearth:set-expanded', Boolean(expanded));
  },
  moveBy(dx, dy) {
    return ipcRenderer.invoke('hearth:move-by', Number(dx), Number(dy));
  },
  close() {
    return ipcRenderer.invoke('hearth:close');
  },
});
