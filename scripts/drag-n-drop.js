function allowDrop(ev) {
    ev.preventDefault();
  }
  
  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.outerHTML);
  }
  
  function drop(ev) {
    ev.preventDefault();
    let data = ev.dataTransfer.getData("text");
    ev.target.innerHTML += data;
    attachDragListeners(); // Re-attach after drop
  }
  
  function attachDragListeners() {
    document.querySelectorAll('.device').forEach(el => {
      el.setAttribute('draggable', 'true');
      el.addEventListener('dragstart', drag);
    });
  }
  
  window.onload = () => {
    attachDragListeners();
  };
  