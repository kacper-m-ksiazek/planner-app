// Constants
const PIXELS_PER_HOUR = 60; // 60px per hour on timeline
const SCHEDULE_TRACK_ID = 'schedule-track';
const ROW_HEIGHT = 50; // height per row for blocks, including margin
const MAX_ROWS = 5;    // max number of rows allowed

// Helper: check if two blocks overlap horizontally
function isOverlapping(start1, width1, start2, width2) {
  return start1 < (start2 + width2) && (start1 + width1) > start2;
}

// Store scheduled devices
let scheduledDevices = [];

// Initialize drag sources and drop target
function initDragAndDrop() {
    const deviceList = document.getElementById('deviceList');
    const scheduleTrack = document.querySelector('.schedule-track');
  
    // Use event delegation for dragstart on devices inside deviceList
    deviceList.addEventListener('dragstart', (e) => {
      const deviceElement = e.target.closest('.device');
      if (deviceElement) {
        onDragStart(e);
      }
    });
  
    scheduleTrack.addEventListener('dragover', onDragOver);
    scheduleTrack.addEventListener('drop', onDrop);
    scheduleTrack.addEventListener('mousedown', onScheduledBlockMouseDown);
  }
  

// Drag start for device
function onDragStart(e) {
  const deviceElement = e.target.closest('.device');
  if (!deviceElement) return;

  const deviceName = deviceElement.dataset.name;
const duration = deviceElement.dataset.duration;

console.debug('[DragStart] deviceName:', deviceName, 'duration:', duration);

if (!deviceName) {
  console.warn('[DragStart] deviceName missing! Check your HTML data attributes');
}
if (!duration) {
  console.warn('[DragStart] duration missing! Check your HTML data attributes');
}

e.dataTransfer.setData('deviceName', deviceName);
e.dataTransfer.setData('duration', duration);


  console.debug('[DragStart] deviceName:', deviceName, 'duration:', duration);

  e.dataTransfer.setData('text/plain', deviceName);
  e.dataTransfer.setData('duration', duration);
  e.dataTransfer.effectAllowed = 'copy';
}

// Allow drop on schedule track
function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
}

// Drop device on schedule track
function onDrop(e) {
  e.preventDefault();

  const scheduleTrack = e.currentTarget;
  const deviceName = e.dataTransfer.getData('text/plain');
  const durationRaw = e.dataTransfer.getData('duration');
  const duration = parseInt(durationRaw, 10);

  console.debug('[Drop] deviceName:', deviceName, 'raw duration:', durationRaw, 'parsed duration:', duration);

  if (isNaN(duration)) {
    console.warn('[Drop] Warning: duration is NaN, setting duration to 0');
  }

  // Calculate start time based on drop position
  const rect = scheduleTrack.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const startHour = Math.floor(offsetX / PIXELS_PER_HOUR);
  const startMinutes = Math.floor(((offsetX % PIXELS_PER_HOUR) / PIXELS_PER_HOUR) * 60);

  addScheduledBlock({
    deviceName,
    startHour,
    startMinutes,
    duration: isNaN(duration) ? 0 : duration,
  });
}

function addScheduledBlock({ deviceName, startHour, startMinutes, duration }) {
  const scheduleTrack = document.querySelector('.schedule-track');

  // Convert start time and duration to pixels
  const startX = startHour * PIXELS_PER_HOUR + (startMinutes / 60) * PIXELS_PER_HOUR;
  const width = (duration / 60) * PIXELS_PER_HOUR;

  console.debug('[AddScheduledBlock] deviceName:', deviceName, 'startX:', startX, 'width(px):', width, 'duration(min):', duration);

  // Find free row
  let row = 0;
  for (; row < MAX_ROWS; row++) {
    const rowBlocks = scheduledDevices.filter(b => parseInt(b.dataset.row) === row);
    const overlap = rowBlocks.some(b => {
      const bLeft = parseFloat(b.style.left);
      const bWidth = parseFloat(b.style.width);
      return isOverlapping(startX, width, bLeft, bWidth);
    });
    if (!overlap) break;
  }

  if (row === MAX_ROWS) {
    alert('Brak dostępnego miejsca na harmonogramie!');
    return;
  }

  // Create block element
  const block = document.createElement('div');
  block.classList.add('scheduled-block');
  block.style.left = `${startX}px`;
  block.style.width = `${width}px`;
  block.style.top = `${row * ROW_HEIGHT + 10}px`;
  block.dataset.deviceName = deviceName;
  block.dataset.startHour = startHour;
  block.dataset.startMinutes = startMinutes;
  block.dataset.duration = duration;
  block.dataset.row = row;

  block.innerHTML = `
    <span class="block-label">${deviceName} (${duration} min)</span>
    <div class="resize-handle"></div>
  `;

  scheduleTrack.appendChild(block);
  scheduledDevices.push(block);

  console.debug('[AddScheduledBlock] Block added at row:', row);

  setupBlockDragAndResize(block);
}

