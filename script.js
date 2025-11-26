/* ========== QR GENERATOR ========== */

const qrTextInput = document.getElementById("qr-text");
const generateBtn = document.getElementById("generate-btn");
const downloadBtn = document.getElementById("download-btn");
const qrCodeContainer = document.getElementById("qrcode");

let qrCodeInstance = null;

function generateQRCode() {
  const text = qrTextInput.value.trim();
  if (!text) {
    alert("Please enter some text or a URL to generate a QR code.");
    return;
  }

  // Pehli baar: placeholder hatao aur QR create karo
  if (!qrCodeInstance) {
    qrCodeContainer.innerHTML = "";
    qrCodeInstance = new QRCode(qrCodeContainer, {
      text,
      width: 240,
      height: 240,
      colorDark: "#111827",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });
  } else {
    // Baad mein same instance update karo
    qrCodeInstance.clear();
    qrCodeInstance.makeCode(text);
  }

  downloadBtn.disabled = false;
}

function downloadQRCode() {
  if (!qrCodeInstance) return;

  const img = qrCodeContainer.querySelector("img");
  const canvas = qrCodeContainer.querySelector("canvas");
  let dataUrl = null;

  if (img && img.src) {
    dataUrl = img.src;
  } else if (canvas) {
    dataUrl = canvas.toDataURL("image/png");
  }

  if (!dataUrl) return;

  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "qr-code.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

generateBtn.addEventListener("click", generateQRCode);
downloadBtn.addEventListener("click", downloadQRCode);

// Enter / Ctrl+Enter shortcut
qrTextInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey || !e.shiftKey)) {
    e.preventDefault();
    generateQRCode();
  }
});

/* ========== QR READER (IMAGE ONLY) ========== */

const canvasEl = document.getElementById("canvas");
const ctx = canvasEl.getContext("2d");
const output = document.getElementById("output");
const fileInput = document.getElementById("fileInput");
const copyBtn = document.getElementById("copyBtn");
const preview = document.getElementById("preview");
const placeholder = document.querySelector(".preview-box .placeholder");

function showResult(text) {
  output.textContent = text || "No data";
}

// Image file upload decode
fileInput.addEventListener("change", (e) => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    alert("Please select an image file.");
    e.target.value = ""; // same file dobara choose kar sake
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = () => {
      // Preview image
      preview.src = reader.result;
      preview.style.display = "block";
      placeholder.style.display = "none";

      // Canvas par draw karke jsQR se read
      canvasEl.width = img.naturalWidth;
      canvasEl.height = img.naturalHeight;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "attemptBoth",
      });

      if (code) {
        showResult(code.data);
      } else {
        showResult("No QR code found in the image.");
      }
    };
    img.onerror = () => {
      alert("Could not load the image file.");
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

copyBtn.addEventListener("click", async () => {
  const text = output.textContent;
  if (!text || text === "No result yet") {
    alert("Nothing to copy");
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  } catch (e) {
    alert("Copy failed: " + e.message);
  }
});
