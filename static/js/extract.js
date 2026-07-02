// Extract page: char count, example chips, clear, mic recording -> transcribe,
// and a submit-time phase indicator (the form itself posts to the server).
(function () {
  var textarea = document.getElementById("transcript");
  var charCount = document.getElementById("char-count");
  var form = document.getElementById("extract-form");
  var extractBtn = document.getElementById("extract-btn");
  var extractLabel = document.getElementById("extract-btn-label");
  var clearBtn = document.getElementById("clear-btn");
  var phases = document.getElementById("phases");

  function updateCount() {
    if (charCount) charCount.textContent = textarea.value.length.toLocaleString();
  }
  updateCount();
  textarea.addEventListener("input", updateCount);

  // Example chips -> load sample transcript into the textarea.
  var samples = {};
  var dataEl = document.getElementById("samples-data");
  if (dataEl) {
    try {
      JSON.parse(dataEl.textContent).forEach(function (s) { samples[s.id] = s.transcript; });
    } catch (e) { /* ignore */ }
  }
  document.querySelectorAll(".sample-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      var t = samples[chip.dataset.scenario];
      if (t) { textarea.value = t; updateCount(); textarea.focus(); }
    });
  });

  clearBtn.addEventListener("click", function () {
    textarea.value = "";
    updateCount();
    textarea.focus();
  });

  // Cmd/Ctrl+Enter submits.
  textarea.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") form.requestSubmit();
  });

  // Show phase indicator on submit; the browser navigates when the server responds.
  var PHASES = ["Analyzing transcript", "Extracting action items", "Matching assignees"];
  form.addEventListener("submit", function () {
    if (!textarea.value.trim()) return;
    extractBtn.disabled = true;
    clearBtn.disabled = true;
    phases.style.display = "grid";
    var rows = phases.querySelectorAll(".phase-row");
    function setPhase(n) {
      rows.forEach(function (r, i) {
        r.classList.toggle("active", i === n);
        var dot = r.querySelector(".dot");
        dot.className = i < n ? "dot" : i === n ? "dot spin" : "dot";
        if (i < n) dot.style.background = "#10b981";
      });
      if (extractLabel) extractLabel.textContent = PHASES[n] + "…";
    }
    setPhase(0);
    setTimeout(function () { setPhase(1); }, 2200);
    setTimeout(function () { setPhase(2); }, 5500);
  });

  // --- Recording -> /api/transcribe ---
  var recordBtn = document.getElementById("record-btn");
  var recordStatus = document.getElementById("record-status");
  var mediaRecorder = null;
  var chunks = [];
  var timer = null;
  var seconds = 0;

  function fmt(s) {
    var m = Math.floor(s / 60);
    var r = s % 60;
    return m + ":" + (r < 10 ? "0" : "") + r;
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onloadend = function () { resolve(String(reader.result).split(",")[1]); };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function showStatus(text, show) {
    if (!recordStatus) return;
    recordStatus.textContent = text;
    recordStatus.style.display = show ? "inline" : "none";
  }

  async function transcribe(blob, mimeType) {
    showStatus("Transcribing…", true);
    try {
      var base64 = await blobToBase64(blob);
      var res = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audio: base64, mimeType: mimeType }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transcription failed");
      textarea.value = textarea.value ? textarea.value + "\n\n" + data.text : data.text;
      updateCount();
      showStatus("", false);
    } catch (err) {
      showStatus("Error: " + err.message, true);
    }
  }

  if (recordBtn) {
    recordBtn.addEventListener("click", async function () {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        return;
      }
      try {
        var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        var mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4";
        mediaRecorder = new MediaRecorder(stream, { mimeType: mimeType });
        chunks = [];
        seconds = 0;
        mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };
        mediaRecorder.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          if (timer) clearInterval(timer);
          recordBtn.classList.remove("recording");
          recordBtn.textContent = "🎙 Record meeting";
          transcribe(new Blob(chunks, { type: mimeType }), mimeType);
        };
        mediaRecorder.start();
        recordBtn.classList.add("recording");
        timer = setInterval(function () {
          seconds++;
          recordBtn.textContent = "■ Stop · " + fmt(seconds);
        }, 1000);
        recordBtn.textContent = "■ Stop · 0:00";
      } catch (err) {
        showStatus("Microphone access denied.", true);
      }
    });
  }
})();
