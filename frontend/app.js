// DOM Elements
const dropZone = document.getElementById("dropZone");
const imageInput = document.getElementById("imageInput");
const uploadSection = document.getElementById("uploadSection");
const previewSection = document.getElementById("previewSection");
const originalImage = document.getElementById("originalImage");
const resultImage = document.getElementById("resultImage");
const removeBtn = document.getElementById("removeBtn");
const downloadLink = document.getElementById("downloadLink");
const resetBtn = document.getElementById("resetBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const errorMessage = document.getElementById("errorMessage");

let selectedFile = null;

// Drag and Drop Events
dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-over");
  
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith("image/")) {
    handleFile(files[0]);
  }
});

// Click to upload
dropZone.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    handleFile(e.target.files[0]);
  }
});

// Handle selected file
function handleFile(file) {
  selectedFile = file;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    originalImage.src = e.target.result;
    resultImage.src = "";
    
    // Switch to preview section
    uploadSection.style.display = "none";
    previewSection.classList.add("active");
    downloadLink.classList.remove("active");
    hideError();
  };
  reader.readAsDataURL(file);
}

// Remove Background
removeBtn.addEventListener("click", async () => {
  if (!selectedFile) {
    showError("Please select an image first");
    return;
  }

  // Show loading
  loadingOverlay.classList.add("active");
  removeBtn.disabled = true;
  hideError();

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    const response = await fetch("http://localhost:8000/remove-bg", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to remove background. Please try again.");
    }

    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);

    resultImage.src = imageUrl;
    downloadLink.href = imageUrl;
    downloadLink.classList.add("active");
  } catch (error) {
    showError(error.message || "Something went wrong. Please try again.");
  } finally {
    loadingOverlay.classList.remove("active");
    removeBtn.disabled = false;
  }
});

// Reset
resetBtn.addEventListener("click", () => {
  selectedFile = null;
  imageInput.value = "";
  originalImage.src = "";
  resultImage.src = "";
  downloadLink.classList.remove("active");
  previewSection.classList.remove("active");
  uploadSection.style.display = "block";
  hideError();
});

// Error handling
function showError(message) {
  errorMessage.querySelector(".error-text").textContent = message;
  errorMessage.classList.add("active");
}

function hideError() {
  errorMessage.classList.remove("active");
}