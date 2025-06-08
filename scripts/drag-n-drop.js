// Constants
const PIXELS_PER_HOUR = 60; // 60px per hour on timeline
const SCHEDULE_TRACK_ID = 'schedule-track';

// Store scheduled devices
let scheduledDevices = [];

// Initialize drag sources and drop target
function initDragAndDrop() {
  const devices = document.querySelectorAll('.device');
  const scheduleTrack = document.querySelector('.schedule-track');

  devices.forEach(device => {
    device.addEventListener('dragstart', onDragStart);
  });

  scheduleTrack.addEventListener('dragover', onDragOver);
  scheduleTrack.addEventListener('drop', onDrop);

  // Delegate dragging and resizing of scheduled blocks
  scheduleTrack.addEventListener('mousedown', onScheduledBlockMouseDown);
}

// Drag start for device
function onDragStart(e) {
  e.dataTransfer.setData('text/plain', e.target.textContent.trim());
  e.dataTransfer.setData('duration', e.target.dataset.duration);
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
  const duration = parseInt(e.dataTransfer.getData('duration'), 10);

  // Calculate start time based on drop position
  const rect = scheduleTrack.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const startHour = Math.floor(offsetX / PIXELS_PER_HOUR);
  const startMinutes = Math.floor(((offsetX % PIXELS_PER_HOUR) / PIXELS_PER_HOUR) * 60);

  // Create scheduled block
  addScheduledBlock({
    deviceName,
    startHour,
    startMinutes,
    duration,
  });
}

function addScheduledBlock({ deviceName, startHour, startMinutes, duration }) {
  const scheduleTrack = document.querySelector('.schedule-track');

  // Convert start time and duration to pixels
  const startX = startHour * PIXELS_PER_HOUR + (startMinutes / 60) * PIXELS_PER_HOUR;
  const width = (duration / 60) * PIXELS_PER_HOUR;

  // Create block element
  const block = document.createElement('div');
  block.classList.add('scheduled-block');
  block.style.left = `${startX}px`;
  block.style.width = `${width}px`;
  block.dataset.deviceName = deviceName;
  block.dataset.startHour = startHour;
  block.dataset.startMinutes = startMinutes;
  block.dataset.duration = duration;

  // Content and resize handle
  block.innerHTML = `
    <span class="block-label">${deviceName} (${duration} min)</span>
    <div class="resize-handle"></div>
  `;

  scheduleTrack.appendChild(block);

  // Store scheduled device info
  scheduledDevices.push(block);

  // Enable dragging and resizing for the new block
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

  // Determine if resize handle or block is clicked
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

  // Boundaries: prevent block moving left beyond 0 or right beyond timeline width
  newLeft = Math.max(0, newLeft);
  const scheduleTrack = document.querySelector('.schedule-track');
  const maxLeft = scheduleTrack.clientWidth - block.clientWidth;
  newLeft = Math.min(maxLeft, newLeft);

  block.style.left = `${newLeft}px`;

  // Update startHour and startMinutes data attributes
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

  // Minimum width limit
  if (newWidth < minWidth) newWidth = minWidth;

  // Maximum width limit (can't go beyond timeline right edge)
  const scheduleTrack = document.querySelector('.schedule-track');
  const blockLeft = parseFloat(block.style.left);
  const maxWidth = scheduleTrack.clientWidth - blockLeft;
  if (newWidth > maxWidth) newWidth = maxWidth;

  block.style.width = `${newWidth}px`;

  // Update duration data attribute based on new width
  const durationMinutes = Math.round((newWidth / PIXELS_PER_HOUR) * 60);
  block.dataset.duration = durationMinutes;
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
