// Review page: selection, bulk edits, delete, filter, expand, destination, push.
(function () {
  var rowsWrap = document.getElementById("rows");
  if (!rowsWrap) return;

  var selectAll = document.getElementById("select-all");
  var bulkBar = document.getElementById("bulk-bar");
  var bulkCount = document.getElementById("bulk-count");
  var bulkPriority = document.getElementById("bulk-priority");
  var bulkAssignee = document.getElementById("bulk-assignee");
  var bulkDelete = document.getElementById("bulk-delete");
  var bulkClear = document.getElementById("bulk-clear");
  var filterInput = document.getElementById("filter-input");
  var lowToggle = document.getElementById("lowconf-toggle");
  var showingCount = document.getElementById("showing-count");
  var pushCount = document.getElementById("push-count");
  var form = document.getElementById("review-form");
  var pushBtn = document.getElementById("push-btn");

  var lowOnly = false;

  function rows() {
    return Array.prototype.slice.call(rowsWrap.querySelectorAll(".review-row"));
  }
  function visibleRows() {
    return rows().filter(function (r) { return !r.classList.contains("hidden-row"); });
  }
  function selectedRows() {
    return rows().filter(function (r) {
      var cb = r.querySelector(".row-select");
      return cb && cb.checked;
    });
  }

  function updateCounts() {
    var total = rows().length;
    var vis = visibleRows().length;
    if (showingCount) {
      showingCount.textContent = "Showing " + vis + " of " + total + " item" + (total === 1 ? "" : "s");
    }
    if (pushCount) pushCount.textContent = total;
  }

  function updateBulkBar() {
    var n = selectedRows().length;
    if (bulkCount) bulkCount.textContent = n;
    if (bulkBar) bulkBar.style.display = n > 0 ? "flex" : "none";
    // select-all reflects whether all visible rows are checked.
    var vis = visibleRows();
    if (selectAll) {
      selectAll.checked = vis.length > 0 && vis.every(function (r) {
        return r.querySelector(".row-select").checked;
      });
    }
  }

  function applyFilter() {
    var q = (filterInput ? filterInput.value : "").trim().toLowerCase();
    rows().forEach(function (r) {
      var matchQ = !q || (r.dataset.search || "").indexOf(q) !== -1;
      var isLow = parseFloat(r.dataset.conf) < 0.85;
      var show = matchQ && (!lowOnly || isLow);
      r.classList.toggle("hidden-row", !show);
    });
    updateCounts();
    updateBulkBar();
  }

  // --- selection ---
  rowsWrap.addEventListener("change", function (e) {
    if (e.target.classList.contains("row-select")) updateBulkBar();
  });

  if (selectAll) {
    selectAll.addEventListener("change", function () {
      visibleRows().forEach(function (r) {
        r.querySelector(".row-select").checked = selectAll.checked;
      });
      updateBulkBar();
    });
  }

  // --- expand / delete (event-delegated) ---
  rowsWrap.addEventListener("click", function (e) {
    var toggle = e.target.closest(".expand-toggle");
    if (toggle) {
      var row = toggle.closest(".review-row");
      var panel = row.querySelector(".expand-panel");
      var open = panel.style.display !== "none";
      panel.style.display = open ? "none" : "block";
      toggle.textContent = open ? "▸" : "▾";
      return;
    }
    var del = e.target.closest(".row-delete");
    if (del) {
      del.closest(".review-row").remove();
      updateCounts();
      updateBulkBar();
    }
  });

  // --- bulk actions ---
  if (bulkPriority) {
    bulkPriority.addEventListener("change", function () {
      if (!bulkPriority.value) return;
      selectedRows().forEach(function (r) {
        r.querySelector('select[name="priority"]').value = bulkPriority.value;
      });
      bulkPriority.value = "";
    });
  }
  if (bulkAssignee) {
    bulkAssignee.addEventListener("change", function () {
      if (!bulkAssignee.value) return;
      var v = bulkAssignee.value === "__none__" ? "" : bulkAssignee.value;
      selectedRows().forEach(function (r) {
        r.querySelector(".assignee-select").value = v;
      });
      bulkAssignee.value = "";
    });
  }
  if (bulkDelete) {
    bulkDelete.addEventListener("click", function () {
      selectedRows().forEach(function (r) { r.remove(); });
      updateCounts();
      updateBulkBar();
    });
  }
  if (bulkClear) {
    bulkClear.addEventListener("click", function () {
      rows().forEach(function (r) { r.querySelector(".row-select").checked = false; });
      updateBulkBar();
    });
  }

  // --- filter + low-confidence toggle ---
  if (filterInput) filterInput.addEventListener("input", applyFilter);
  if (lowToggle) {
    lowToggle.addEventListener("click", function () {
      lowOnly = !lowOnly;
      lowToggle.classList.toggle("on", lowOnly);
      lowToggle.textContent = lowOnly ? "⚠ Showing low-confidence only" : "⚠ Low confidence only";
      applyFilter();
    });
  }

  // --- destination switch (only Linear enabled for now) ---
  document.querySelectorAll(".dest-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (btn.disabled) return;
      document.querySelectorAll(".dest-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      document.getElementById("destination-input").value = btn.dataset.dest;
    });
  });

  // --- push loading state ---
  if (form && pushBtn) {
    form.addEventListener("submit", function () {
      pushBtn.disabled = true;
      pushBtn.textContent = "⬆ Pushing to Linear…";
    });
  }

  updateCounts();
})();