function setupBlockDragAndResize(block) {
  let isDragging = false;
  let isResizing = false;
  let dragStartX = 0;
  let blockStartLeft = 0;
  let blockStartWidth = 0;

  // Mousedown for drag or resize detection handled globally on schedule track
  // We'll handle it with event delegation in onScheduledBlockMouseDown()
}

// Handle mouse down for dragging/resizing scheduled blocks (event delegation)
function onScheduledBlockMouseDown(e) {
  const block = e.target.closest('.scheduled-block');
  if (!block) return;

  const scheduleTrack = document.querySelector('.schedule-track');

  if (e.target.classList.contains('resize-handle')) {
    startResize(e, block, scheduleTrack);
  } else {
    startDrag(e, block, scheduleTrack);
  }
}

// Drag variables
let dragInfo = null;

function startDrag(e, block, scheduleTrack) {
  e.preventDefault();
  dragInfo = {
    type: 'drag',
    block,
    startX: e.clientX,
    startLeft: parseFloat(block.style.left),
  };

  window.addEventListener('mousemove', onDragMove);
  window.addEventListener('mouseup', onDragEnd);
}

function onDragMove(e) {
  if (!dragInfo || dragInfo.type !== 'drag') return;
  const { block, startX, startLeft } = dragInfo;
  const deltaX = e.clientX - startX;
  let newLeft = startLeft + deltaX;

  const scheduleTrack = document.querySelector('.schedule-track');

  newLeft = Math.max(0, newLeft);
  const maxLeft = scheduleTrack.clientWidth - block.clientWidth;
  newLeft = Math.min(maxLeft, newLeft);

  let newRow = 0;
  for (; newRow < MAX_ROWS; newRow++) {
    const rowBlocks = scheduledDevices.filter(b => parseInt(b.dataset.row) === newRow && b !== block);
    const overlap = rowBlocks.some(b => {
      const bLeft = parseFloat(b.style.left);
      const bWidth = parseFloat(b.style.width);
      return isOverlapping(newLeft, block.clientWidth, bLeft, bWidth);
    });
    if (!overlap) break;
  }
  if (newRow === MAX_ROWS) newRow = parseInt(block.dataset.row);

  block.style.left = `${newLeft}px`;
  block.style.top = `${newRow * ROW_HEIGHT + 10}px`;
  block.dataset.row = newRow;

  const totalMinutes = (newLeft / PIXELS_PER_HOUR) * 60;
  const startHour = Math.floor(totalMinutes / 60);
  const startMinutes = Math.floor(totalMinutes % 60);
  block.dataset.startHour = startHour;
  block.dataset.startMinutes = startMinutes;

  updateBlockLabel(block);
}

function onDragEnd(e) {
  if (!dragInfo) return;
  dragInfo = null;
  window.removeEventListener('mousemove', onDragMove);
  window.removeEventListener('mouseup', onDragEnd);
}

function startResize(e, block, scheduleTrack) {
  e.preventDefault();
  dragInfo = {
    type: 'resize',
    block,
    startX: e.clientX,
    startWidth: block.clientWidth,
    minWidth: PIXELS_PER_HOUR * 0.25, // minimum 15 mins width
  };

  window.addEventListener('mousemove', onResizeMove);
  window.addEventListener('mouseup', onResizeEnd);
}

function onResizeMove(e) {
  if (!dragInfo || dragInfo.type !== 'resize') return;
  const { block, startX, startWidth, minWidth } = dragInfo;
  const deltaX = e.clientX - startX;
  let newWidth = startWidth + deltaX;

  if (newWidth < minWidth) newWidth = minWidth;

  const scheduleTrack = document.querySelector('.schedule-track');
  const blockLeft = parseFloat(block.style.left);
  const maxWidth = scheduleTrack.clientWidth - blockLeft;
  if (newWidth > maxWidth) newWidth = maxWidth;

  block.style.width = `${newWidth}px`;

  const durationMinutes = Math.round((newWidth / PIXELS_PER_HOUR) * 60);
  block.dataset.duration = durationMinutes;

  console.debug('[Resize] newWidth(px):', newWidth, 'new duration(min):', durationMinutes, 'device:', block.dataset.deviceName);

  updateBlockLabel(block);
}

function onResizeEnd(e) {
  if (!dragInfo) return;
  dragInfo = null;
  window.removeEventListener('mousemove', onResizeMove);
  window.removeEventListener('mouseup', onResizeEnd);
}

function updateBlockLabel(block) {
  const duration = block.dataset.duration;
  const deviceName = block.dataset.deviceName;
  const labelSpan = block.querySelector('.block-label');
  if (labelSpan) {
    labelSpan.textContent = `${deviceName} (${duration} min)`;
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  initDragAndDrop();
});
