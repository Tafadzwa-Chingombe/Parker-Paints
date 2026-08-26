(function () {
  "use strict";

  /* Nav drawer */
  var navOpen = document.querySelector("[data-nav-open]");
  var navClose = document.querySelector("[data-nav-close]");
  var drawer = document.querySelector(".nav-drawer");
  if (navOpen && drawer) navOpen.addEventListener("click", function () { drawer.classList.add("is-open"); });
  if (navClose && drawer) navClose.addEventListener("click", function () { drawer.classList.remove("is-open"); });
  if (drawer) {
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { drawer.classList.remove("is-open"); });
    });
  }

  /* FAQ accordion */
  document.querySelectorAll(".faq-item__q").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".faq-item").classList.toggle("is-open");
    });
  });
  document.querySelectorAll("[data-faq-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-faq-filter]").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var filter = btn.dataset.faqFilter;
      document.querySelectorAll(".faq-item").forEach(function (item) {
        item.style.display = (filter === "all" || item.dataset.faqCat === filter) ? "" : "none";
      });
    });
  });

  /* Products page — family picker filter */
  document.querySelectorAll("[data-family-picker] [data-family]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-family-picker] [data-family]").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var fam = btn.dataset.family;
      document.querySelectorAll(".wall-tile").forEach(function (tile) {
        tile.style.display = (fam === "all" || tile.dataset.family === fam) ? "" : "none";
      });
    });
  });

  /* Colour Catalogue — filter chips (top bar + sidebar both use [data-cat-filter]) */
  document.querySelectorAll("[data-cat-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll("[data-cat-filter]").forEach(function (b) { b.classList.remove("is-active"); });
      btn.classList.add("is-active");
      var fam = btn.dataset.catFilter;
      document.querySelectorAll(".swatch-card").forEach(function (card) {
        card.style.display = (fam === "all" || card.dataset.family === fam) ? "" : "none";
      });
    });
  });

  /* Generic pill-toggle / option-row groups (Paint Calculator tabs, wall condition, coats) */
  document.querySelectorAll("[data-toggle]").forEach(function (group) {
    var buttons = group.querySelectorAll("button");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
        if (group.dataset.toggle === "calc-mode") {
          var isAdvanced = btn.dataset.value === "advanced";
          var panel = document.querySelector('[data-mode-panel="advanced"]');
          if (panel) panel.style.display = isAdvanced ? "" : "none";
        }
        if (group.dataset.toggle === "coats" || group.dataset.toggle === "wall-condition") {
          runCalculator();
        }
      });
    });
  });

  /* Paint Calculator — steppers */
  var stepState = { doors: 2, windows: 2, extra: 2 };
  document.querySelectorAll("[data-step-plus]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.stepPlus;
      stepState[key] = Math.min(20, stepState[key] + 1);
      var el = document.getElementById("calc" + key.charAt(0).toUpperCase() + key.slice(1));
      if (el) el.textContent = stepState[key];
      runCalculator();
    });
  });
  document.querySelectorAll("[data-step-minus]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var key = btn.dataset.stepMinus;
      stepState[key] = Math.max(0, stepState[key] - 1);
      var el = document.getElementById("calc" + key.charAt(0).toUpperCase() + key.slice(1));
      if (el) el.textContent = stepState[key];
      runCalculator();
    });
  });

  /* Paint Calculator — live estimate */
  var SQM_TO_SQFT = 10.7639;
  var DOOR_M2 = 1.8 * 2.1;
  var WINDOW_M2 = 1.2 * 1.0;
  var COVERAGE_M2_PER_L = 9; // average wall-coating coverage
  var TOPCOAT_PRICE_PER_L = 3.76;
  var UNDERCOAT_PRICE_PER_L = 2.73;

  function runCalculator() {
    var lengthEl = document.getElementById("calcLength");
    if (!lengthEl) return; // not on this page
    var length = parseFloat(lengthEl.value) || 0;
    var width = parseFloat(document.getElementById("calcWidth").value) || 0;
    var height = parseFloat(document.getElementById("calcHeight").value) || 0;
    var coatsBtn = document.querySelector('[data-toggle="coats"] .is-active');
    var coats = coatsBtn ? parseInt(coatsBtn.dataset.value, 10) : 2;
    var conditionBtn = document.querySelector('[data-toggle="wall-condition"] .is-active');
    var needsPrimer = conditionBtn ? conditionBtn.dataset.value !== "repaint" : true;

    var wallArea = 2 * (length + width) * height; // m²
    var deductions = stepState.doors * DOOR_M2 + stepState.windows * WINDOW_M2 + stepState.extra * 0.0929;
    var paintableM2 = Math.max(0, wallArea - deductions);
    var paintableSqft = paintableM2 * SQM_TO_SQFT;

    var topcoatLitres = (paintableM2 * coats / COVERAGE_M2_PER_L) * 1.1;
    var undercoatLitres = needsPrimer ? (paintableM2 / COVERAGE_M2_PER_L) * 1.1 : 0;

    var topcoatCost = topcoatLitres * TOPCOAT_PRICE_PER_L;
    var undercoatCost = undercoatLitres * UNDERCOAT_PRICE_PER_L;
    var toolsCost = 18 + 12;
    var total = topcoatCost + undercoatCost + toolsCost;

    setText("resArea", Math.round(paintableSqft).toLocaleString());
    setText("resAreaNote", "After deducting " + stepState.doors + " doors + " + stepState.windows + " windows");
    setText("resLitres", topcoatLitres.toFixed(1));
    setText("resCoats", coats + (coats === 1 ? " coat" : " coats"));
    setText("resCoatsInline", coats);
    setText("resDryTime", needsPrimer ? "6 - 8 hours" : "4 - 6 hours");
    setText("resTopcoatQty", topcoatLitres.toFixed(1) + " L");
    setText("resTopcoatCost", "$" + topcoatCost.toFixed(2));
    setText("resUndercoatQty", undercoatLitres.toFixed(1) + " L");
    setText("resUndercoatCost", "$" + undercoatCost.toFixed(2));
    setText("resTotal", "$" + total.toFixed(2));
  }
  function setText(id, val) {
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }
  ["calcLength", "calcWidth", "calcHeight"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("input", runCalculator);
  });
  var runBtn = document.querySelector("[data-calc-run]");
  if (runBtn) runBtn.addEventListener("click", runCalculator);
  var resetBtn = document.querySelector("[data-calc-reset]");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      document.getElementById("calcLength").value = 5;
      document.getElementById("calcWidth").value = 4;
      document.getElementById("calcHeight").value = 2.7;
      stepState = { doors: 2, windows: 2, extra: 2 };
      setText("calcDoors", 2); setText("calcWindows", 2); setText("calcExtra", 2);
      runCalculator();
    });
  }
  if (document.getElementById("calcLength")) runCalculator();

  /* Area slider — informational chip only (dimension fields remain the source of truth) */
  var slider = document.getElementById("calcAreaSlider");
  if (slider) {
    slider.addEventListener("input", function () {
      var val = parseInt(slider.value, 10);
      setText("calcAreaChipVal", val > 0 ? val.toLocaleString() + " sq ft" : "Using dimensions above");
    });
  }

  /* Multi-room — remove / add room cards (visual only, recalculates totals count) */
  document.querySelectorAll(".room-card__remove").forEach(function (btn) {
    btn.addEventListener("click", function () {
      btn.closest(".room-card").remove();
    });
  });

  /* Contact form */
  var contactForm = document.querySelector(".js-contact-form");
  if (contactForm) {
    var statusEl = contactForm.querySelector(".form-status");
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var honeypot = contactForm.querySelector('input[name="website"]');
      if (honeypot && honeypot.value) return;
      if (statusEl) { statusEl.textContent = "Sending…"; statusEl.style.color = "var(--text-body)"; }

      fetch(contactForm.getAttribute("action"), { method: "POST", body: new FormData(contactForm) })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
        .then(function (data) {
          if (statusEl) { statusEl.textContent = data.message || "Thanks — we'll be in touch shortly."; statusEl.style.color = "#2d7d52"; }
          contactForm.reset();
        })
        .catch(function () {
          if (statusEl) { statusEl.textContent = "Something went wrong. Please email us directly at info@parkerpaints.co.zw."; statusEl.style.color = "#c0392b"; }
        });
    });
  }

  /* Newsletter form (footer, every page) */
  document.querySelectorAll(".newsletter-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = form.parentElement.querySelector(".form-status");
      fetch(form.getAttribute("action") || "php/newsletter-handler.php", { method: "POST", body: new FormData(form) })
        .then(function (res) { return res.ok ? res.json() : Promise.reject(); })
        .then(function (data) {
          if (status) status.textContent = data.message || "Subscribed!";
          form.reset();
        })
        .catch(function () {
          if (status) status.textContent = "Couldn't subscribe — please try again later.";
        });
    });
  });
})();
