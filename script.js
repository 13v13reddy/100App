const gridContainer = document.getElementById("grid-container");
const newOrder = document.getElementById("new-order");
const greenCountDisplay = document.getElementById("green-count");
const redCountDisplay = document.getElementById("red-count");
const redOrdersDisplay = document.getElementById("red-orders");
const resetButton = document.getElementById("reset-button");
const undoButton = document.getElementById("undo-button");
const updateButton = document.getElementById("update-button");
const lastUpdatedDisplay = document.getElementById("last-updated");

// Load state from localStorage or initialize default values
let gridData = JSON.parse(localStorage.getItem("gridData")) || Array(100).fill("blank");
let previousGridData = JSON.parse(localStorage.getItem("previousGridData")) || [];
let greenCount = JSON.parse(localStorage.getItem("greenCount")) || 0;
let redCount = JSON.parse(localStorage.getItem("redCount")) || 0;
let nextRedIndex = JSON.parse(localStorage.getItem("nextRedIndex")) || 101;
let newOrderColor = JSON.parse(localStorage.getItem("newOrderColor")) || "blank";
let lastUpdated = localStorage.getItem("lastUpdated") ? new Date(JSON.parse(localStorage.getItem("lastUpdated"))) : null; // Parse as Date object

let timer = null;
let timeRemaining = 1;

// Initialize the grid
function initializeGrid() {
  gridContainer.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = i + 1;
    cell.style.backgroundColor = getColor(gridData[i]);
    gridContainer.appendChild(cell);
  }
  newOrder.style.backgroundColor = getColor(newOrderColor);
  updateCounts();
  updateNextRedIndex(); // Update nextRedIndex on initialization
  updateLastUpdatedDisplay(); // Display the time difference
}

// Get color for a cell
function getColor(color) {
  switch (color) {
    case "blank":
      return "gray";
    case "red":
      return "red";
    case "green":
      return "green";
    default:
      return "gray";
  }
}

// Update the counts
function updateCounts() {
  greenCount = gridData.filter((color) => color === "green").length;
  redCount = gridData.filter((color) => color === "red").length;
  greenCountDisplay.textContent = `Current: ${greenCount}`;
  redCountDisplay.textContent = `Red: ${redCount}`;
  updateNextRedIndex(); // Update nextRedIndex after updating counts
  saveState(); // Save state after updating counts
}

// Update new order
function updateNewOrder() {
  saveState(); // Save current state
  newOrderColor = getNextColor(newOrderColor);
  newOrder.style.backgroundColor = getColor(newOrderColor);
  if (newOrderColor !== "blank") {
    startTimer();
  } else {
    stopTimer();
  }
  updateCounts();
  updateLastUpdated(); // Update last updated timestamp
}

// Get next color
function getNextColor(color) {
  switch (color) {
    case "blank":
      return "red";
    case "red":
      return "green";
    case "green":
      return "blank";
    default:
      return "blank";
  }
}

// Start timer
function startTimer() {
  stopTimer();
  timeRemaining = 1;
  timer = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
    } else {
      if (isValidToShift()) {
        shiftLeft();
      }
    }
  }, 1000);
}

// Stop timer
function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

// Shift left
function shiftLeft() {
  saveState(); // Save current state
  previousGridData.push([...gridData]); // Save current grid state before shifting
  gridData = gridData.slice(1);
  gridData.push(newOrderColor);
  newOrderColor = "blank";
  stopTimer();
  updateCounts();
  updateNextRedIndex(); // Update nextRedIndex after shifting
  initializeGrid();
  updateLastUpdated(); // Update last updated timestamp
}

// Check if shift is valid
function isValidToShift() {
  return newOrderColor === "red" || newOrderColor === "green";
}

// Update next red index
function updateNextRedIndex() {
  const index = gridData.indexOf("red");
  if (index !== -1) {
    nextRedIndex = index + 1;
    redOrdersDisplay.textContent = `Next Reject at: ${nextRedIndex}`;
  } else {
    nextRedIndex = 101;
    redOrdersDisplay.textContent = `Next Reject at: -`; // Display "-" if no red cells
  }
  saveState(); // Save state after updating nextRedIndex
}

// Reset grid
function resetGrid() {
  saveState(); // Save current state
  previousGridData.push([...gridData]); // Save current grid state before resetting
  gridData = Array(100).fill("blank");
  newOrderColor = "blank";
  greenCount = 0;
  redCount = 0;
  nextRedIndex = 101;
  timeRemaining = 1;
  stopTimer();
  initializeGrid();
  updateLastUpdated(); // Update last updated timestamp
}

// Update last updated timestamp
function updateLastUpdated() {
  lastUpdated = new Date(); // Store the current timestamp
  saveState(); // Save state after updating last updated timestamp
  updateLastUpdatedDisplay(); // Update the display
}

// Calculate and display the time difference
function updateLastUpdatedDisplay() {
  if (!lastUpdated) {
    lastUpdatedDisplay.textContent = "Last Updated: Never";
    return;
  }

  const now = new Date();
  const diffInMilliseconds = now - lastUpdated;
  const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
  const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

  if (diffInMinutes < 1) {
    lastUpdatedDisplay.textContent = "Last Updated: Just now";
  } else if (diffInMinutes < 60) {
    lastUpdatedDisplay.textContent = `Last Updated: ${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  } else {
    lastUpdatedDisplay.textContent = `Last Updated: ${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
  }
}

// Save current state to localStorage
function saveState() {
  localStorage.setItem("gridData", JSON.stringify(gridData));
  localStorage.setItem("previousGridData", JSON.stringify(previousGridData));
  localStorage.setItem("greenCount", JSON.stringify(greenCount));
  localStorage.setItem("redCount", JSON.stringify(redCount));
  localStorage.setItem("nextRedIndex", JSON.stringify(nextRedIndex));
  localStorage.setItem("newOrderColor", JSON.stringify(newOrderColor));
  localStorage.setItem("lastUpdated", JSON.stringify(lastUpdated)); // Save last updated timestamp
}

// Undo last action
function undoLastAction() {
  if (previousGridData.length > 0) {
    gridData = previousGridData.pop(); // Restore previous grid data
    initializeGrid(); // Update the UI
    updateCounts(); // Update counts after undo
    updateNextRedIndex(); // Update nextRedIndex after undo
    updateLastUpdated(); // Update last updated timestamp
    saveState(); // Save state after undo
  }
}

// Event listeners
resetButton.addEventListener("click", resetGrid);
undoButton.addEventListener("click", undoLastAction);
updateButton.addEventListener("click", updateNewOrder);

// Initialize the app
initializeGrid();