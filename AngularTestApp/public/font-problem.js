const originalCreateElement = document.createElement;//copia l'originale

document.createElement = function (tagName) {//sovrascrive la funzione
  if (tagName === 'link') {
    const linkElement = originalCreateElement.call(document, tagName);//lo carica normalmente
    linkElement.addEventListener('load', function () {//attivato al caricamento
      if (linkElement.href.includes('fonts.googleapis.com/css?family=Roboto')) {//se lo include
        linkElement.parentNode?.removeChild(linkElement);//lo rimuove
      }
    });
    return linkElement;
  }
  return originalCreateElement.call(document, tagName);
};
